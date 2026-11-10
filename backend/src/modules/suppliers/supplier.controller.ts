import { Request, Response } from "express";
import { Supplier } from "../../models/Supplier.js";
import { SupplierOffer } from "../../models/SupplierOffer.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES, DEFAULT_PAGE_SIZE } from "../../config/constants.js";
import mongoose from "mongoose";

export class SupplierController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const { city, minReliability } = req.query;

    const filter: Record<string, unknown> = {};

    if (city && typeof city === "string") {
      filter.city = new RegExp(city, "i");
    }

    if (minReliability) {
      filter.reliabilityScore = { $gte: Number(minReliability) };
    }

    const [suppliers, total] = await Promise.all([
      Supplier.find(filter).sort({ reliabilityScore: -1 }).skip(skip).limit(limit),
      Supplier.countDocuments(filter),
    ]);

    // Count active offers per supplier
    const supplierIds = suppliers.map((s) => s._id);
    const offers = await SupplierOffer.find({
      supplierId: { $in: supplierIds },
      isActive: true,
    });

    const enriched = suppliers.map((sup) => {
      const supOffers = offers.filter((o) => o.supplierId.toString() === sup.id);
      return {
        ...sup.toJSON(),
        activeCatalogCount: supOffers.length,
      };
    });

    sendSuccess(res, {
      suppliers: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid supplier ID");
    }

    const supplier = await Supplier.findById(id);
    if (!supplier) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Supplier not found");
    }

    const offers = await SupplierOffer.find({
      supplierId: supplier._id,
      isActive: true,
    })
      .populate("productId", "name slug category brand unit packSize imageUrl")
      .sort({ pricePaise: 1 });

    sendSuccess(res, {
      supplier,
      offers,
    });
  }
}
