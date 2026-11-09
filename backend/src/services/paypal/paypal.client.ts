import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES } from "../../config/constants.js";

interface TokenCache {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let cachedOAuthToken: TokenCache | null = null;

export class PayPalClient {
  private static get baseUrl(): string {
    return env.PAYPAL_BASE_URL.replace(/\/$/, "");
  }

  /**
   * Retrieves an active OAuth 2.0 access token, using the in-memory cache until shortly before expiry.
   */
  static async getAccessToken(): Promise<string> {
    const now = Date.now();
    // Use cached token if valid for at least another 60 seconds
    if (cachedOAuthToken && cachedOAuthToken.expiresAt > now + 60000) {
      return cachedOAuthToken.accessToken;
    }

    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      // In dev/test when no credentials provided, return mock token for sandbox simulation
      if (env.NODE_ENV !== "production") {
        logger.debug("PAYPAL_CLIENT_ID or SECRET missing. Using simulated sandbox token for dev/test.");
        return "mock_sandbox_access_token_dev";
      }
      throw new ApiError(500, ERROR_CODES.PAYMENT_ERROR, "PayPal credentials not configured");
    }

    const auth = Buffer.from(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`).toString("base64");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorText = await res.text();
        logger.error({ status: res.status, errorText }, "PayPal OAuth request failed");
        throw new ApiError(500, ERROR_CODES.PAYMENT_ERROR, "Failed to authenticate with PayPal Sandbox");
      }

      const data = (await res.json()) as { access_token: string; expires_in: number };
      cachedOAuthToken = {
        accessToken: data.access_token,
        expiresAt: now + data.expires_in * 1000,
      };

      return data.access_token;
    } catch (err) {
      logger.error({ err }, "PayPal OAuth connection error");
      throw new ApiError(500, ERROR_CODES.PAYMENT_ERROR, "PayPal network or authentication error");
    }
  }

  /**
   * Executes an authenticated request against the PayPal REST API.
   */
  static async request<T>(
    endpoint: string,
    options: {
      method?: string;
      body?: unknown;
      requestId?: string;
    } = {}
  ): Promise<T> {
    const token = await this.getAccessToken();

    // If using mock token in test mode without PayPal credentials, simulate sandbox response
    if (token === "mock_sandbox_access_token_dev") {
      return this.simulateSandboxResponse<T>(endpoint, options);
    }

    const url = `${this.baseUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    if (options.requestId) {
      headers["PayPal-Request-Id"] = options.requestId;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(url, {
        method: options.method || "GET",
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const errorJson = (await res.json().catch(() => ({}))) as {
          name?: string;
          message?: string;
          details?: Array<{ issue?: string; description?: string }>;
        };

        logger.error({ status: res.status, errorJson }, "PayPal REST API error response");

        const message =
          errorJson.details?.[0]?.description ||
          errorJson.message ||
          "PayPal transaction processing error";

        throw new ApiError(400, ERROR_CODES.PAYMENT_ERROR, message, errorJson);
      }

      return (await res.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error({ error, endpoint }, "Network error during PayPal API call");
      throw new ApiError(500, ERROR_CODES.PAYMENT_ERROR, "PayPal service connection error");
    }
  }

  /**
   * Simulates PayPal Sandbox responses for dev/test when credentials are not supplied.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static simulateSandboxResponse<T>(endpoint: string, options: any): T {
    if (endpoint.includes("/v2/checkout/orders") && options.method === "POST" && !endpoint.includes("/capture")) {
      const mockId = `MOCK-PAYPAL-${Date.now()}`;
      return {
        id: mockId,
        status: "CREATED",
        links: [
          {
            href: `https://www.sandbox.paypal.com/checkoutnow?token=${mockId}`,
            rel: "approve",
            method: "GET",
          },
        ],
      } as unknown as T;
    }

    if (endpoint.includes("/capture")) {
      const captureId = `MOCK-CAPTURE-${Date.now()}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customId = (options.body as any)?.custom_id || "mock_order_id";
      return {
        id: captureId,
        status: "COMPLETED",
        custom_id: customId,
        purchase_units: [
          {
            payments: {
              captures: [
                {
                  id: captureId,
                  status: "COMPLETED",
                  amount: {
                    currency_code: "USD",
                    value: "0.00", // Will be verified dynamically
                  },
                  custom_id: customId,
                },
              ],
            },
          },
        ],
        payer: {
          email_address: "demo-buyer@procurepilot.ai",
          payer_id: "PAYER_MOCK_123",
        },
      } as unknown as T;
    }

    if (endpoint.includes("/v1/notifications/verify-webhook-signature")) {
      return {
        verification_status: "SUCCESS",
      } as unknown as T;
    }

    return {} as T;
  }
}
