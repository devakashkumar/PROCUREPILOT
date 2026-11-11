import { Request, Response } from "express";
import mongoose from "mongoose";
import { PurchaseOrder } from "../../models/PurchaseOrder.js";
import { Payment, IPayment } from "../../models/Payment.js";
import { WebhookEvent } from "../../models/WebhookEvent.js";
import { assertOrderTransition } from "../orders/orders.stateMachine.js";
import { PayPalOrdersService } from "../../services/paypal/paypal.orders.js";
import { PayPalWebhookService } from "../../services/paypal/paypal.webhooks.js";
import { CurrencyService } from "../../services/currency/currency.service.js";
import { generateIdempotencyKey } from "../../utils/idempotency.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES, ORDER_STATUS, PAYMENT_STATUS } from "../../config/constants.js";
import { centsToUsd, paiseToInr } from "../../utils/money.js";
import { logger } from "../../config/logger.js";

export class PaymentController {
  /**
   * POST /api/payments/create
   */
  static async create(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid orderId");
    }

    const order = await PurchaseOrder.findOne({ _id: orderId, businessId });
    if (!order) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Purchase order not found");
    }

    // Check for existing active payments for this order first (idempotent return)
    const existingPayment = await Payment.findOne({
      orderId: order._id,
      businessId,
      status: {
        $in: [
          PAYMENT_STATUS.CREATED,
          PAYMENT_STATUS.APPROVED,
          PAYMENT_STATUS.PENDING,
          PAYMENT_STATUS.COMPLETED,
        ],
      },
    });

    // Idempotent return if already CREATED or PENDING with a paypalOrderId
    if (
      existingPayment &&
      (existingPayment.status === PAYMENT_STATUS.CREATED ||
        existingPayment.status === PAYMENT_STATUS.PENDING) &&
      existingPayment.paypalOrderId
    ) {
      sendSuccess(res, {
        paymentId: existingPayment.id,
        paypalOrderId: existingPayment.paypalOrderId,
        amountUsd: centsToUsd(existingPayment.amountUsdCents),
        amountInr: paiseToInr(existingPayment.amountInrPaise),
        fxRate: existingPayment.fxRateInrPerUsd,
        fxNote: existingPayment.fxNote,
      });
      return;
    }

    if (existingPayment && existingPayment.status === PAYMENT_STATUS.COMPLETED) {
      throw new ApiError(400, ERROR_CODES.CONFLICT, "Order is already paid");
    }

    // Precondition: Order must be APPROVED, PAYMENT_FAILED, or PAYMENT_PENDING with active payment
    if (
      order.status !== ORDER_STATUS.APPROVED &&
      order.status !== ORDER_STATUS.PAYMENT_FAILED &&
      order.status !== ORDER_STATUS.PAYMENT_PENDING
    ) {
      throw new ApiError(
        400,
        ERROR_CODES.INVALID_STATE,
        `Cannot initiate payment for order in state ${order.status}. Order must be APPROVED.`
      );
    }

    // Authoritatively recompute total from lines in the database
    let authoritativeSubtotal = 0;
    for (const line of order.lines) {
      authoritativeSubtotal += line.lineTotalPaise;
    }
    const authoritativeTotalPaise = authoritativeSubtotal + order.shippingPaise;
    order.subtotalPaise = authoritativeSubtotal;
    order.totalPaise = authoritativeTotalPaise;

    // Convert to USD with configured demo conversion rate
    const fx = CurrencyService.convertInrToUsd(authoritativeTotalPaise);
    const idempotencyKey = generateIdempotencyKey("pp_order");

    const payment = new Payment({
      orderId: order._id,
      businessId: new mongoose.Types.ObjectId(businessId),
      provider: "paypal",
      status: PAYMENT_STATUS.CREATED,
      amountInrPaise: fx.amountInrPaise,
      amountUsdCents: fx.amountUsdCents,
      fxRateInrPerUsd: fx.fxRateInrPerUsd,
      fxNote: fx.fxNote,
      currency: "USD",
      idempotencyKey,
      history: [
        {
          status: PAYMENT_STATUS.CREATED,
          at: new Date(),
          source: "api",
          note: "Payment intent initiated",
        },
      ],
    });

    // Call PayPal Orders API v2
    const paypalOrder = await PayPalOrdersService.createOrder(order, payment, idempotencyKey);
    payment.paypalOrderId = paypalOrder.id;
    await payment.save();

    // Transition order to PAYMENT_PENDING
    assertOrderTransition(order.status, ORDER_STATUS.PAYMENT_PENDING);
    order.status = ORDER_STATUS.PAYMENT_PENDING;
    order.paymentId = payment._id;
    order.statusHistory.push({
      from: ORDER_STATUS.APPROVED,
      to: ORDER_STATUS.PAYMENT_PENDING,
      at: new Date(),
      by: new mongoose.Types.ObjectId(req.user?.id),
      note: `PayPal order created (${paypalOrder.id})`,
    });
    await order.save();

    sendSuccess(
      res,
      {
        paymentId: payment.id,
        paypalOrderId: paypalOrder.id,
        amountUsd: centsToUsd(payment.amountUsdCents),
        amountInr: paiseToInr(payment.amountInrPaise),
        fxRate: payment.fxRateInrPerUsd,
        fxNote: payment.fxNote,
      },
      201
    );
  }

  /**
   * POST /api/payments/capture
   */
  static async capture(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { paypalOrderId } = req.body;

    const payment = await Payment.findOne({ paypalOrderId, businessId });
    if (!payment) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Payment transaction not found");
    }

    // Idempotent: If already COMPLETED, return immediately
    if (payment.status === PAYMENT_STATUS.COMPLETED) {
      sendSuccess(res, {
        paymentId: payment.id,
        status: payment.status,
        capturedAt: payment.capturedAt,
        alreadyProcessed: true,
      });
      return;
    }

    const order = await PurchaseOrder.findOne({ _id: payment.orderId, businessId });
    if (!order) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Associated purchase order not found");
    }

    const idempotencyKey = generateIdempotencyKey("pp_cap");

    try {
      const captureResult = await PayPalOrdersService.captureOrder(paypalOrderId, idempotencyKey);

      // Extract capture details from PayPal response
      const capture = captureResult.purchase_units?.[0]?.payments?.captures?.[0];
      const captureStatus = capture?.status || captureResult.status;

      payment.rawProviderStatus = captureStatus;
      if (captureResult.payer) {
        payment.payerEmail = captureResult.payer.email_address;
        payment.payerId = captureResult.payer.payer_id;
      }

      if (captureStatus === "COMPLETED") {
        // --- STRICT SERVER-SIDE VERIFICATION ---
// --- STRICT SERVER-SIDE PAYMENT VERIFICATION ---

const capturedAmountValue = capture?.amount?.value;
const capturedCurrency = capture?.amount?.currency_code;
const capturedAmountUsd = Number(capturedAmountValue);
const storedAmountUsdCents = payment.amountUsdCents;

if (
  !capture ||
  !capture.id ||
  capturedCurrency !== "USD" ||
  !Number.isFinite(capturedAmountUsd) ||
  capturedAmountUsd <= 0 ||
  storedAmountUsdCents <= 0 ||
  Math.round(capturedAmountUsd * 100) !== storedAmountUsdCents
) {
  logger.error(
    {
      captureId: capture?.id,
      capturedAmountUsd,
      capturedCurrency,
      storedAmountUsdCents,
    },
    "PayPal capture verification failed"
  );

  throw new ApiError(
    400,
    ERROR_CODES.PAYMENT_ERROR,
    "Captured payment amount or currency does not match the authoritative payment record"
  );
}


        payment.paypalCaptureId = capture?.id || captureResult.id;
        payment.status = PAYMENT_STATUS.COMPLETED;
        payment.capturedAt = new Date();
        payment.history.push({
          status: PAYMENT_STATUS.COMPLETED,
          at: new Date(),
          source: "api",
          note: `Captured via PayPal API (Capture ID: ${payment.paypalCaptureId})`,
        });
        await payment.save();

        // Update purchase order to PAID
        assertOrderTransition(order.status, ORDER_STATUS.PAID);
        order.status = ORDER_STATUS.PAID;
        order.statusHistory.push({
          from: ORDER_STATUS.PAYMENT_PENDING,
          to: ORDER_STATUS.PAID,
          at: new Date(),
          by: new mongoose.Types.ObjectId(req.user?.id),
          note: `Payment verified and completed via PayPal (${payment.paypalCaptureId})`,
        });
        await order.save();

        sendSuccess(res, {
          paymentId: payment.id,
          status: PAYMENT_STATUS.COMPLETED,
          captureId: payment.paypalCaptureId,
          capturedAt: payment.capturedAt,
          orderStatus: ORDER_STATUS.PAID,
        });
        return;
      }

      if (captureStatus === "PENDING") {
        payment.status = PAYMENT_STATUS.PENDING;
        payment.history.push({
          status: PAYMENT_STATUS.PENDING,
          at: new Date(),
          source: "api",
          note: "Payment marked pending by PayPal",
        });
        await payment.save();

        sendSuccess(res, {
          paymentId: payment.id,
          status: PAYMENT_STATUS.PENDING,
          note: "Payment is pending clearance with PayPal",
        });
        return;
      }

      // Any other non-completed status is treated as failed
      payment.status = PAYMENT_STATUS.FAILED;
      payment.failureReason = `PayPal returned status: ${captureStatus}`;
      payment.history.push({
        status: PAYMENT_STATUS.FAILED,
        at: new Date(),
        source: "api",
        note: payment.failureReason,
      });
      await payment.save();

      order.status = ORDER_STATUS.PAYMENT_FAILED;
      order.statusHistory.push({
        from: ORDER_STATUS.PAYMENT_PENDING,
        to: ORDER_STATUS.PAYMENT_FAILED,
        at: new Date(),
        by: new mongoose.Types.ObjectId(req.user?.id),
        note: `Payment failed: ${payment.failureReason}`,
      });
      await order.save();

      throw new ApiError(400, ERROR_CODES.PAYMENT_ERROR, "Payment was declined or failed by PayPal");
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error({ error }, "Error capturing PayPal order");
      throw new ApiError(500, ERROR_CODES.PAYMENT_ERROR, "Unable to capture PayPal payment");
    }
  }

  /**
   * POST /api/payments/cancel
   * Called if buyer cancels in the PayPal window.
   */
  static async cancel(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { paypalOrderId } = req.body;

    const payment = await Payment.findOne({ paypalOrderId, businessId });
    if (!payment) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Payment transaction not found");
    }

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      payment.status = PAYMENT_STATUS.CANCELLED;
      payment.history.push({
        status: PAYMENT_STATUS.CANCELLED,
        at: new Date(),
        source: "api",
        note: "Cancelled by buyer at checkout",
      });
      await payment.save();

      const order = await PurchaseOrder.findOne({ _id: payment.orderId, businessId });
      if (order && order.status === ORDER_STATUS.PAYMENT_PENDING) {
        order.status = ORDER_STATUS.APPROVED; // Allow retry
        order.statusHistory.push({
          from: ORDER_STATUS.PAYMENT_PENDING,
          to: ORDER_STATUS.APPROVED,
          at: new Date(),
          by: new mongoose.Types.ObjectId(req.user?.id),
          note: "Checkout cancelled by user; returned to approved state",
        });
        await order.save();
      }
    }

    sendSuccess(res, { payment });
  }

  /**
   * GET /api/payments/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id!)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid payment ID");
    }

    const payment = await Payment.findOne({ _id: id, businessId });
    if (!payment) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Payment not found");
    }

    sendSuccess(res, payment);
  }

  /**
   * POST /api/payments/webhook
   * Mounted with express.raw() to guarantee byte-for-byte signature verification.
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    const authAlgo = req.headers["paypal-auth-algo"] as string;
    const certUrl = req.headers["paypal-cert-url"] as string;
    const transmissionId = req.headers["paypal-transmission-id"] as string;
    const transmissionSig = req.headers["paypal-transmission-sig"] as string;
    const transmissionTime = req.headers["paypal-transmission-time"] as string;

    let event: {
      id?: string;
      event_type?: string;
      resource_type?: string;
      resource?: Record<string, unknown>;
    } = {};

    try {
      const rawBodyString = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
      event = JSON.parse(rawBodyString);
    } catch {
      sendError(res, ERROR_CODES.VALIDATION_ERROR, "Invalid webhook body JSON", 400);
      return;
    }

    const providerEventId = event.id;
    const eventType = event.event_type || "UNKNOWN";

    if (!providerEventId) {
      sendError(res, ERROR_CODES.VALIDATION_ERROR, "Missing webhook event ID", 400);
      return;
    }

    // 1. DUPLICATE PROTECTION: Insert WebhookEvent with unique providerEventId
    try {
      await WebhookEvent.create({
        providerEventId,
        eventType,
        resourceId: (event.resource?.id as string) || undefined,
        verified: false,
        processed: false,
        outcome: "APPLIED",
        payloadSummary: {
          id: event.id,
          eventType: event.event_type,
          resourceType: event.resource_type,
        },
        receivedAt: new Date(),
      });
    } catch (err: unknown) {
      // Duplicate event detected (Mongo 11000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((err as any).code === 11000) {
        logger.info({ providerEventId, eventType }, "Duplicate webhook event received; ignoring safely");
        res.status(200).json({ status: "IGNORED_DUPLICATE" });
        return;
      }
      throw err;
    }

    // 2. SIGNATURE VERIFICATION
    const isVerified = await PayPalWebhookService.verifySignature({
      authAlgo,
      certUrl,
      transmissionId,
      transmissionSig,
      transmissionTime,
      webhookEvent: event as Record<string, unknown>,
    });

    if (!isVerified) {
      logger.warn({ providerEventId, eventType }, "PayPal webhook signature verification failed");
      await WebhookEvent.findOneAndUpdate(
        { providerEventId },
        { verified: false, outcome: "FAILED", processed: true, processedAt: new Date() }
      );
      sendError(res, ERROR_CODES.WEBHOOK_VERIFICATION_FAILED, "Webhook signature verification failed", 400);
      return;
    }

    // Mark verified
    await WebhookEvent.findOneAndUpdate({ providerEventId }, { verified: true });

    // 3. EVENT PROCESSING (IDEMPOTENT)
    try {
      await PaymentController.processWebhookEvent(eventType, event.resource || {});
      await WebhookEvent.findOneAndUpdate(
        { providerEventId },
        { processed: true, processedAt: new Date(), outcome: "APPLIED" }
      );
    } catch (error) {
      logger.error({ error, providerEventId, eventType }, "Error processing verified webhook event");
      await WebhookEvent.findOneAndUpdate(
        { providerEventId },
        { processed: true, processedAt: new Date(), outcome: "FAILED" }
      );
    }

    res.status(200).json({ status: "SUCCESS" });
  }

  private static async processWebhookEvent(
    eventType: string,
    resource: Record<string, unknown>
  ): Promise<void> {
    logger.info({ eventType, resourceId: resource.id }, "Processing verified PayPal webhook event");

    // Look for matching payment by custom_id, paypalOrderId, or captureId
    const paypalOrderId = (resource.supplementary_data as { related_ids?: { order_id?: string } })
      ?.related_ids?.order_id || (resource.id as string);
    const customId = (resource.custom_id as string) || undefined;

    let payment: IPayment | null = null;
    if (customId && mongoose.Types.ObjectId.isValid(customId)) {
      payment = await Payment.findOne({ orderId: customId });
    }
    if (!payment && paypalOrderId) {
      payment = await Payment.findOne({
        $or: [{ paypalOrderId }, { paypalCaptureId: resource.id as string }],
      });
    }

    if (!payment) {
      logger.info({ resourceId: resource.id, eventType }, "No matching payment record found for webhook");
      return;
    }
     if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
  const amount = resource.amount as
    | { currency_code?: string; value?: string }
    | undefined;

  const capturedAmountUsd = Number(amount?.value);
  const expectedAmountUsdCents = payment.amountUsdCents;

  const isValidCapture =
    typeof resource.id === "string" &&
    resource.id.length > 0 &&
    payment.currency === "USD" &&
    amount?.currency_code === "USD" &&
    Number.isFinite(capturedAmountUsd) &&
    capturedAmountUsd > 0 &&
    expectedAmountUsdCents > 0 &&
    Math.round(capturedAmountUsd * 100) === expectedAmountUsdCents;

  if (!isValidCapture) {
    logger.error(
      {
        resourceId: resource.id,
        receivedCurrency: amount?.currency_code,
        receivedAmount: amount?.value,
        expectedCurrency: payment.currency,
        expectedAmountUsdCents,
      },
      "PayPal webhook payment verification failed"
    );

    throw new Error(
      "PayPal webhook capture amount or currency does not match the payment record"
    );
  }

  payment.verifiedByWebhookAt = new Date();
  payment.status = PAYMENT_STATUS.COMPLETED;
  payment.paypalCaptureId = resource.id as string;
  payment.capturedAt = new Date();

  payment.history.push({
    status: PAYMENT_STATUS.COMPLETED,
    at: new Date(),
    source: "webhook",
    note: `Confirmed via verified webhook PAYMENT.CAPTURE.COMPLETED (${resource.id})`,
  });

  await payment.save();

  // Ensure the associated purchase order is marked PAID.
  const order = await PurchaseOrder.findById(payment.orderId);

  if (order && order.status !== ORDER_STATUS.PAID) {
    const previousStatus = order.status;

    order.status = ORDER_STATUS.PAID;
    order.statusHistory.push({
      from: previousStatus,
      to: ORDER_STATUS.PAID,
      at: new Date(),
      note: "Marked paid via verified PayPal webhook",
    });

    await order.save();
  }
}
     else if (eventType === "PAYMENT.CAPTURE.DENIED") {
      payment.status = PAYMENT_STATUS.FAILED;
      payment.failureReason = "PayPal webhook PAYMENT.CAPTURE.DENIED";
      payment.history.push({
        status: PAYMENT_STATUS.FAILED,
        at: new Date(),
        source: "webhook",
        note: "Captured denied via webhook",
      });
      await payment.save();

      const order = await PurchaseOrder.findById(payment.orderId);
      if (order && order.status !== ORDER_STATUS.PAID) {
        order.status = ORDER_STATUS.PAYMENT_FAILED;
        order.statusHistory.push({
          from: order.status,
          to: ORDER_STATUS.PAYMENT_FAILED,
          at: new Date(),
          note: "Payment denied via webhook",
        });
        await order.save();
      }
    } else if (eventType === "PAYMENT.CAPTURE.REFUNDED") {
      payment.status = PAYMENT_STATUS.REFUNDED;
      payment.history.push({
        status: PAYMENT_STATUS.REFUNDED,
        at: new Date(),
        source: "webhook",
        note: "Payment refunded via webhook",
      });
      await payment.save();
    }
  }
}
