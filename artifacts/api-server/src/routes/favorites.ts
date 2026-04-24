import { Router } from "express";
import { db } from "@workspace/db";
import { userFavoritesTable, categoriesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/favorites", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({
        id: userFavoritesTable.id,
        categoryId: userFavoritesTable.categoryId,
        usageCount: userFavoritesTable.usageCount,
        lastUsed: userFavoritesTable.lastUsed,
        createdAt: userFavoritesTable.createdAt,
        name: categoriesTable.nameAr,
        imageUrl: categoriesTable.imageUrl,
        flagUrl: categoriesTable.flagUrl,
        status: categoriesTable.status,
        lockMessage: categoriesTable.lockMessage,
      })
      .from(userFavoritesTable)
      .innerJoin(categoriesTable, eq(userFavoritesTable.categoryId, categoriesTable.id))
      .where(eq(userFavoritesTable.userId, req.userId!))
      .orderBy(desc(userFavoritesTable.usageCount), desc(userFavoritesTable.lastUsed));

    return res.json({ favorites: rows });
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/favorites/:categoryId/toggle", requireAuth, async (req: AuthRequest, res) => {
  const categoryId = parseInt(req.params.categoryId);
  if (isNaN(categoryId)) return res.status(400).json({ error: "معرّف غير صحيح" });

  try {
    const [existing] = await db
      .select({ id: userFavoritesTable.id })
      .from(userFavoritesTable)
      .where(and(eq(userFavoritesTable.userId, req.userId!), eq(userFavoritesTable.categoryId, categoryId)))
      .limit(1);

    if (existing) {
      await db.delete(userFavoritesTable).where(eq(userFavoritesTable.id, existing.id));
      return res.json({ isFavorite: false });
    } else {
      await db.insert(userFavoritesTable).values({ userId: req.userId!, categoryId });
      return res.json({ isFavorite: true });
    }
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/favorites/:categoryId/track", requireAuth, async (req: AuthRequest, res) => {
  const categoryId = parseInt(req.params.categoryId);
  if (isNaN(categoryId)) return res.status(400).json({ error: "معرّف غير صحيح" });

  try {
    const [existing] = await db
      .select({ id: userFavoritesTable.id, usageCount: userFavoritesTable.usageCount })
      .from(userFavoritesTable)
      .where(and(eq(userFavoritesTable.userId, req.userId!), eq(userFavoritesTable.categoryId, categoryId)))
      .limit(1);

    if (!existing) return res.json({ ok: true });

    await db
      .update(userFavoritesTable)
      .set({ usageCount: existing.usageCount + 1, lastUsed: new Date() })
      .where(eq(userFavoritesTable.id, existing.id));

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
