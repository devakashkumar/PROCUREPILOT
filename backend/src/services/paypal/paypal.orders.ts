import { IPurchaseOrder } from "../../models/PurchaseOrder.js";
import { IPayment } from "../../models/Payment.js";
import { PayPalClient } from "./paypal.client.js";
import { paiseToUsdCents } from "../../utils/money.js";

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
   * Converted line items represent supplier fulfillment groups.
   * The total USD amount is calculated as the sum of line items to avoid breakdown mismatches.
   */
  static async createOrder(
    order: IPurchaseOrder,
    payment: IPayment,
    idempotencyKey: string
  ): Promise<PayPalCreateOrderResponse> {
    const rate = payment.fxRateInrPerUsd;

    // Convert each supplier group to a USD line item
    const items = order.supplierGroups.map((g) => {
      const groupTotalPaise = g.subtotalPaise + g.shippingPaise;
      const groupUsdCents = paiseToUsdCents(groupTotalPaise, rate);
      return {
        name: `Fulfilment: ${g.supplierName}`,
        description: `${g.lineCount} item(s) - Est. ${g.deliveryDays} day(s) delivery`,
        unit_amount: {
          currency_code: "USD",
          value: (groupUsdCents / 100).toFixed(2),
        },
        quantity: "1",
        category: "PHYSICAL_GOODS" as const,
        cents: groupUsdCents,
      };
    });

    // Sum USD cents from items to ensure exact match with breakdown
    const totalUsdCents = items.reduce((sum, it) => sum + it.cents, 0);
    const totalUsdFormatted = (totalUsdCents / 100).toFixed(2);

    // Update payment's stored USD cents to match exact breakdown
    payment.amountUsdCents = totalUsdCents;

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
