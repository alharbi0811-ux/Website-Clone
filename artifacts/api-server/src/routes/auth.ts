import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, loginSchema, registerSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth, type AuthRequest } from "../middleware/auth";
import { sendOtp, verifyOtp } from "../services/otp";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_change_me";

function generateTempToken(userId: number): string {
  return jwt.sign({ userId, purpose: "otp-pending" }, JWT_SECRET, { expiresIn: "10m" });
}

function verifyTempToken(token: string): { userId: number } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; purpose: string };
    if (payload.purpose !== "otp-pending") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
  }

  const { username, password } = parsed.data;
  const phone: string | undefined = typeof req.body.phone === "string" ? req.body.phone.trim() : undefined;

  try {
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "اسم المستخدم مستخدم بالفعل" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [user] = await db
      .insert(usersTable)
      .values({ username, passwordHash, displayName: username, phone: phone || null })
      .returning({
        id: usersTable.id,
        username: usersTable.username,
        isAdmin: usersTable.isAdmin,
        displayName: usersTable.displayName,
        role: usersTable.role,
      });

    if (phone) {
      await sendOtp(user.id, phone);
      const tempToken = generateTempToken(user.id);
      return res.status(201).json({ requiresOtp: true, tempToken, phone: maskPhone(phone) });
    }

    const token = generateToken(user.id, user.isAdmin);
    return res.status(201).json({
      token,
      user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin, role: user.role },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ في الخادم";
    return res.status(500).json({ error: msg });
  }
});

router.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "بيانات غير صحيحة" });
  }

  const { username, password } = parsed.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }

    const userData = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      isAdmin: user.isAdmin,
      role: user.role,
    };

    if (user.otpExempt || !user.phone) {
      const token = generateToken(user.id, user.isAdmin);
      return res.json({ token, user: userData });
    }

    const tempToken = generateTempToken(user.id);
    return res.json({ requiresOtp: true, tempToken, phone: maskPhone(user.phone) });
  } catch (err) {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/auth/send-otp", async (req, res) => {
  const { tempToken } = req.body;
  if (!tempToken) return res.status(400).json({ error: "رمز مؤقت مطلوب" });

  const payload = verifyTempToken(tempToken);
  if (!payload) return res.status(401).json({ error: "الجلسة المؤقتة منتهية، يرجى تسجيل الدخول مجدداً" });

  try {
    const [user] = await db
      .select({ id: usersTable.id, phone: usersTable.phone })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user?.phone) return res.status(400).json({ error: "لا يوجد رقم هاتف مرتبط بهذا الحساب" });

    await sendOtp(user.id, user.phone);
    return res.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ في إرسال الرمز";
    return res.status(429).json({ error: msg });
  }
});

router.post("/auth/verify-otp", async (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) return res.status(400).json({ error: "البيانات ناقصة" });

  const payload = verifyTempToken(tempToken);
  if (!payload) return res.status(401).json({ error: "الجلسة المؤقتة منتهية، يرجى تسجيل الدخول مجدداً" });

  try {
    // Fetch phone to pass to Twilio Verify check
    const [userRow] = await db
      .select({ phone: usersTable.phone })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    const ok = await verifyOtp(payload.userId, code.trim(), userRow?.phone ?? undefined);
    if (!ok) return res.status(400).json({ error: "الرمز غير صحيح أو منتهي الصلاحية" });

    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        isAdmin: usersTable.isAdmin,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.id, payload.userId))
      .limit(1);

    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });

    const token = generateToken(user.id, user.isAdmin);
    return res.json({ token, user });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "خطأ في التحقق";
    return res.status(400).json({ error: msg });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        isAdmin: usersTable.isAdmin,
        role: usersTable.role,
      })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    return res.json({ user });
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

function maskPhone(phone: string): string {
  if (phone.length <= 4) return "****";
  return phone.slice(0, -4).replace(/./g, "*") + phone.slice(-4);
}

export default router;
