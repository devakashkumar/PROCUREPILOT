import { describe, it, expect } from "vitest";
import {
  inrToPaise,
  paiseToInr,
  centsToUsd,
  usdToCents,
  paiseToUsdCents,
  usdCentsToPaise,
  formatInr,
  formatUsd,
} from "../src/utils/money.js";

describe("Money Utilities", () => {
  it("converts INR to Paise and back", () => {
    expect(inrToPaise(15000)).toBe(1500000);
    expect(paiseToInr(1500000)).toBe(15000);
    expect(inrToPaise(99.5)).toBe(9950);
    expect(paiseToInr(9950)).toBe(99.5);
  });

  it("converts USD to Cents and back", () => {
    expect(usdToCents(10.5)).toBe(1050);
    expect(centsToUsd(1050)).toBe(10.5);
  });

  it("converts paise to USD cents at demo conversion rate (88 INR/USD)", () => {
    // 88,000 paise (₹880) at 88 INR/USD = $10.00 = 1000 cents
    expect(paiseToUsdCents(88000, 88)).toBe(1000);

    // 15,000 INR = 1,500,000 paise / 88 = 17045.45 cents -> 17045 cents ($170.45)
    expect(paiseToUsdCents(1500000, 88)).toBe(17045);
  });

  it("converts USD cents to INR paise at demo conversion rate", () => {
    expect(usdCentsToPaise(1000, 88)).toBe(88000);
    expect(usdCentsToPaise(17045, 88)).toBe(1499960);
  });

  it("formats INR currency correctly without decimals for whole numbers", () => {
    const formatted = formatInr(1500000);
    expect(formatted).toContain("15,000");
    expect(formatted).not.toContain(".00");

    const formattedWithDecimals = formatInr(1500050);
    expect(formattedWithDecimals).toContain("15,000.5");
  });

  it("formats USD currency with 2 decimals", () => {
    expect(formatUsd(17045)).toBe("$170.45");
    expect(formatUsd(1000)).toBe("$10.00");
  });

  it("throws TypeError on non-integer paise inputs", () => {
    // @ts-expect-error testing invalid input
    expect(() => paiseToInr(12.34)).toThrow(TypeError);
    // @ts-expect-error testing invalid input
    expect(() => paiseToUsdCents(12.34, 88)).toThrow(TypeError);
  });
});
