import { env } from "../../config/env.js";
import { formatInr, formatUsd, paiseToUsdCents } from "../../utils/money.js";

export interface FxConversionResult {
  amountInrPaise: number;
  amountUsdCents: number;
  fxRateInrPerUsd: number;
  fxNote: string;
}

export class CurrencyService {
  static getDemoRate(): number {
    return env.DEMO_INR_PER_USD || 88;
  }

  static convertInrToUsd(paise: number): FxConversionResult {
    const rate = this.getDemoRate();
    const usdCents = paiseToUsdCents(paise, rate);
    const formattedInr = formatInr(paise);
    const formattedUsd = formatUsd(usdCents);
    const fxNote = `Demo conversion: ${formattedInr} ≈ ${formattedUsd} at ₹${rate}/USD (sandbox only)`;

    return {
      amountInrPaise: paise,
      amountUsdCents: usdCents,
      fxRateInrPerUsd: rate,
      fxNote,
    };
  }
}
