import { Product, IProduct } from "../../models/Product.js";
import { SupplierOffer } from "../../models/SupplierOffer.js";
import { ISupplier } from "../../models/Supplier.js";
import { IProcurementItemRequirement } from "../../models/ProcurementRequest.js";

export interface CandidateOffer {
  offerId: string;
  supplierId: string;
  supplierName: string;
  supplierCity: string;
  reliabilityScore: number;
  rating: number;
  onTimeDeliveryRate: number;
  deliveryDays: number;
  basePricePaise: number;
  effectiveUnitPricePaise: number;
  lineTotalPaise: number;
  stockQty: number;
  moq: number;
  stockSufficient: boolean;
  moqSatisfied: boolean;
  appliedBulkTier: boolean;
  shippingFeePaise: number;
  freeShippingAbovePaise: number;
  minOrderValuePaise: number;
}

export interface MatchedCandidate {
  product: IProduct;
  matchScore: number;
  offers: CandidateOffer[];
}

export interface ItemMatchResult {
  requirement: IProcurementItemRequirement;
  candidates: MatchedCandidate[];
  selectedProduct: IProduct | null;
  ambiguous: boolean;
  unmatched: boolean;
}

export function normalizeSearchText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !["of", "the", "and", "in", "for", "with", "units", "pkts", "packets"].includes(t));
}

export function computeTokenOverlapScore(
  tokensA: string[],
  product: IProduct,
  requestedCategory?: string | null
): number {
  const prodTokens = [
    ...normalizeSearchText(product.name),
    ...(product.aliases || []).flatMap(normalizeSearchText),
    ...(product.tags || []).flatMap(normalizeSearchText),
  ];

  const uniqueProdTokens = new Set(prodTokens);
  let matchedCount = 0;

  for (const token of tokensA) {
    if (uniqueProdTokens.has(token)) {
      matchedCount += 1;
    } else {
      // Check partial match
      for (const pt of uniqueProdTokens) {
        if (pt.includes(token) || token.includes(pt)) {
          matchedCount += 0.5;
          break;
        }
      }
    }
  }

  let score = tokensA.length > 0 ? Math.min(1, matchedCount / tokensA.length) : 0;

  // Category boost
  if (
    requestedCategory &&
    product.category &&
    product.category.toLowerCase().includes(requestedCategory.toLowerCase())
  ) {
    score = Math.min(1, score + 0.15);
  }

  return score;
}

export function calculateEffectiveUnitPrice(
  offer: { pricePaise: number; bulkTiers?: Array<{ minQty: number; pricePaise: number }> },
  quantity: number
): {
  unitPricePaise: number;
  appliedBulkTier: boolean;
} {
  let unitPricePaise = offer.pricePaise;
  let appliedBulkTier = false;

  if (offer.bulkTiers && offer.bulkTiers.length > 0) {
    // Sort descending by minQty
    const sortedTiers = [...offer.bulkTiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sortedTiers) {
      if (quantity >= tier.minQty) {
        unitPricePaise = tier.pricePaise;
        appliedBulkTier = true;
        break;
      }
    }
  }

  return { unitPricePaise, appliedBulkTier };
}

