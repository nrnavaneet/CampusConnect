import { Session } from "express-session";
import { Request } from "express";

declare module "express-session" {
  interface SessionData {
    userId: string;
    userRole: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export {};