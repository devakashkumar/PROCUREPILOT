import { STRATEGY_WEIGHTS, ProcurementStrategy } from "../../config/constants.js";
import { CandidateOffer } from "../matching/product.matcher.js";

export function computeOfferScore(
  offer: CandidateOffer,
  minPriceInGroup: number,
  quantity: number,
  strategy: ProcurementStrategy
): number {
  const weights = STRATEGY_WEIGHTS[strategy];

  // 1. Price Score: Cheaper is better
  const priceScore =
    offer.effectiveUnitPricePaise > 0
      ? Math.min(1, minPriceInGroup / offer.effectiveUnitPricePaise)
      : 1;

  // 2. Reliability Score: 0 to 1
  const relScore = Math.max(0, Math.min(1, offer.reliabilityScore / 100));

  // 3. Delivery Score: Faster is better
  // 1 day = 1.0, 2 days = 0.85, 3 days = 0.70, etc.
  const deliveryScore = Math.max(0, Math.min(1, 1 - (offer.deliveryDays - 1) * 0.15));

  // 4. Stock Confidence: Stock >= 2x quantity is 1.0
  const stockConfidence =
    quantity > 0 ? Math.min(1, offer.stockQty / (quantity * 1.5)) : 1;

  const compositeScore =
    weights.price * priceScore +
    weights.reliability * relScore +
    weights.delivery * deliveryScore +
    weights.stockConfidence * stockConfidence;

  return Math.round(compositeScore * 1000) / 1000;
}
