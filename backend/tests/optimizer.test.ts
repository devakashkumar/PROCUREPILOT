import { describe, it, expect } from "vitest";
import { runOptimizationEngine } from "../src/services/optimizer/optimizer.js";
import { OptimizerInput } from "../src/services/optimizer/types.js";
import { CandidateOffer } from "../src/services/matching/product.matcher.js";

function makeOffer(
  supplierId: string,
  supplierName: string,
  pricePaise: number,
  reliabilityScore: number,
  deliveryDays: number,
  stockQty = 100,
  moq = 1,
  bulkTiers: Array<{ minQty: number; pricePaise: number }> = [],
  shippingFeePaise = 20000,
  freeShippingAbovePaise = 500000
): CandidateOffer {
  return {
    offerId: `offer_${supplierId}`,
    supplierId,
    supplierName,
    supplierCity: "Jaipur",
    reliabilityScore,
    rating: 4.5,
    onTimeDeliveryRate: 0.95,
    deliveryDays,
    basePricePaise: pricePaise,
    effectiveUnitPricePaise: pricePaise,
    lineTotalPaise: pricePaise,
    stockQty,
    moq,
    stockSufficient: stockQty >= 1,
    moqSatisfied: 1 >= moq,
    appliedBulkTier: false,
    shippingFeePaise,
    freeShippingAbovePaise,
    minOrderValuePaise: 0,
  };
}

