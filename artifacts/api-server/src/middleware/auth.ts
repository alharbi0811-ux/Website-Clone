import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
  isAdmin?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح - يرجى تسجيل الدخول" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; isAdmin: boolean };
    req.userId = payload.userId;
    req.isAdmin = payload.isAdmin;
    next();
  } catch {
    return res.status(401).json({ error: "الجلسة منتهية - يرجى تسجيل الدخول مجدداً" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.isAdmin) {
    return res.status(403).json({ error: "غير مسموح - صلاحيات المدير مطلوبة" });
  }
  next();
}

export function generateToken(userId: number, isAdmin: boolean): string {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, { expiresIn: "7d" });
}
