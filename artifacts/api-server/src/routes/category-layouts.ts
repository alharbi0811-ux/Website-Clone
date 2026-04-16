import { Router } from "express";
import { db } from "@workspace/db";
import { categoryLayoutsTable, categoriesTable, DEFAULT_LAYOUT_SETTINGS } from "@workspace/db";
import { eq, and, isNull } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// GET /api/category-layouts/for-category/:categoryId
// Returns effective settings for a category (override → default → hardcoded defaults)
router.get("/category-layouts/for-category/:categoryId", async (req, res) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const pageKeys = ["question", "answer", "result"];
    const result: Record<string, typeof DEFAULT_LAYOUT_SETTINGS> = {};

    for (const pageKey of pageKeys) {
      // Try category-specific override
      const [override] = await db
        .select()
        .from(categoryLayoutsTable)
        .where(
          and(
            eq(categoryLayoutsTable.categoryId, categoryId),
            eq(categoryLayoutsTable.pageKey, pageKey)
          )
        )
        .limit(1);

      if (override) {
        result[pageKey] = { ...DEFAULT_LAYOUT_SETTINGS, ...JSON.parse(override.settingsJson) };
        continue;
      }

      // Fall back to default (categoryId IS NULL)
      const [defaultLayout] = await db
        .select()
        .from(categoryLayoutsTable)
        .where(
          and(
            isNull(categoryLayoutsTable.categoryId),
            eq(categoryLayoutsTable.pageKey, pageKey)
          )
        )
        .limit(1);

      result[pageKey] = defaultLayout
        ? { ...DEFAULT_LAYOUT_SETTINGS, ...JSON.parse(defaultLayout.settingsJson) }
        : { ...DEFAULT_LAYOUT_SETTINGS };
    }

    res.json(result);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// ── Admin routes (protected) ────────────────────────────────────────────────

// GET /api/admin/category-layouts — list all saved layouts
router.get("/admin/category-layouts", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const layouts = await db.select().from(categoryLayoutsTable);
    res.json(layouts);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// PUT /api/admin/category-layouts — upsert a layout
router.put("/admin/category-layouts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoryId, pageKey, settings } = req.body;
    if (!pageKey) return res.status(400).json({ error: "pageKey مطلوب" });

    const settingsJson = JSON.stringify(settings || {});

    // Check if exists
    const condition = categoryId
      ? and(eq(categoryLayoutsTable.categoryId, categoryId), eq(categoryLayoutsTable.pageKey, pageKey))
      : and(isNull(categoryLayoutsTable.categoryId), eq(categoryLayoutsTable.pageKey, pageKey));

    const [existing] = await db.select().from(categoryLayoutsTable).where(condition).limit(1);

    if (existing) {
      const [updated] = await db
        .update(categoryLayoutsTable)
        .set({ settingsJson, updatedAt: new Date() })
        .where(eq(categoryLayoutsTable.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(categoryLayoutsTable)
        .values({ categoryId: categoryId || null, pageKey, settingsJson })
        .returning();
      res.json(created);
    }
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// DELETE /api/admin/category-layouts/:categoryId/:pageKey — remove override (revert to default)
router.delete("/admin/category-layouts/:categoryId/:pageKey", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { categoryId, pageKey } = req.params;
    const catId = categoryId === "default" ? null : Number(categoryId);

    const condition = catId
      ? and(eq(categoryLayoutsTable.categoryId, catId), eq(categoryLayoutsTable.pageKey, pageKey))
      : and(isNull(categoryLayoutsTable.categoryId), eq(categoryLayoutsTable.pageKey, pageKey));

    await db.delete(categoryLayoutsTable).where(condition);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /api/admin/category-layouts/defaults — get all default layouts
router.get("/admin/category-layouts/defaults", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const defaults = await db
      .select()
      .from(categoryLayoutsTable)
      .where(isNull(categoryLayoutsTable.categoryId));
    res.json(defaults);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
