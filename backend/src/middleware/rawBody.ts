import { Request, Response } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

export function captureRawBody(req: Request, _res: Response, buf: Buffer, _encoding: string): void {
  req.rawBody = buf;
}
