/**
 * Money utilities for ProcurePilot AI
 *
 * Money is ALWAYS represented as integer paise (INR) or integer cents (USD).
 * Floating-point numbers are never stored in databases or transmitted as authoritative totals.
 */

/**
 * Converts INR rupees to integer paise.
 */
export function inrToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) {
    throw new TypeError("Rupees must be a finite number");
  }
  return Math.round(rupees * 100);
}

/**
 * Converts integer paise to INR rupees.
 */
export function paiseToInr(paise: number): number {
  if (!Number.isInteger(paise)) {
    throw new TypeError("Paise must be an integer");
  }
  return paise / 100;
}

/**
 * Converts integer USD cents to USD dollars.
 */
export function centsToUsd(cents: number): number {
  if (!Number.isInteger(cents)) {
    throw new TypeError("Cents must be an integer");
  }
  return cents / 100;
}

/**
 * Converts USD dollars to integer USD cents.
 */
export function usdToCents(dollars: number): number {
  if (!Number.isFinite(dollars)) {
    throw new TypeError("Dollars must be a finite number");
  }
  return Math.round(dollars * 100);
}

/**
 * Converts INR paise to USD cents using a given INR/USD exchange rate.
 * Example: 88,000 paise (₹880) at 88 INR/USD = $10.00 = 1000 cents.
 * Calculation: (paise / 100) / fxRate * 100 = paise / fxRate.
 */
export function paiseToUsdCents(paise: number, fxRateInrPerUsd: number): number {
  if (!Number.isInteger(paise) || paise < 0) {
    throw new TypeError("Paise must be a non-negative integer");
  }
  if (!Number.isFinite(fxRateInrPerUsd) || fxRateInrPerUsd <= 0) {
    throw new TypeError("Exchange rate must be a positive number");
  }
  return Math.round(paise / fxRateInrPerUsd);
}

/**
 * Converts USD cents to INR paise using a given INR/USD exchange rate.
 */
export function usdCentsToPaise(cents: number, fxRateInrPerUsd: number): number {
  if (!Number.isInteger(cents) || cents < 0) {
    throw new TypeError("Cents must be a non-negative integer");
  }
  if (!Number.isFinite(fxRateInrPerUsd) || fxRateInrPerUsd <= 0) {
    throw new TypeError("Exchange rate must be a positive number");
  }
  return Math.round(cents * fxRateInrPerUsd);
}

/**
 * Formats integer paise as standard Indian Currency string: e.g. ₹15,000
 * Never shows decimals when paise is 0 or cleanly divisible by 100.
 */
export function formatInr(paise: number): string {
  if (!Number.isInteger(paise)) {
    return "₹0";
  }
  const rupees = paise / 100;
  const hasDecimals = paise % 100 !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Formats integer USD cents as standard US Currency string: e.g. $170.45
 */
export function formatUsd(cents: number): string {
  if (!Number.isInteger(cents)) {
    return "$0.00";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
