import { ProcurementStrategy, PROCUREMENT_STRATEGIES } from "../../config/constants.js";
import {
  OptimizerInput,
  OptimizerOutput,
  OptimizedPlan,
  OptimizedLineItem,
  OptimizedSupplierGroup,
  AlternativePlan,
} from "./types.js";
import { computeOfferScore } from "./scoring.js";
import { CandidateOffer } from "../matching/product.matcher.js";

// Discretization step for Knapsack DP: ₹10 = 1000 paise
const BUCKET_SIZE_PAISE = 1000;

interface ProcessedChoice {
  offer: CandidateOffer;
  costPaise: number;
  costBuckets: number;
  score: number;
}

interface ItemChoices {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  choices: ProcessedChoice[];
  minCostPaise: number;
  maxCostPaise: number;
}

export function runOptimizationEngine(input: OptimizerInput): OptimizerOutput {
  const warnings: string[] = [];

  // 1. Filter and prepare candidate choices per item
  const itemChoicesList: ItemChoices[] = [];

  for (const item of input.items) {
    let candidatePool = [...item.candidateOffers];

    // Filter by excluded suppliers
    if (input.constraints?.excludedSuppliers?.length) {
      candidatePool = candidatePool.filter(
        (o) => !input.constraints!.excludedSuppliers!.includes(o.supplierId)
      );
    }

    // Filter by preferred suppliers if specified and available
    if (input.constraints?.preferredSuppliers?.length) {
      const preferredPool = candidatePool.filter((o) =>
        input.constraints!.preferredSuppliers!.includes(o.supplierId)
      );
      if (preferredPool.length > 0) {
        candidatePool = preferredPool;
      }
    }

    // Filter by delivery days constraint
    if (input.constraints?.maxDeliveryDays) {
      const maxDays = input.constraints.maxDeliveryDays;
      const filtered = candidatePool.filter((o) => o.deliveryDays <= maxDays);
      if (filtered.length > 0) {
        candidatePool = filtered;
      } else {
        warnings.push(
          `No supplier for ${item.productName} meets delivery within ${maxDays} days; relaxed constraint.`
        );
      }
    }

    // Filter by min reliability constraint
    if (input.constraints?.minReliability) {
      const minRel = input.constraints.minReliability;
      const filtered = candidatePool.filter((o) => o.reliabilityScore >= minRel);
      if (filtered.length > 0) {
        candidatePool = filtered;
      } else {
        warnings.push(
          `No supplier for ${item.productName} meets minimum reliability ${minRel}%; relaxed constraint.`
        );
      }
    }

    // Filter by MOQ
    const moqFiltered = candidatePool.filter((o) => item.quantity >= o.moq);
    if (moqFiltered.length > 0) {
      candidatePool = moqFiltered;
    } else {
      warnings.push(
        `Quantity (${item.quantity}) for ${item.productName} is below supplier MOQ; relaxed MOQ filter.`
      );
    }

    // Filter by stock sufficiency
    const stockFiltered = candidatePool.filter((o) => o.stockQty >= item.quantity);
    if (stockFiltered.length > 0) {
      candidatePool = stockFiltered;
    } else {
      warnings.push(
        `Limited inventory available for ${item.productName}. Suppliers with partial stock included.`
      );
    }

    // If completely empty pool, fall back to any active candidate offer for this item
    if (candidatePool.length === 0 && item.candidateOffers.length > 0) {
      candidatePool = [item.candidateOffers[0]!];
    }

    // Compute min price in group for scoring
    const minPriceInGroup = Math.min(
      ...candidatePool.map((o) => o.effectiveUnitPricePaise)
    );

    const choices: ProcessedChoice[] = candidatePool.map((offer) => {
      const costPaise = offer.effectiveUnitPricePaise * item.quantity;
      const score = computeOfferScore(offer, minPriceInGroup, item.quantity, input.strategy);
      return {
        offer,
        costPaise,
        costBuckets: Math.max(1, Math.ceil(costPaise / BUCKET_SIZE_PAISE)),
        score,
      };
    });

    // Deduplicate choices having identical supplier and cost
    const uniqueChoices: ProcessedChoice[] = [];
    const seenSuppliers = new Set<string>();
    for (const c of choices) {
      if (!seenSuppliers.has(c.offer.supplierId)) {
        seenSuppliers.add(c.offer.supplierId);
        uniqueChoices.push(c);
      }
    }

    const costs = uniqueChoices.map((c) => c.costPaise);
    const minCostPaise = costs.length ? Math.min(...costs) : 0;
    const maxCostPaise = costs.length ? Math.max(...costs) : 0;

    itemChoicesList.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unit: item.unit,
      choices: uniqueChoices,
      minCostPaise,
      maxCostPaise,
    });
  }

  // Calculate naive baseline (sum of highest price offers) for savings calculation
  const naiveTotalPaise = itemChoicesList.reduce((sum, it) => sum + it.maxCostPaise, 0);

  // 2. Solve primary strategy plan
  const primaryPlan = solvePlan(
    itemChoicesList,
    input.budgetPaise,
    input.strategy,
    naiveTotalPaise
  );

  // 3. Solve alternative strategy plans
  const alternatives: AlternativePlan[] = [];
  const otherStrategies = Object.values(PROCUREMENT_STRATEGIES).filter(
    (s) => s !== input.strategy
  );

  for (const altStrategy of otherStrategies) {
    if (alternatives.length >= 2) break;

    // Rescore items for alternative strategy
    const altItemChoicesList = itemChoicesList.map((item) => {
      const minPriceInGroup = Math.min(...item.choices.map((c) => c.offer.effectiveUnitPricePaise));
      const rescaledChoices = item.choices.map((c) => ({
        ...c,
        score: computeOfferScore(c.offer, minPriceInGroup, item.quantity, altStrategy),
      }));
      return {
        ...item,
        choices: rescaledChoices,
      };
    });

    const altPlan = solvePlan(
      altItemChoicesList,
      input.budgetPaise,
      altStrategy,
      naiveTotalPaise
    );

    // Deduplicate identical plans
    const isDuplicate =
      altPlan.totalPaise === primaryPlan.totalPaise &&
      altPlan.lines.every((l, idx) => l.offerId === primaryPlan.lines[idx]?.offerId);

    if (!isDuplicate) {
      alternatives.push({
        ...altPlan,
        strategy: altStrategy,
      });
    }
  }

  return {
    strategy: input.strategy,
    plan: primaryPlan,
    alternatives,
    warnings,
  };
}

