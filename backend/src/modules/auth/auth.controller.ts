import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { sendSuccess } from "../../utils/response.js";
import { ApiError } from "../../utils/ApiError.js";
import { ERROR_CODES } from "../../config/constants.js";

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    const result = await AuthService.register(req.body);
    sendSuccess(
      res,
      {
        user: result.user,
        business: result.business,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
      201
    );
  }

  static async login(req: Request, res: Response): Promise<void> {
    const result = await AuthService.login(req.body);
    sendSuccess(res, {
      user: result.user,
      business: result.business,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
    });
  }

  static async me(req: Request, res: Response): Promise<void> {
    if (!req.user?.id) {
      throw new ApiError(401, ERROR_CODES.UNAUTHORIZED, "Authentication required");
    }
    const result = await AuthService.getMe(req.user.id);
    sendSuccess(res, result);
  }

  static async refresh(req: Request, res: Response): Promise<void> {
    const tokens = await AuthService.refresh(req.body.refreshToken);
    sendSuccess(res, tokens);
  }

  static async logout(_req: Request, res: Response): Promise<void> {
    sendSuccess(res, { message: "Successfully logged out" });
  }
}
