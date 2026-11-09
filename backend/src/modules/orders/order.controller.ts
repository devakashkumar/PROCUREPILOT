import { Request, Response } from "express";
import mongoose from "mongoose";
import { PurchaseOrder, IPurchaseOrder } from "../../models/PurchaseOrder.js";
import { ProcurementRequest } from "../../models/ProcurementRequest.js";
import { SupplierOffer } from "../../models/SupplierOffer.js";
import { Supplier } from "../../models/Supplier.js";
import { Payment } from "../../models/Payment.js";
import { getNextSequence } from "../../models/Counter.js";
import { assertOrderTransition } from "./orders.stateMachine.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES, ORDER_STATUS, DEFAULT_PAGE_SIZE } from "../../config/constants.js";
import { OptimizedPlan, OptimizedLineItem } from "../../services/optimizer/types.js";
import { calculateEffectiveUnitPrice } from "../../services/matching/product.matcher.js";

export class OrderController {
  /**
   * POST /api/orders
   * Instantiates a Purchase Order directly from stored optimization plan.
   * Client NEVER sends lines or totals.
   */
  static async create(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const userId = req.user?.id;
    const { requestId, strategy = "balanced", notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid requestId");
    }

    const procurementRequest = await ProcurementRequest.findOne({
      _id: requestId,
      businessId,
    });

    if (!procurementRequest) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Procurement request not found");
    }

    if (!procurementRequest.optimizationResult) {
      throw new ApiError(400, ERROR_CODES.INVALID_STATE, "Request must be optimized before creating an order");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const optResult = procurementRequest.optimizationResult as any;
    let chosenPlan: OptimizedPlan = optResult.plan;

    // If strategy requested is one of the alternatives, find it
    if (strategy !== optResult.strategy && optResult.alternatives) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const matchAlt = optResult.alternatives.find((a: any) => a.strategy === strategy);
      if (matchAlt) {
        chosenPlan = matchAlt;
      }
    }

    if (!chosenPlan || !chosenPlan.lines || chosenPlan.lines.length === 0) {
      throw new ApiError(400, ERROR_CODES.INVALID_STATE, "No valid plan available to instantiate order");
    }

    // --- RE-VALIDATE AGAINST LIVE OFFERS ---
    const liveLines: IPurchaseOrder["lines"] = [];
    const warnings: string[] = [];
    let authorativeSubtotal = 0;

    for (const line of chosenPlan.lines as OptimizedLineItem[]) {
      const offer = await SupplierOffer.findById(line.offerId).populate<{ supplierId: { _id: string; name: string } }>(
        "supplierId"
      );

      if (!offer || !offer.isActive) {
        throw new ApiError(
          400,
          ERROR_CODES.INVALID_STATE,
          `Offer for ${line.productName} is no longer active. Please re-run optimization.`
        );
      }

      if (offer.stockQty < line.quantity) {
        throw new ApiError(
          400,
          ERROR_CODES.INVALID_STATE,
          `Insufficient stock for ${line.productName}. Available: ${offer.stockQty}, Required: ${line.quantity}. Please re-optimize.`
        );
      }

      const { unitPricePaise } = calculateEffectiveUnitPrice(offer, line.quantity);
      if (unitPricePaise !== line.unitPricePaise) {
        warnings.push(`Price for ${line.productName} updated from ₹${line.unitPricePaise / 100} to ₹${unitPricePaise / 100}.`);
      }

      const lineTotal = unitPricePaise * line.quantity;
      authorativeSubtotal += lineTotal;

      liveLines.push({
        productId: new mongoose.Types.ObjectId(line.productId),
        productName: line.productName,
        supplierId: new mongoose.Types.ObjectId(offer.supplierId._id),
        supplierName: offer.supplierId.name,
        offerId: offer._id,
        quantity: line.quantity,
        unit: line.unit,
        unitPricePaise,
        lineTotalPaise: lineTotal,
        deliveryDays: offer.deliveryDays,
        reliabilityScore: line.reliabilityScore,
      });
    }

    // Recompute supplier groups & shipping authoritatively
    const supplierMap = new Map<
      string,
      {
        supplierId: mongoose.Types.ObjectId;
        supplierName: string;
        subtotalPaise: number;
        deliveryDays: number;
        lineCount: number;
      }
    >();

    for (const l of liveLines) {
      const sid = l.supplierId.toString();
      const existing = supplierMap.get(sid);
      if (!existing) {
        supplierMap.set(sid, {
          supplierId: l.supplierId,
          supplierName: l.supplierName,
          subtotalPaise: l.lineTotalPaise,
          deliveryDays: l.deliveryDays || 3,
          lineCount: 1,
        });
      } else {
        existing.subtotalPaise += l.lineTotalPaise;
        existing.deliveryDays = Math.max(existing.deliveryDays, l.deliveryDays || 3);
        existing.lineCount += 1;
      }
    }

    let authoritativeShipping = 0;
    const authoritativeGroups: IPurchaseOrder["supplierGroups"] = [];

    for (const g of supplierMap.values()) {
      const supplier = await Supplier.findById(g.supplierId);
      let shipPaise = supplier?.shippingFeePaise || 0;
      if (supplier && supplier.freeShippingAbovePaise > 0 && g.subtotalPaise >= supplier.freeShippingAbovePaise) {
        shipPaise = 0;
      }
      authoritativeShipping += shipPaise;

      authoritativeGroups.push({
        supplierId: g.supplierId,
        supplierName: g.supplierName,
        subtotalPaise: g.subtotalPaise,
        shippingPaise: shipPaise,
        deliveryDays: g.deliveryDays,
        lineCount: g.lineCount,
      });
    }