export class ProductMatcher {
  static async matchItem(
    requirement: IProcurementItemRequirement,
    overrideProductId?: string
  ): Promise<ItemMatchResult> {
    const rawQuery = requirement.name;
    const tokens = normalizeSearchText(rawQuery);

    // 1. If override product ID specified, fetch it directly
    if (overrideProductId) {
      const product = await Product.findById(overrideProductId);
      if (product) {
        const candidate = await this.enrichProductWithOffers(product, requirement.quantity, 1.0);
        return {
          requirement,
          candidates: [candidate],
          selectedProduct: product,
          ambiguous: false,
          unmatched: false,
        };
      }
    }

    // 2. Exact alias match
    const aliasMatch = await Product.findOne({
      isActive: true,
      aliases: { $regex: new RegExp(`^${rawQuery.trim()}$`, "i") },
    });

    // 3. Text search
    let textMatches: IProduct[] = [];
    try {
      textMatches = await Product.find(
        { $text: { $search: rawQuery }, isActive: true },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .limit(10);
    } catch {
      // If text index not yet available, fallback to regex search
      textMatches = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: new RegExp(tokens.join("|"), "i") } },
          { aliases: { $regex: new RegExp(tokens.join("|"), "i") } },
        ],
      }).limit(10);
    }

    // Combine candidate pools
    const poolMap = new Map<string, IProduct>();
    if (aliasMatch) poolMap.set(aliasMatch.id, aliasMatch);
    for (const p of textMatches) {
      poolMap.set(p.id, p);
    }

    // If pool is still empty, search all active products for token overlap
    if (poolMap.size === 0) {
      const allActive = await Product.find({ isActive: true }).limit(50);
      for (const p of allActive) {
        const score = computeTokenOverlapScore(tokens, p, requirement.category);
        if (score >= 0.3) {
          poolMap.set(p.id, p);
        }
      }
    }

    // Score all candidates
    const scoredCandidates: Array<{ product: IProduct; score: number }> = [];
    for (const product of poolMap.values()) {
      let score = computeTokenOverlapScore(tokens, product, requirement.category);
      if (aliasMatch && product.id === aliasMatch.id) {
        score = Math.max(score, 0.98);
      }
      scoredCandidates.push({ product, score });
    }

    scoredCandidates.sort((a, b) => b.score - a.score);
    const topScored = scoredCandidates.slice(0, 3);

    if (topScored.length === 0 || (topScored[0] && topScored[0].score < 0.2)) {
      return {
        requirement,
        candidates: [],
        selectedProduct: null,
        ambiguous: false,
        unmatched: true,
      };
    }

    // Enrich top candidates with supplier offers
    const candidates: MatchedCandidate[] = [];
    for (const item of topScored) {
      const enriched = await this.enrichProductWithOffers(item.product, requirement.quantity, item.score);
      candidates.push(enriched);
    }

    // Check ambiguity (top 2 candidates within 0.15 match score)
    const ambiguous = candidates.length >= 2 && Math.abs(candidates[0]!.matchScore - candidates[1]!.matchScore) < 0.15;

    return {
      requirement,
      candidates,
      selectedProduct: candidates[0]?.product || null,
      ambiguous,
      unmatched: false,
    };
  }

  private static async enrichProductWithOffers(
    product: IProduct,
    quantity: number,
    matchScore: number
  ): Promise<MatchedCandidate> {
    const rawOffers = await SupplierOffer.find({
      productId: product._id,
      isActive: true,
    }).populate<{ supplierId: ISupplier }>("supplierId");

    const candidateOffers: CandidateOffer[] = rawOffers
      .filter((o) => o.supplierId && o.supplierId._id)
      .map((offer) => {
        const supplier = offer.supplierId;
        const { unitPricePaise, appliedBulkTier } = calculateEffectiveUnitPrice(offer, quantity);
        const lineTotalPaise = unitPricePaise * quantity;

        return {
          offerId: offer.id,
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierCity: supplier.city,
          reliabilityScore: supplier.reliabilityScore,
          rating: supplier.rating,
          onTimeDeliveryRate: supplier.onTimeDeliveryRate,
          deliveryDays: offer.deliveryDays,
          basePricePaise: offer.pricePaise,
          effectiveUnitPricePaise: unitPricePaise,
          lineTotalPaise,
          stockQty: offer.stockQty,
          moq: offer.moq,
          stockSufficient: offer.stockQty >= quantity,
          moqSatisfied: quantity >= offer.moq,
          appliedBulkTier,
          shippingFeePaise: supplier.shippingFeePaise,
          freeShippingAbovePaise: supplier.freeShippingAbovePaise,
          minOrderValuePaise: supplier.minOrderValuePaise,
        };
      });

    return {
      product,
      matchScore: Math.round(matchScore * 100) / 100,
      offers: candidateOffers,
    };
  }
}
