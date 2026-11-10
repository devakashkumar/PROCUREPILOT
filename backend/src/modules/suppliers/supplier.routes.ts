import { Router } from "express";
import { SupplierController } from "./supplier.controller.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const supplierRouter = Router();

supplierRouter.get("/", asyncHandler(SupplierController.list));
supplierRouter.get("/:id", asyncHandler(SupplierController.getById));
