import { Router } from "express";
import { db } from "@workspace/db";
import { externalPagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  imageUrl: z.string().optional().nullable(),
  contentText: z.string().optional().nullable(),
});

// Public: list all external pages (for dropdowns)
router.get("/external-pages", async (_req, res) => {
  try {
    const pages = await db
      .select()
      .from(externalPagesTable)
      .orderBy(asc(externalPagesTable.createdAt));
    res.json(pages);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Public: get page by slug (includes designJson)
router.get("/p/:slug", async (req, res) => {
  try {
    const [page] = await db
      .select()
      .from(externalPagesTable)
      .where(eq(externalPagesTable.slug, req.params.slug));
    if (!page) return res.status(404).json({ error: "الصفحة غير موجودة" });
    res.json(page);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Admin: get single page by id
router.get("/admin/external-pages/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [page] = await db
      .select()
      .from(externalPagesTable)
      .where(eq(externalPagesTable.id, id));
    if (!page) return res.status(404).json({ error: "الصفحة غير موجودة" });
    res.json(page);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Admin CRUD
router.get("/admin/external-pages", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const pages = await db
      .select()
      .from(externalPagesTable)
      .orderBy(asc(externalPagesTable.createdAt));
    res.json(pages);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/admin/external-pages", requireAuth, requireAdmin, async (req, res) => {
  try {
    const parsed = pageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });
    const [page] = await db
      .insert(externalPagesTable)
      .values(parsed.data)
      .returning();
    res.json(page);
  } catch (err: any) {
    if (err?.code === "23505") return res.status(400).json({ error: "الـ slug مستخدم مسبقاً" });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/admin/external-pages/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const parsed = pageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "بيانات غير صالحة" });
    const [page] = await db
      .update(externalPagesTable)
      .set(parsed.data)
      .where(eq(externalPagesTable.id, id))
      .returning();
    if (!page) return res.status(404).json({ error: "الصفحة غير موجودة" });
    res.json(page);
  } catch (err: any) {
    if (err?.code === "23505") return res.status(400).json({ error: "الـ slug مستخدم مسبقاً" });
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Admin: save design only
router.put("/admin/external-pages/:id/design", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { designJson } = req.body as { designJson: string };
    if (typeof designJson !== "string") return res.status(400).json({ error: "designJson مطلوب" });
    const [page] = await db
      .update(externalPagesTable)
      .set({ designJson })
      .where(eq(externalPagesTable.id, id))
      .returning();
    if (!page) return res.status(404).json({ error: "الصفحة غير موجودة" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/admin/external-pages/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(externalPagesTable).where(eq(externalPagesTable.id, id));
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
