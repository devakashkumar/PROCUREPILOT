import { IPurchaseOrder } from "../../models/PurchaseOrder.js";
import { IPayment } from "../../models/Payment.js";
import { PayPalClient } from "./paypal.client.js";
import { env } from "../../config/env.js";

export interface PayPalCreateOrderResponse {
  id: string;
  status: string;
  links: Array<{ href: string; rel: string; method: string }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: "COMPLETED" | "PENDING" | "FAILED" | "DENIED";
  custom_id?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        id: string;
        status: "COMPLETED" | "PENDING" | "DECLINED" | "FAILED";
        amount: {
          currency_code: string;
          value: string;
        };
        custom_id?: string;
      }>;
    };
  }>;
  payer?: {
    email_address?: string;
    payer_id?: string;
    name?: { given_name?: string; surname?: string };
  };
}

export class PayPalOrdersService {
  /**
 * Creates a PayPal order using Orders API v2.
 * Converted line items represent supplier fulfilment groups.
 * The authoritative payment total is allocated across supplier groups
 * to ensure the item breakdown matches the payment amount.
 */
  static async createOrder(
    order: IPurchaseOrder,
    payment: IPayment,
    idempotencyKey: string
  ): Promise<PayPalCreateOrderResponse> {
    const rate = payment.fxRateInrPerUsd;

    // Convert each supplier group to a USD line item
    const groupAmounts = order.supplierGroups.map((g) => {
    const exactCents = (g.subtotalPaise + g.shippingPaise) / rate;

  return {
    group: g,
    cents: Math.floor(exactCents),
    remainder: exactCents - Math.floor(exactCents),
  };
});

     const allocatedCents = groupAmounts.reduce(
     (sum, item) => sum + item.cents,
     0
   );

      const remainingCents = payment.amountUsdCents - allocatedCents;

    if (
     remainingCents < 0 ||
     remainingCents > groupAmounts.length
  ) {
  throw new Error("Unable to reconcile PayPal supplier amounts");
} 

    groupAmounts
    .sort((a, b) => b.remainder - a.remainder)
    .slice(0, remainingCents)
    .forEach((item) => {
      item.cents += 1;
  });

   const items = groupAmounts.map(({ group, cents }) => ({
    name: `Fulfilment: ${group.supplierName}`,
    description: `${group.lineCount} item(s) - Est. ${group.deliveryDays} day(s) delivery`,
    unit_amount: {
    currency_code: "USD",
    value: (cents / 100).toFixed(2),
  },
  quantity: "1",
  category: "PHYSICAL_GOODS" as const,
  cents,
}));

    // Sum USD cents from items to ensure exact match with breakdown
    const totalUsdCents = items.reduce((sum, it) => sum + it.cents, 0);
    const totalUsdFormatted = (totalUsdCents / 100).toFixed(2);

    // Update payment's stored USD cents to match exact breakdown
    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.orderNumber,
          custom_id: order.id,
          invoice_id: `${order.orderNumber}_ATTEMPT_${Date.now()}`,
          description: `ProcurePilot PO ${order.orderNumber} (${order.lines.length} items)`,
          amount: {
            currency_code: "USD",
            value: totalUsdFormatted,
            breakdown: {
              item_total: {
                currency_code: "USD",
                value: totalUsdFormatted,
              },
            },
          },
          items: items.map(({ name, description, unit_amount, quantity, category }) => ({
            name,
            description,
            unit_amount,
            quantity,
            category,
          })),
        },
      ],
      application_context: {
        brand_name: "ProcurePilot AI",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${(env.CORS_ORIGINS.split(",")[0] || "http://localhost:5173").trim()}/orders/${order.id}/payment-result`,
        cancel_url: `${(env.CORS_ORIGINS.split(",")[0] || "http://localhost:5173").trim()}/orders/${order.id}/checkout`,
      },
    };

    return PayPalClient.request<PayPalCreateOrderResponse>("/v2/checkout/orders", {
      method: "POST",
      body: payload,
      requestId: idempotencyKey,
    });
  }

  /**
   * Captures payment for an approved PayPal order.
   */
  static async captureOrder(
    paypalOrderId: string,
    idempotencyKey: string
  ): Promise<PayPalCaptureResponse> {
    return PayPalClient.request<PayPalCaptureResponse>(
      `/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        body: {},
        requestId: idempotencyKey,
      }
    );
  }
}
