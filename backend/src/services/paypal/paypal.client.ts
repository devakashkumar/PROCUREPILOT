import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES } from "../../config/constants.js";

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let cachedOAuthToken: TokenCache | null = null;

export class PayPalClient {
  private static mockOrders = new Map<
    string,
    { amount: string; customId: string }
  >();

  private static get baseUrl(): string {
    return env.PAYPAL_BASE_URL.replace(/\/$/, "");
  }

  /**
   * Retrieves an active OAuth 2.0 access token,
   * using the in-memory cache until shortly before expiry.
   */
  static async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (cachedOAuthToken && cachedOAuthToken.expiresAt > now + 60000) {
      return cachedOAuthToken.accessToken;
    }

    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      if (env.NODE_ENV === "test") {
        logger.debug(
          "PayPal credentials missing. Using simulated sandbox token for dev/test."
        );
        return "mock_sandbox_access_token_dev";
      }

      throw new ApiError(
        500,
        ERROR_CODES.PAYMENT_ERROR,
        "PayPal credentials not configured"
      );
    }

    const auth = Buffer.from(
      `${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text();

        logger.error(
          { status: res.status, errorText },
          "PayPal OAuth request failed"
        );

        throw new ApiError(
          500,
          ERROR_CODES.PAYMENT_ERROR,
          "Failed to authenticate with PayPal Sandbox"
        );
      }

      const data = (await res.json()) as {
        access_token: string;
        expires_in: number;
      };

      cachedOAuthToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000,
      };

      return data.access_token;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }

      logger.error({ err }, "PayPal OAuth connection error");

      throw new ApiError(
        500,
        ERROR_CODES.PAYMENT_ERROR,
        "PayPal network or authentication error"
      );
    } finally {
      clearTimeout(timeout);
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

    // Mock mode is only for development/test without credentials.
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

      if (!res.ok) {
        const errorJson = (await res.json().catch(() => ({}))) as {
          name?: string;
          message?: string;
          details?: Array<{
            issue?: string;
            description?: string;
          }>;
        };

        logger.error(
          { status: res.status, errorJson },
          "PayPal REST API error response"
        );

        const message =
          errorJson.details?.[0]?.description ||
          errorJson.message ||
          "PayPal transaction processing error";

        throw new ApiError(
          400,
          ERROR_CODES.PAYMENT_ERROR,
          message,
          errorJson
        );
      }

      return (await res.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      logger.error(
        { error, endpoint },
        "Network error during PayPal API call"
      );

      throw new ApiError(
        500,
        ERROR_CODES.PAYMENT_ERROR,
        "PayPal service connection error"
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Simulates PayPal responses for development/test
   * when credentials are not supplied.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static simulateSandboxResponse<T>(
    endpoint: string,
    options: any
  ): T {
    // Create PayPal order
    if (
      endpoint.includes("/v2/checkout/orders") &&
      options.method === "POST" &&
      !endpoint.includes("/capture")
    ) {
      const mockId = `MOCK-PAYPAL-${Date.now()}`;

      const body = options.body as {
        purchase_units?: Array<{
          custom_id?: string;
          amount?: {
            value?: string;
          };
        }>;
      };

      const purchaseUnit = body?.purchase_units?.[0];

      if (!purchaseUnit?.amount?.value) {
        throw new Error("Mock PayPal order is missing its amount");
      }

      this.mockOrders.set(mockId, {
        amount: purchaseUnit.amount.value,
        customId: purchaseUnit.custom_id || "mock_order_id",
      });

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

    // Capture PayPal order
      if (endpoint.includes("/capture")) {
      const orderId = endpoint.split("/").slice(-2, -1)[0];

      if (!orderId) {
  throw new Error("Mock PayPal order ID is missing");
      }

      const mockOrder = this.mockOrders.get(orderId);
      if (!mockOrder) {
        throw new Error("Mock PayPal order not found");
      }

      const captureId = `MOCK-CAPTURE-${Date.now()}`;

      return {
        id: orderId,
        status: "COMPLETED",
        purchase_units: [
          {
            payments: {
              captures: [
                {
                  id: captureId,
                  status: "COMPLETED",
                  amount: {
                    currency_code: "USD",
                    value: mockOrder.amount,
                  },
                  custom_id: mockOrder.customId,
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

    // Simulate webhook signature verification in mock mode.
    if (
      endpoint.includes("/v1/notifications/verify-webhook-signature")
    ) {
      return {
        verification_status: "SUCCESS",
      } as unknown as T;
    }

    return {} as T;
  }
}
