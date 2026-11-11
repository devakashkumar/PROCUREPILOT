import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(150),
  businessType: z.string().min(2, "Business type must be at least 2 characters").max(50),
  city: z.string().min(2, "City must be at least 2 characters").max(100),
  gstin: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").toLowerCase().trim().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .optional(),
  businessName: z.string().min(2, "Business name must be at least 2 characters").max(150).optional(),
  businessType: z.string().min(2, "Business type must be at least 2 characters").max(50).optional(),
  city: z.string().min(2, "City must be at least 2 characters").max(100).optional(),
  gstin: z.string().optional(),
  monthlyBudgetPaise: z.number().int().min(100000, "Monthly budget must be at least ₹1,000").optional(),
  preferences: z
    .object({
      priority: z.enum(["cheapest", "reliable", "balanced", "fastest"]).optional(),
      minReliability: z.number().min(0).max(100).optional(),
    })
    .optional(),
});