/**
 * Solves multiple-choice knapsack with iterated shipping reserve.
 */
function solvePlan(
  items: ItemChoices[],
  budgetPaise: number,
  strategy: ProcurementStrategy,
  naiveTotalPaise: number
): OptimizedPlan {
  // Check theoretical minimum cost
  const theoreticalMinCostPaise = items.reduce((acc, it) => acc + it.minCostPaise, 0);
  const isBudgetFeasible = theoreticalMinCostPaise <= budgetPaise;

  // Initial shipping reserve estimation
  let shippingReservePaise = Math.min(50000, Math.round(budgetPaise * 0.05)); // 5% or ₹500
  let bestChosenChoices: ProcessedChoice[] = [];
  let bestPlanTotal = Infinity;

  // Iterate up to 5 times adjusting the shipping reserve
  for (let iteration = 0; iteration < 5; iteration++) {
    const effectiveBudgetPaise = Math.max(
      theoreticalMinCostPaise,
      budgetPaise - shippingReservePaise
    );
    const maxBuckets = Math.max(1, Math.floor(effectiveBudgetPaise / BUCKET_SIZE_PAISE));

    const chosen = solveMultipleChoiceKnapsack(items, maxBuckets, strategy);
    bestChosenChoices = chosen;

    // Compute actual shipping
    const supplierGroups = buildSupplierGroups(chosen);
    const realShippingPaise = supplierGroups.reduce((acc, g) => acc + g.shippingPaise, 0);
    const realSubtotalPaise = chosen.reduce((acc, c) => acc + c.costPaise, 0);
    const totalPaise = realSubtotalPaise + realShippingPaise;

    bestPlanTotal = totalPaise;

    if (totalPaise <= budgetPaise) {
      break;
    }

    // Adjust shipping reserve for next iteration
    shippingReservePaise = realShippingPaise;
  }

  // If even iterated plan exceeds budget, fallback to absolute minimum cost choices
  if (bestPlanTotal > budgetPaise && isBudgetFeasible) {
    const minCostChoices = items.map((it) => {
      return [...it.choices].sort((a, b) => a.costPaise - b.costPaise)[0]!;
    });
    const subtotal = minCostChoices.reduce((acc, c) => acc + c.costPaise, 0);
    const groups = buildSupplierGroups(minCostChoices);
    const shipping = groups.reduce((acc, g) => acc + g.shippingPaise, 0);
    if (subtotal + shipping < bestPlanTotal) {
      bestChosenChoices = minCostChoices;
      bestPlanTotal = subtotal + shipping;
    }
  }

  // Build final structured plan
  const finalSupplierGroups = buildSupplierGroups(bestChosenChoices);
  const subtotalPaise = bestChosenChoices.reduce((acc, c) => acc + c.costPaise, 0);
  const shippingPaise = finalSupplierGroups.reduce((acc, g) => acc + g.shippingPaise, 0);
  const totalPaise = subtotalPaise + shippingPaise;

  const withinBudget = totalPaise <= budgetPaise;
  const shortfallPaise = withinBudget ? 0 : totalPaise - budgetPaise;
  const remainingBudgetPaise = withinBudget ? budgetPaise - totalPaise : 0;

  const lines: OptimizedLineItem[] = items.map((item, idx) => {
    const chosen = bestChosenChoices[idx]!;
    return {
      productId: item.productId,
      productName: item.productName,
      supplierId: chosen.offer.supplierId,
      supplierName: chosen.offer.supplierName,
      offerId: chosen.offer.offerId,
      quantity: item.quantity,
      unit: item.unit,
      unitPricePaise: chosen.offer.effectiveUnitPricePaise,
      lineTotalPaise: chosen.costPaise,
      deliveryDays: chosen.offer.deliveryDays,
      reliabilityScore: chosen.offer.reliabilityScore,
      score: chosen.score,
    };
  });

  const totalReliability = lines.reduce((acc, l) => acc + l.reliabilityScore, 0);
  const averageReliability = lines.length ? Math.round(totalReliability / lines.length) : 0;
  const maxDeliveryDays = lines.length ? Math.max(...lines.map((l) => l.deliveryDays)) : 0;

  const estimatedSavingsPaise = Math.max(0, naiveTotalPaise - totalPaise);

  return {
    lines,
    supplierGroups: finalSupplierGroups,
    subtotalPaise,
    shippingPaise,
    totalPaise,
    budgetPaise,
    remainingBudgetPaise,
    withinBudget,
    shortfallPaise,
    averageReliability,
    maxDeliveryDays,
    estimatedSavingsPaise,
  };
}

