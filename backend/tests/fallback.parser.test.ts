import { describe, it, expect } from "vitest";
import { parseRequirementsFallback } from "../src/services/ai/fallback.parser.js";

describe("Fallback Parser for Procurement Requests", () => {
  it("parses the sample ₹15,000 kirana prompt with reliable priority", () => {
    const text =
      "I need to restock 20 units of cooking oil, 30 packets of rice and 15 units of detergent. Keep the total under ₹15,000. Prioritize reliable suppliers.";
    const result = parseRequirementsFallback(text);

    expect(result.priority).toBe("reliable");
    expect(result.budget.amountPaise).toBe(1500000); // ₹15,000 = 1,500,000 paise

    expect(result.items.length).toBe(3);
    const oil = result.items.find((i) => i.name.toLowerCase().includes("oil"));
    const rice = result.items.find((i) => i.name.toLowerCase().includes("rice"));
    const detergent = result.items.find((i) => i.name.toLowerCase().includes("detergent"));

    expect(oil?.quantity).toBe(20);
    expect(rice?.quantity).toBe(30);
    expect(detergent?.quantity).toBe(15);
  });

  it("handles various Indian currency formats accurately", () => {
    // 15k
    const res1 = parseRequirementsFallback("Buy 10 rice under 15k");
    expect(res1.budget.amountPaise).toBe(1500000);

    // 1.5 lakh
    const res2 = parseRequirementsFallback("Order 50 sugar packets, budget 1.5 lakh");
    expect(res2.budget.amountPaise).toBe(15000000);

    // Rs 25000
    const res3 = parseRequirementsFallback("Need 20 tea packets under Rs 25000");
    expect(res3.budget.amountPaise).toBe(2500000);

    // ₹50,000
    const res4 = parseRequirementsFallback("Restock office supplies for ₹50,000");
    expect(res4.budget.amountPaise).toBe(5000000);
  });

  it("identifies strategy priorities correctly", () => {
    expect(parseRequirementsFallback("Get cheapest oil 10 units").priority).toBe("cheapest");
    expect(parseRequirementsFallback("Order 5 atta packets urgent delivery asap").priority).toBe("fastest");
    expect(parseRequirementsFallback("Order 10 rice packets from trusted and verified suppliers").priority).toBe("reliable");
    expect(parseRequirementsFallback("Order 10 sugar packets").priority).toBe("balanced");
  });

  it("extracts delivery days and reliability constraints", () => {
    const res = parseRequirementsFallback(
      "Need 10 cooking oil within 2 days with 85% reliability"
    );
    expect(res.constraints.maxDeliveryDays).toBe(2);
    expect(res.constraints.minReliability).toBe(85);
  });

  it("generates clarifications when budget is omitted", () => {
    const res = parseRequirementsFallback("I need 20 packets of rice");
    expect(res.budget.amountPaise).toBeNull();
    expect(res.clarifications.length).toBeGreaterThan(0);
    expect(res.clarifications[0]).toContain("budget");
  });
});
