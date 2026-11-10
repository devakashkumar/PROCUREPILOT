import { Request, Response } from "express";
import mongoose from "mongoose";
import { ProcurementRequest } from "../../models/ProcurementRequest.js";
import { Business } from "../../models/Business.js";
import { extractRequirements } from "../../services/ai/requirement.extractor.js";
import { ProductMatcher, ItemMatchResult } from "../../services/matching/product.matcher.js";
import { runOptimizationEngine } from "../../services/optimizer/optimizer.js";
import { generateExplanation } from "../../services/ai/explanation.generator.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES, DEFAULT_PAGE_SIZE } from "../../config/constants.js";
import { OptimizerItemInput } from "../../services/optimizer/types.js";

export class ProcurementController {
  /**
   * POST /api/procurement/analyze
   */
  static async analyze(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const userId = req.user?.id;

    if (!businessId || !userId) {
      throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Authentication required");
    }

    const { message } = req.body;
    const { requirements, usedFallback, aiModel } = await extractRequirements(message);

    // If no budget in prompt, default to business preference or 0
    let budgetPaise = requirements.budget.amountPaise;
    if (!budgetPaise) {
      const business = await Business.findById(businessId);
      if (business?.monthlyBudgetPaise) {
        // default 15% of monthly budget as default single-order ceiling
        budgetPaise = Math.round(business.monthlyBudgetPaise * 0.15);
        requirements.budget.amountPaise = budgetPaise;
      }
    }

    const procurementRequest = await ProcurementRequest.create({
      businessId: new mongoose.Types.ObjectId(businessId),
      userId: new mongoose.Types.ObjectId(userId),
      rawText: message,
      status: "ANALYZED",
      aiRequirements: requirements,
      aiModel,
      aiUsedFallback: usedFallback,
      budgetPaise: budgetPaise || undefined,
    });

    sendSuccess(
      res,
      {
        requestId: procurementRequest.id,
        requirements,
        aiModel,
        usedFallback,
      },
      201
    );
  }

  /**
   * POST /api/procurement/search
   */
  static async search(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { requestId, requirements: overrideRequirements, overrideProductIds } = req.body;

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

    // Use owner-edited requirements if supplied, otherwise stored requirements
    const activeRequirements = overrideRequirements || procurementRequest.aiRequirements;
    if (!activeRequirements || !activeRequirements.items || activeRequirements.items.length === 0) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "No items found in procurement request");
    }

    const matches: ItemMatchResult[] = [];
    const unmatched: unknown[] = [];

    for (let i = 0; i < activeRequirements.items.length; i++) {
      const item = activeRequirements.items[i]!;
      const overrideProdId = overrideProductIds ? overrideProductIds[item.name] : undefined;
      const matchResult = await ProductMatcher.matchItem(item, overrideProdId);

      if (matchResult.unmatched || !matchResult.selectedProduct) {
        unmatched.push({
          item,
          suggestions: matchResult.candidates.map((c) => ({
            id: c.product.id,
            name: c.product.name,
            score: c.matchScore,
          })),
        });
      } else {
        matches.push(matchResult);
      }
    }

    procurementRequest.aiRequirements = activeRequirements;
    procurementRequest.searchResults = matches;
    procurementRequest.status = "SEARCHED";
    await procurementRequest.save();

    sendSuccess(res, {
      requestId: procurementRequest.id,
      matches,
      unmatched,
    });
  }

  /**
   * POST /api/procurement/optimize
   */
  static async optimize(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { requestId, strategy = "balanced", overrides } = req.body;

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

    const matches = procurementRequest.searchResults as ItemMatchResult[] | undefined;
    if (!matches || matches.length === 0) {
      throw new ApiError(400, ERROR_CODES.INVALID_STATE, "Request must be searched before optimization");
    }

    const budgetPaise =
      overrides?.budgetPaise ||
      procurementRequest.budgetPaise ||
      procurementRequest.aiRequirements?.budget.amountPaise ||
      2000000; // default ₹20,000

    // Construct optimizer inputs
    const optimizerItems: OptimizerItemInput[] = matches.map((match) => {
      const chosenCandidate = match.candidates[0]!;
      return {
        productId: chosenCandidate.product.id,
        productName: chosenCandidate.product.name,
        quantity: match.requirement.quantity,
        unit: match.requirement.unit || chosenCandidate.product.unit || "unit",
        candidateOffers: chosenCandidate.offers,
      };
    });

    const optimizationResult = runOptimizationEngine({
      items: optimizerItems,
      budgetPaise,
      strategy,
      constraints: {
        minReliability: procurementRequest.aiRequirements?.constraints.minReliability,
        maxDeliveryDays: procurementRequest.aiRequirements?.constraints.maxDeliveryDays,
        preferredSuppliers: overrides?.preferredSuppliers || procurementRequest.aiRequirements?.constraints.preferredSuppliers,
        excludedSuppliers: overrides?.excludedSuppliers || procurementRequest.aiRequirements?.constraints.excludedSuppliers,
      },
    });

    // Generate AI explanation
    const explanation = await generateExplanation({
      strategy,
      totalPaise: optimizationResult.plan.totalPaise,
      budgetPaise: optimizationResult.plan.budgetPaise,
      remainingBudgetPaise: optimizationResult.plan.remainingBudgetPaise,
      averageReliability: optimizationResult.plan.averageReliability,
      maxDeliveryDays: optimizationResult.plan.maxDeliveryDays,
      supplierCount: optimizationResult.plan.supplierGroups.length,
      supplierNames: optimizationResult.plan.supplierGroups.map((g) => g.supplierName),
      itemCount: optimizationResult.plan.lines.length,
      warnings: optimizationResult.warnings,
    });

    procurementRequest.optimizationResult = optimizationResult;
    procurementRequest.explanation = explanation;
    procurementRequest.status = "OPTIMIZED";
    procurementRequest.budgetPaise = budgetPaise;
    await procurementRequest.save();

    sendSuccess(res, {
      requestId: procurementRequest.id,
      strategy,
      plan: optimizationResult.plan,
      alternatives: optimizationResult.alternatives,
      explanation,
      warnings: optimizationResult.warnings,
    });
  }

  /**
   * GET /api/procurement/requests
   */
  static async list(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      ProcurementRequest.find({ businessId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ProcurementRequest.countDocuments({ businessId }),
    ]);

    sendSuccess(res, {
      requests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  /**
   * GET /api/procurement/requests/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const businessId = req.businessId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id!)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid request ID");
    }

    const requestDoc = await ProcurementRequest.findOne({
      _id: id,
      businessId,
    });

    if (!requestDoc) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Procurement request not found");
    }

    sendSuccess(res, requestDoc);
  }
}