/**
 * Multiple-choice Knapsack DP solver
 */
function solveMultipleChoiceKnapsack(
  items: ItemChoices[],
  maxBuckets: number,
  strategy: ProcurementStrategy
): ProcessedChoice[] {
  // If only 1 choice per item, return immediately
  if (items.every((it) => it.choices.length <= 1)) {
    return items.map((it) => it.choices[0]!);
  }

  const n = items.length;
  // dp[i][w] = max score using first i items with at most w budget buckets
  // We use a flat Float64Array for fast performance
  const dp = new Float64Array((n + 1) * (maxBuckets + 1)).fill(-1);
  const choiceTrack = new Int16Array((n + 1) * (maxBuckets + 1)).fill(-1);

  // Base state: 0 items has score 0 for all weights
  for (let w = 0; w <= maxBuckets; w++) {
    dp[w] = 0;
  }

  for (let i = 1; i <= n; i++) {
    const item = items[i - 1]!;
    const choices = item.choices;

    for (let w = 0; w <= maxBuckets; w++) {
      let bestScore = -1;
      let bestChoiceIdx = -1;

      for (let cIdx = 0; cIdx < choices.length; cIdx++) {
        const choice = choices[cIdx]!;
        const weight = choice.costBuckets;

        if (w >= weight) {
          const prevScore = dp[(i - 1) * (maxBuckets + 1) + (w - weight)]!;
          if (prevScore >= 0) {
            const currentScore = prevScore + choice.score;
            if (currentScore > bestScore) {
              bestScore = currentScore;
              bestChoiceIdx = cIdx;
            }
          }
        }
      }

      dp[i * (maxBuckets + 1) + w] = bestScore;
      choiceTrack[i * (maxBuckets + 1) + w] = bestChoiceIdx;
    }
  }

  // Reconstruct chosen choices starting from maxBuckets
  let currWeight = maxBuckets;
  // Find highest score bucket in the final row
  let maxScore = -1;
  let bestWeight = maxBuckets;
  for (let w = maxBuckets; w >= 0; w--) {
    const s = dp[n * (maxBuckets + 1) + w]!;
    if (s > maxScore) {
      maxScore = s;
      bestWeight = w;
    }
  }

  currWeight = bestWeight;

  // If no combination fit within maxBuckets, pick fallback (cheapest or highest score)
  if (maxScore < 0) {
    return items.map((it) => {
      if (strategy === "cheapest") {
        return [...it.choices].sort((a, b) => a.costPaise - b.costPaise)[0]!;
      }
      return [...it.choices].sort((a, b) => b.score - a.score)[0]!;
    });
  }

  const selectedChoices: ProcessedChoice[] = new Array(n);
  for (let i = n; i >= 1; i--) {
    const item = items[i - 1]!;
    let choiceIdx = choiceTrack[i * (maxBuckets + 1) + currWeight]!;
    if (choiceIdx < 0 || choiceIdx >= item.choices.length) {
      choiceIdx = 0;
    }
    const chosen = item.choices[choiceIdx]!;
    selectedChoices[i - 1] = chosen;
    currWeight -= chosen.costBuckets;
    if (currWeight < 0) currWeight = 0;
  }

  return selectedChoices;
}

