import { Router } from "express";
import { OrderController } from "./order.controller.js";
import { validate } from "../../middleware/validate.js";
import { authMiddleware } from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createOrderSchema,
  rejectOrderSchema,
} from "./orders.schemas.js";

export const orderRouter = Router();

orderRouter.use(authMiddleware);

orderRouter.post(
  "/",
  validate({ body: createOrderSchema }),
  asyncHandler(OrderController.create)
);

orderRouter.get("/", asyncHandler(OrderController.list));
orderRouter.get("/:id", asyncHandler(OrderController.getById));

orderRouter.post("/:id/approve", asyncHandler(OrderController.approve));
orderRouter.post(
  "/:id/reject",
  validate({ body: rejectOrderSchema }),
  asyncHandler(OrderController.reject)
);
orderRouter.post("/:id/cancel", asyncHandler(OrderController.cancel));
