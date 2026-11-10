import { Router } from "express";
import { PaymentController } from "./payment.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createPaymentSchema,
  capturePaymentSchema,
  cancelPaymentSchema,
} from "./payment.schemas.js";

export const paymentRouter = Router();
export const webhookRouter = Router();

// Webhook route handler (no auth token required, uses signature verification)
webhookRouter.post("/", asyncHandler(PaymentController.handleWebhook));

// Authenticated payment routes
paymentRouter.use(authMiddleware);

paymentRouter.post(
  "/create",
  validate({ body: createPaymentSchema }),
  asyncHandler(PaymentController.create)
);

paymentRouter.post(
  "/capture",
  validate({ body: capturePaymentSchema }),
  asyncHandler(PaymentController.capture)
);

paymentRouter.post(
  "/cancel",
  validate({ body: cancelPaymentSchema }),
  asyncHandler(PaymentController.cancel)
);

paymentRouter.get("/:id", asyncHandler(PaymentController.getById));
