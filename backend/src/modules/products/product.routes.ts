import { Router } from "express";
import { ProductController } from "./product.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const productRouter = Router();

productRouter.get("/", asyncHandler(ProductController.list));
productRouter.get("/:id", asyncHandler(ProductController.getById));
