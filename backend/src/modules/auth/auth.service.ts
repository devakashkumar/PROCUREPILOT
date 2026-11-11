import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, IUser } from "../../models/User.js";
import { Business, IBusiness } from "../../models/Business.js";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js";
import { ERROR_CODES } from "../../config/constants.js";

const BCRYPT_SALT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  businessId: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
}

export class AuthService {
  static async register(data: {
    name: string;
    email: string;
    password: string;
    businessName: string;
    businessType: string;
    city: string;
    gstin?: string;
  }): Promise<{ user: IUser; business: IBusiness; tokens: AuthTokens }> {
    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new ApiError(409, ERROR_CODES.CONFLICT, "An account with this email already exists");
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT_ROUNDS);
    const businessId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    // Create business first
    const business = new Business({
      _id: businessId,
      ownerId: userId,
      name: data.businessName,
      type: data.businessType,
      city: data.city,
      gstin: data.gstin,
      monthlyBudgetPaise: 20000000, // ₹2,00,000 default
      currency: "INR",
      preferences: {
        priority: "balanced",
        minReliability: 70,
      },
    });

    try {
      await business.save();
    } catch (err) {
      throw new ApiError(500, ERROR_CODES.INTERNAL_ERROR, "Failed to create business profile");
    }

    // Create user linked to business
    const user = new User({
      _id: userId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: "owner",
      businessId,
      lastLoginAt: new Date(),
    });

    try {
      await user.save();
    } catch (err) {
      // Rollback business if user creation fails
      await Business.findByIdAndDelete(businessId);
      throw err;
    }

    const tokens = generateTokens({
      userId: user.id,
      businessId: business.id,
      role: user.role,
    });

    return { user, business, tokens };
  }

  static async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: IUser; business: IBusiness; tokens: AuthTokens }> {
    const user = await User.findOne({ email: data.email.toLowerCase().trim() });
    if (!user) {
      throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Invalid credentials");
    }

    user.lastLoginAt = new Date();
    await user.save();

    const business = await Business.findById(user.businessId);
    if (!business) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Business account not found");
    }

    const tokens = generateTokens({
      userId: user.id,
      businessId: business.id,
      role: user.role,
    });

    return { user, business, tokens };
  }

  static async refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as TokenPayload;
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "User not found");
      }

      const tokens = generateTokens({
        userId: user.id,
        businessId: user.businessId.toString(),
        role: user.role,
      });

      return tokens;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Invalid or expired refresh token");
    }
  }

  static async getMe(userId: string): Promise<{ user: IUser; business: IBusiness }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "User not found");
    }
    const business = await Business.findById(user.businessId);
    if (!business) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Business profile not found");
    }
    return { user, business };
  }

  static async updateProfile(
    userId: string,
    businessId: string,
    data: {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
      businessName?: string;
      businessType?: string;
      city?: string;
      gstin?: string;
      monthlyBudgetPaise?: number;
      preferences?: {
        priority?: "cheapest" | "reliable" | "balanced" | "fastest";
        minReliability?: number;
      };
    }
  ): Promise<{ user: IUser; business: IBusiness }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "User account not found");
    }

    const business = await Business.findById(businessId);
    if (!business) {
      throw new ApiError(404, ERROR_CODES.NOT_FOUND, "Business profile not found");
    }

    const isDemo = user.email === "demo@procurepilot.ai";

    if (data.name) {
      user.name = data.name.trim();
    }

    if (data.email && data.email !== user.email) {
      if (isDemo) {
        throw new ApiError(403, ERROR_CODES.FORBIDDEN, "Demo account email address cannot be changed. Register a real account to test email updates.");
      }
      const existing = await User.findOne({ email: data.email, _id: { $ne: user._id } });
      if (existing) {
        throw new ApiError(409, ERROR_CODES.CONFLICT, "An account with this email address already exists");
      }
      user.email = data.email;
    }

    if (data.newPassword) {
      if (isDemo) {
        throw new ApiError(403, ERROR_CODES.FORBIDDEN, "Demo account password cannot be modified. Register a real account to test password updates.");
      }
      if (!data.currentPassword) {
        throw new ApiError(400, ERROR_CODES.VALIDATION_ERROR, "Current password is required to set a new password");
      }
      const isMatch = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!isMatch) {
        throw new ApiError(400, ERROR_CODES.UNAUTHORIZED, "Current password is incorrect");
      }
      user.passwordHash = await bcrypt.hash(data.newPassword, BCRYPT_SALT_ROUNDS);
    }

    await user.save();

    if (data.businessName) {
      business.name = data.businessName.trim();
    }
    if (data.businessType) {
      business.type = data.businessType.trim();
    }
    if (data.city) {
      business.city = data.city.trim();
    }
    if (data.gstin !== undefined) {
      business.gstin = data.gstin.trim() || undefined;
    }
    if (data.monthlyBudgetPaise !== undefined) {
      business.monthlyBudgetPaise = data.monthlyBudgetPaise;
    }
    if (data.preferences) {
      if (data.preferences.priority) {
        business.preferences.priority = data.preferences.priority;
      }
      if (data.preferences.minReliability !== undefined) {
        business.preferences.minReliability = data.preferences.minReliability;
      }
    }

    await business.save();

    return { user, business };
  }
}