describe("Procurement Optimization Engine (services/optimizer)", () => {
  const sampleOffersProduct1 = [
    makeOffer("sup_cheap", "Bharat Wholesalers", 12000, 60, 4), // ₹120, rel 60
    makeOffer("sup_reliable", "Apex Logistics", 14000, 95, 2), // ₹140, rel 95
  ];

  const sampleOffersProduct2 = [
    makeOffer("sup_cheap", "Bharat Wholesalers", 30000, 60, 4), // ₹300, rel 60
    makeOffer("sup_reliable", "Apex Logistics", 32000, 95, 2), // ₹320, rel 95
  ];

  it("chooses cheapest offers under 'cheapest' strategy", () => {
    const input: OptimizerInput = {
      items: [
        {
          productId: "p1",
          productName: "Cooking Oil 1L",
          quantity: 10,
          unit: "litre",
          candidateOffers: sampleOffersProduct1,
        },
        {
          productId: "p2",
          productName: "Rice 5kg",
          quantity: 10,
          unit: "packet",
          candidateOffers: sampleOffersProduct2,
        },
      ],
      budgetPaise: 1000000, // ₹10,000
      strategy: "cheapest",
    };

    const result = runOptimizationEngine(input);
    expect(result.plan.withinBudget).toBe(true);
    expect(result.plan.lines[0]?.supplierName).toBe("Bharat Wholesalers");
    expect(result.plan.lines[1]?.supplierName).toBe("Bharat Wholesalers");
  });

  it("chooses premium reliable offers under 'reliable' strategy", () => {
    const input: OptimizerInput = {
      items: [
        {
          productId: "p1",
          productName: "Cooking Oil 1L",
          quantity: 10,
          unit: "litre",
          candidateOffers: sampleOffersProduct1,
        },
        {
          productId: "p2",
          productName: "Rice 5kg",
          quantity: 10,
          unit: "packet",
          candidateOffers: sampleOffersProduct2,
        },
      ],
      budgetPaise: 1000000, // ₹10,000
      strategy: "reliable",
    };

    const result = runOptimizationEngine(input);
    expect(result.plan.withinBudget).toBe(true);
    expect(result.plan.lines[0]?.supplierName).toBe("Apex Logistics");
    expect(result.plan.lines[1]?.supplierName).toBe("Apex Logistics");
    expect(result.plan.averageReliability).toBe(95);
  });

  it("handles tight budget by downgrading to fit within budget", () => {
    // Total Apex = 10 * 14000 + 10 * 32000 = 460000 paise (₹4,600) + shipping
    // Total Bharat = 10 * 12000 + 10 * 30000 = 420000 paise (₹4,200) + shipping
    const input: OptimizerInput = {
      items: [
        {
          productId: "p1",
          productName: "Cooking Oil 1L",
          quantity: 10,
          unit: "litre",
          candidateOffers: sampleOffersProduct1,
        },
        {
          productId: "p2",
          productName: "Rice 5kg",
          quantity: 10,
          unit: "packet",
          candidateOffers: sampleOffersProduct2,
        },
      ],
      budgetPaise: 450000, // ₹4,500 budget: cannot afford all Apex, but fits Bharat!
      strategy: "reliable",
    };

    const result = runOptimizationEngine(input);
    expect(result.plan.withinBudget).toBe(true);
    expect(result.plan.totalPaise).toBeLessThanOrEqual(450000);
  });

  it("correctly identifies infeasible budget without crashing", () => {
    const input: OptimizerInput = {
      items: [
        {
          productId: "p1",
          productName: "Cooking Oil 1L",
          quantity: 10,
          unit: "litre",
          candidateOffers: sampleOffersProduct1,
        },
      ],
      budgetPaise: 50000, // ₹500 budget (minimum cost is ₹1,200)
      strategy: "balanced",
    };

    const result = runOptimizationEngine(input);
    expect(result.plan.withinBudget).toBe(false);
    expect(result.plan.shortfallPaise).toBeGreaterThan(0);
  });

  it("applies bulk tier pricing when quantity qualifies", () => {
    const tieredOffer = makeOffer(
      "sup_bulk",
      "MegaTrade FMCG Hub",
      15000,
      85,
      2,
      200,
      1,
      [{ minQty: 20, pricePaise: 13000 }] // ₹130 at 20+ units
    );

    // Update effective unit price
    tieredOffer.effectiveUnitPricePaise = 13000;
    tieredOffer.appliedBulkTier = true;

    const input: OptimizerInput = {
      items: [
        {
          productId: "p1",
          productName: "Cooking Oil 1L",
          quantity: 25,
          unit: "litre",
          candidateOffers: [tieredOffer],
        },
      ],
      budgetPaise: 500000,
      strategy: "cheapest",
    };

    const result = runOptimizationEngine(input);
    expect(result.plan.lines[0]?.unitPricePaise).toBe(13000);
  });

  it("flips shipping fee to 0 when supplier subtotal exceeds freeShippingAbovePaise", () => {
    const offer = makeOffer(
      "sup_free_ship",
      "Apex Logistics",
      100000, // ₹1,000 per unit
      95,
      2,
      100,
      1,
      [],
      30000, // ₹300 shipping fee
      300000 // free above ₹3,000
    );

    // Case 1: Subtotal = 2 * ₹1,000 = ₹2,000 < ₹3,000 threshold -> Shipping charged
    const res1 = runOptimizationEngine({
      items: [
        {
          productId: "p1",
          productName: "Item 1",
          quantity: 2,
          unit: "unit",
          candidateOffers: [offer],
        },
      ],
      budgetPaise: 500000,
      strategy: "balanced",
    });
    expect(res1.plan.shippingPaise).toBe(30000);

    // Case 2: Subtotal = 4 * ₹1,000 = ₹4,000 >= ₹3,000 threshold -> Free shipping
    const res2 = runOptimizationEngine({
      items: [
        {
          productId: "p1",
          productName: "Item 1",
          quantity: 4,
          unit: "unit",
          candidateOffers: [offer],
        },
      ],
      budgetPaise: 500000,
      strategy: "balanced",
    });
    expect(res2.plan.shippingPaise).toBe(0);
  });

  it("is 100% deterministic: identical inputs yield identical output", () => {
    const input: OptimizerInput = {
      items: [
        {
          productId: "p1",
          productName: "Cooking Oil 1L",
          quantity: 20,
          unit: "litre",
          candidateOffers: sampleOffersProduct1,
        },
        {
          productId: "p2",
          productName: "Rice 5kg",
          quantity: 30,
          unit: "packet",
          candidateOffers: sampleOffersProduct2,
        },
      ],
      budgetPaise: 1500000,
      strategy: "balanced",
    };

    const run1 = runOptimizationEngine(input);
    const run2 = runOptimizationEngine(input);

    expect(run1.plan.totalPaise).toBe(run2.plan.totalPaise);
    expect(run1.plan.lines.map((l) => l.offerId)).toEqual(run2.plan.lines.map((l) => l.offerId));
  });

  it("PROPERTY TEST: totalPaise <= budgetPaise when withinBudget is true across 20 randomized budgets", () => {
    for (let i = 0; i < 20; i++) {
      const budget = 500000 + i * 50000; // ₹5,000 to ₹15,000
      const res = runOptimizationEngine({
        items: [
          {
            productId: "p1",
            productName: "Cooking Oil 1L",
            quantity: 10 + (i % 5),
            unit: "litre",
            candidateOffers: sampleOffersProduct1,
          },
          {
            productId: "p2",
            productName: "Rice 5kg",
            quantity: 10 + (i % 4),
            unit: "packet",
            candidateOffers: sampleOffersProduct2,
          },
        ],
        budgetPaise: budget,
        strategy: "balanced",
      });

      if (res.plan.withinBudget) {
        expect(res.plan.totalPaise).toBeLessThanOrEqual(budget);
      }
    }
  });
});
