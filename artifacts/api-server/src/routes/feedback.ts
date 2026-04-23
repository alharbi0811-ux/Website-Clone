import { Router } from "express";
import { db } from "@workspace/db";
import { feedbackTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/feedback", async (req, res) => {
  try {
    const { username, message } = req.body as { username?: string; message?: string };
    if (!message?.trim()) return res.status(400).json({ error: "الرسالة مطلوبة" });
    const [row] = await db.insert(feedbackTable).values({
      username: username?.trim() || "زائر",
      message: message.trim(),
    }).returning();
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "خطأ في الإرسال" });
  }
});

router.get("/admin/feedback", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const items = await db.select().from(feedbackTable).orderBy(desc(feedbackTable.createdAt));
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "خطأ في جلب الرسائل" });
  }
});

router.patch("/admin/feedback/:id/read", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.update(feedbackTable)
      .set({ isRead: true })
      .where(eq(feedbackTable.id, id))
      .returning();
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: "خطأ في التحديث" });
  }
});

router.delete("/admin/feedback/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(feedbackTable).where(eq(feedbackTable.id, id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "خطأ في الحذف" });
  }
});

export default router;