    const authoritativeTotal = authorativeSubtotal + authoritativeShipping;
    const budgetPaise = procurementRequest.budgetPaise || chosenPlan.budgetPaise;

    // Verify budget
    if (authoritativeTotal > budgetPaise) {
      throw new ApiError(
        400,
        ERROR_CODES.BUDGET_EXCEEDED,
        `Recomputed order total (₹${authoritativeTotal / 100}) exceeds budget limit (₹${budgetPaise / 100})`
      );
    }

    // Generate atomic human-friendly orderNumber
    const seq = await getNextSequence("purchase_orders");
    const year = new Date().getFullYear();
    const orderNumber = `PO-${year}-${String(seq).padStart(6, "0")}`;

    const order = await PurchaseOrder.create({
      orderNumber,
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(userId),
      procurementRequestId: procurementRequest._id,
      status: ORDER_STATUS.PENDING_APPROVAL,
      lines: liveLines,
      supplierGroups: authoritativeGroups,
      subtotalPaise: authorativeSubtotal,
      shippingPaise: authoritativeShipping,
      totalPaise: authoritativeTotal,
      budgetPaise,
      estimatedSavingsPaise: chosenPlan.estimatedSavingsPaise || 0,
      currency: "INR",
      approval: {},
      statusHistory: [
        {
          from: ORDER_STATUS.DRAFT,
          to: ORDER_STATUS.PENDING_APPROVAL,
          at: new Date(),
          by: new mongoose.Types.ObjectId(userId),
          note: "Order created from validated optimization plan",
        },
      ],
      notes,
      aiExplanation: procurementRequest.explanation,
    });

    procurementRequest.status = "ORDERED";
    await procurementRequest.save();

    sendSuccess(
      res,
      {
        order,
        warnings,
      },
      201
    );
  }

  /**
   * GET /api/orders
   */
  static async list(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const { status, search } = req.query;

    const filter: Record<string, unknown> = { businessId };

    if (status && typeof status === "string") {
      filter.status = status;
    }

    if (search && typeof search === "string" && search.trim()) {
      filter.orderNumber = new RegExp(search.trim(), "i");
    }

    const [orders, total] = await Promise.all([
      PurchaseOrder.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      PurchaseOrder.countDocuments(filter),
    ]);

    sendSuccess(res, {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * GET /api/orders/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id!)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid order ID");
    }

    // Scoped by businessId: Multi-tenant safety (404 not 403 for foreign resources)
    const order = await PurchaseOrder.findOne({
      _id: id,
      businessId,
    });

    if (!order) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Purchase order not found");
    }

    // Attach payment info if present
    let payment = null;
    if (order.paymentId) {
      payment = await Payment.findOne({ _id: order.paymentId, businessId });
    } else {
      payment = await Payment.findOne({ orderId: order._id, businessId }).sort({ createdAt: -1 });
    }

    sendSuccess(res, {
      order,
      payment,
    });
  }

  /**
   * POST /api/orders/:id/approve
   */
  static async approve(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const userId = req.user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id!)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid order ID");
    }

    const order = await PurchaseOrder.findOne({ _id: id, businessId });
    if (!order) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Purchase order not found");
    }

    assertOrderTransition(order.status, ORDER_STATUS.APPROVED);

    // Re-verify totals
    let recomputedSubtotal = 0;
    for (const line of order.lines) {
      recomputedSubtotal += line.lineTotalPaise;
    }
    const recomputedTotal = recomputedSubtotal + order.shippingPaise;
    if (recomputedTotal !== order.totalPaise) {
      order.subtotalPaise = recomputedSubtotal;
      order.totalPaise = recomputedTotal;
    }

    order.status = ORDER_STATUS.APPROVED;
    order.approval = {
      approvedAt: new Date(),
      approvedBy: new mongoose.Types.ObjectId(userId),
    };
    order.statusHistory.push({
      from: ORDER_STATUS.PENDING_APPROVAL,
      to: ORDER_STATUS.APPROVED,
      at: new Date(),
      by: new mongoose.Types.ObjectId(userId),
      note: "Order approved by business owner",
    });

    await order.save();

    sendSuccess(res, { order });
  }

  /**
   * POST /api/orders/:id/reject
   */
  static async reject(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const userId = req.user?.id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id!)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid order ID");
    }

    const order = await PurchaseOrder.findOne({ _id: id, businessId });
    if (!order) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Purchase order not found");
    }

    assertOrderTransition(order.status, ORDER_STATUS.REJECTED);

    order.status = ORDER_STATUS.REJECTED;
    order.approval = {
      rejectedAt: new Date(),
      rejectedBy: new mongoose.Types.ObjectId(userId),
      reason,
    };
    order.statusHistory.push({
      from: order.status,
      to: ORDER_STATUS.REJECTED,
      at: new Date(),
      by: new mongoose.Types.ObjectId(userId),
      note: `Rejected: ${reason}`,
    });

    await order.save();

    sendSuccess(res, { order });
  }

  /**
   * POST /api/orders/:id/cancel
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const userId = req.user?.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id!)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid order ID");
    }

    const order = await PurchaseOrder.findOne({ _id: id, businessId });
    if (!order) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Purchase order not found");
    }

    assertOrderTransition(order.status, ORDER_STATUS.CANCELLED);

    const prevStatus = order.status;
    order.status = ORDER_STATUS.CANCELLED;
    order.statusHistory.push({
      from: prevStatus,
      to: ORDER_STATUS.CANCELLED,
      at: new Date(),
      by: new mongoose.Types.ObjectId(userId),
      note: "Order cancelled by business owner",
    });

    await order.save();

    sendSuccess(res, { order });
  }
}
