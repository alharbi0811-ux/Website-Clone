import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable, loginSchema, registerSchema } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
  }

  const { username, password } = parsed.data;

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
      .values({ username, passwordHash, displayName: username })
      .returning({ id: usersTable.id, username: usersTable.username, isAdmin: usersTable.isAdmin, displayName: usersTable.displayName });

    const token = generateToken(user.id, user.isAdmin);
    return res.status(201).json({ token, user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin } });
  } catch (err) {
    return res.status(500).json({ error: "خطأ في الخادم" });
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

    const token = generateToken(user.id, user.isAdmin);
    return res.json({ token, user: { id: user.id, username: user.username, displayName: user.displayName, isAdmin: user.isAdmin } });
  } catch (err) {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({ id: usersTable.id, username: usersTable.username, displayName: usersTable.displayName, isAdmin: usersTable.isAdmin })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (!user) return res.status(404).json({ error: "المستخدم غير موجود" });
    return res.json({ user });
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
