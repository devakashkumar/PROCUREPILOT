import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { PayPalClient } from "./paypal.client.js";

export interface WebhookVerificationParams {
  authAlgo: string;
  certUrl: string;
  transmissionId: string;
  transmissionSig: string;
  transmissionTime: string;
  webhookEvent: Record<string, unknown>;
}

export class PayPalWebhookService {
  /**
   * Verifies incoming webhook signature using PayPal's verify-webhook-signature API.
   */
  static async verifySignature(params: WebhookVerificationParams): Promise<boolean> {
    const webhookId = env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
      if (env.NODE_ENV !== "production") {
        logger.warn(
          "⚠️ [DEV WARNING] PAYPAL_WEBHOOK_ID is not configured. Webhook signature verification is disabled-by-config and REJECTED by security policy."
        );
      }
      return false;
    }

    try {
      const payload = {
        auth_algo: params.authAlgo,
        cert_url: params.certUrl,
        transmission_id: params.transmissionId,
        transmission_sig: params.transmissionSig,
        transmission_time: params.transmissionTime,
        webhook_id: webhookId,
        webhook_event: params.webhookEvent,
      };

      const res = await PayPalClient.request<{ verification_status: string }>(
        "/v1/notifications/verify-webhook-signature",
        {
          method: "POST",
          body: payload,
        }
      );

      return res.verification_status === "SUCCESS";
    } catch (err) {
      logger.error({ err }, "PayPal webhook signature verification request failed");
      return false;
    }
  }
}