/**
 * Aggregates chosen offers into supplier sub-orders with shipping rules
 */
function buildSupplierGroups(choices: ProcessedChoice[]): OptimizedSupplierGroup[] {
  const map = new Map<
    string,
    {
      supplierId: string;
      supplierName: string;
      subtotalPaise: number;
      shippingFeePaise: number;
      freeShippingAbovePaise: number;
      deliveryDays: number;
      lineCount: number;
    }
  >();

  for (const choice of choices) {
    const s = choice.offer;
    const existing = map.get(s.supplierId);
    if (!existing) {
      map.set(s.supplierId, {
        supplierId: s.supplierId,
        supplierName: s.supplierName,
        subtotalPaise: choice.costPaise,
        shippingFeePaise: s.shippingFeePaise,
        freeShippingAbovePaise: s.freeShippingAbovePaise,
        deliveryDays: s.deliveryDays,
        lineCount: 1,
      });
    } else {
      existing.subtotalPaise += choice.costPaise;
      existing.deliveryDays = Math.max(existing.deliveryDays, s.deliveryDays);
      existing.lineCount += 1;
    }
  }

  return Array.from(map.values()).map((g) => {
    const qualifiesForFreeShipping =
      g.freeShippingAbovePaise > 0 && g.subtotalPaise >= g.freeShippingAbovePaise;
    const shippingPaise = qualifiesForFreeShipping ? 0 : g.shippingFeePaise;

    return {
      supplierId: g.supplierId,
      supplierName: g.supplierName,
      subtotalPaise: g.subtotalPaise,
      shippingPaise,
      deliveryDays: g.deliveryDays,
      lineCount: g.lineCount,
    };
  });
}
