import { Request, Response } from "express";
import { Product } from "../../models/Product.js";
import { SupplierOffer } from "../../models/SupplierOffer.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES, DEFAULT_PAGE_SIZE } from "../../config/constants.js";
import mongoose from "mongoose";

export class ProductController {
  static async list(req: Request, res: Response): Promise<void> {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * limit;

    const { q, category } = req.query;

    const filter: Record<string, unknown> = { isActive: true };

    if (category && typeof category === "string" && category !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (q && typeof q === "string" && q.trim().length > 0) {
      filter.$text = { $search: q.trim() };
    }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(filter.$text ? { score: { $meta: "textScore" } } : { name: 1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    // For each product, get price range and supplier count
    const productIds = products.map((p) => p._id);
    const offers = await SupplierOffer.find({
      productId: { $in: productIds },
      isActive: true,
      stockQty: { $gt: 0 },
    });

    const enriched = products.map((prod) => {
      const prodOffers = offers.filter((o) => o.productId.toString() === prod.id);
      const prices = prodOffers.map((o) => o.pricePaise);
      const minPricePaise = prices.length ? Math.min(...prices) : 0;
      const maxPricePaise = prices.length ? Math.max(...prices) : 0;
      const supplierCount = new Set(prodOffers.map((o) => o.supplierId.toString())).size;

      return {
        ...prod.toJSON(),
        minPricePaise,
        maxPricePaise,
        supplierCount,
        hasStock: prodOffers.length > 0,
      };
    });

    // Also get all distinct categories for filtering
    const categories = await Product.distinct("category", { isActive: true });

    sendSuccess(res, {
      products: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categories,
    });
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Invalid product ID");
    }

    const product = await Product.findById(id);
    if (!product || !product.isActive) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Product not found");
    }

    const offers = await SupplierOffer.find({
      productId: product._id,
      isActive: true,
    })
      .populate("supplierId", "name slug city state reliabilityScore rating onTimeDeliveryRate avgDeliveryDays verified")
      .sort({ pricePaise: 1 });

    sendSuccess(res, {
      product,
      offers,
    });
  }
}
