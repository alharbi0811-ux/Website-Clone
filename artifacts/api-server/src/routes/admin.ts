import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, questionsTable, usersTable } from "@workspace/db";
import { eq, count, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = Router();

router.use(requireAuth, requireAdmin);

// ───── Stats ─────
router.get("/admin/stats", async (_req, res) => {
  try {
    const [catCount] = await db.select({ count: count() }).from(categoriesTable);
    const [qCount] = await db.select({ count: count() }).from(questionsTable);
    const [uCount] = await db.select({ count: count() }).from(usersTable);
    res.json({
      categories: catCount.count,
      questions: qCount.count,
      users: uCount.count,
    });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ───── Categories ─────
router.get("/admin/categories", async (_req, res) => {
  try {
    const cats = await db
      .select()
      .from(categoriesTable)
      .orderBy(desc(categoriesTable.createdAt));
    const withCount = await Promise.all(
      cats.map(async (cat) => {
        const [{ count: qCount }] = await db
          .select({ count: count() })
          .from(questionsTable)
          .where(eq(questionsTable.categoryId, cat.id));
        return { ...cat, questionCount: Number(qCount) };
      })
    );
    res.json(withCount);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

const categorySchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().min(1),
  section: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  flagUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

router.post("/admin/categories", async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صحيحة" });
  try {
    const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
    res.status(201).json(cat);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/admin/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صحيحة" });
  try {
    const [cat] = await db
      .update(categoriesTable)
      .set(parsed.data)
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!cat) return res.status(404).json({ error: "الفئة غير موجودة" });
    res.json(cat);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/admin/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(questionsTable).where(eq(questionsTable.categoryId, id));
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ───── Questions ─────
router.get("/admin/questions", async (req, res) => {
  try {
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : null;
    const qs = await db
      .select()
      .from(questionsTable)
      .where(categoryId ? eq(questionsTable.categoryId, categoryId) : undefined)
      .orderBy(desc(questionsTable.createdAt));
    res.json(qs);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

const questionSchema = z.object({
  categoryId: z.number().int().positive(),
  questionText: z.string().min(1),
  answer: z.string().min(1),
  optionA: z.string().optional(),
  optionB: z.string().optional(),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctOption: z.enum(["a", "b", "c", "d"]).optional(),
  points: z.number().int().optional().default(100),
  timeSeconds: z.number().int().optional().default(30),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  imageUrl: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

router.post("/admin/questions", async (req, res) => {
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صحيحة", details: parsed.error.issues });
  try {
    const [q] = await db.insert(questionsTable).values(parsed.data).returning();
    res.status(201).json(q);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/admin/questions/:id", async (req, res) => {
  const id = Number(req.params.id);
  const parsed = questionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "بيانات غير صحيحة" });
  try {
    const [q] = await db
      .update(questionsTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(questionsTable.id, id))
      .returning();
    if (!q) return res.status(404).json({ error: "السؤال غير موجود" });
    res.json(q);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/admin/questions/:id", async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(questionsTable).where(eq(questionsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ───── Users ─────
router.get("/admin/users", async (_req, res) => {
  try {
    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        displayName: usersTable.displayName,
        isAdmin: usersTable.isAdmin,
        role: usersTable.role,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt));
    res.json(users);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

const ROLES = ["superadmin", "admin", "moderator", "player"] as const;
type Role = typeof ROLES[number];
const ROLE_IS_ADMIN: Record<Role, boolean> = {
  superadmin: true,
  admin: true,
  moderator: false,
  player: false,
};

router.patch("/admin/users/:id/role", async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { role } = req.body as { role: Role };

  if (!ROLES.includes(role)) {
    return res.status(400).json({ error: "رتبة غير صحيحة" });
  }

  const [callerUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!callerUser || callerUser.role !== "superadmin") {
    const targetIsSuperadmin = await db.select({ role: usersTable.role }).from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (targetIsSuperadmin[0]?.role === "superadmin") {
      return res.status(403).json({ error: "لا يمكن تعديل رتبة المدير الأول" });
    }
  }

  if (id === req.userId && role !== "superadmin") {
    return res.status(400).json({ error: "لا يمكنك تخفيض رتبتك" });
  }

  try {
    const isAdmin = ROLE_IS_ADMIN[role];
    const [updated] = await db
      .update(usersTable)
      .set({ role, isAdmin })
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id, role: usersTable.role, isAdmin: usersTable.isAdmin });
    if (!updated) return res.status(404).json({ error: "المستخدم غير موجود" });
    res.json(updated);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
