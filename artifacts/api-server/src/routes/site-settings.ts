import { Router } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth";

const router = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(siteSettingsTable).values({}).returning();
  return created;
}

// GET /api/site-settings  (public — needed by frontend to show logo on QR)
router.get("/site-settings", async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      siteName: settings.siteName,
      siteLogoUrl: settings.siteLogoUrl,
    });
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب الإعدادات" });
  }
});

// PUT /api/admin/site-settings  (admin only)
router.put("/admin/site-settings", requireAdmin, async (req, res) => {
  try {
    const { siteLogoUrl, siteName } = req.body as {
      siteLogoUrl?: string;
      siteName?: string;
    };

    const existing = await getOrCreateSettings();

    const [updated] = await db
      .update(siteSettingsTable)
      .set({
        ...(siteLogoUrl !== undefined && { siteLogoUrl }),
        ...(siteName !== undefined && { siteName }),
        updatedAt: new Date(),
      })
      .where(eq(siteSettingsTable.id, existing.id))
      .returning();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "خطأ في تحديث الإعدادات" });
  }
});

export default router;
