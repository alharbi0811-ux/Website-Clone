import { Router } from "express";
import { db } from "@workspace/db";
import { gameSessionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/history", async (req: AuthRequest, res) => {
  try {
    const sessions = await db
      .select()
      .from(gameSessionsTable)
      .where(eq(gameSessionsTable.userId, req.userId!))
      .orderBy(desc(gameSessionsTable.updatedAt));
    return res.json(sessions);
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/history", async (req: AuthRequest, res) => {
  const { gameName, gameData } = req.body;
  if (!gameName || !gameData) {
    return res.status(400).json({ error: "بيانات ناقصة" });
  }
  try {
    const [session] = await db
      .insert(gameSessionsTable)
      .values({
        userId: req.userId!,
        gameName,
        gameData,
        boardState: { playedCells: [], team1Score: 0, team2Score: 0, currentTeam: 1 },
        status: "active",
      })
      .returning();
    return res.status(201).json(session);
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.put("/history/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرف غير صالح" });

  const { boardState, status } = req.body;
  try {
    const [session] = await db
      .update(gameSessionsTable)
      .set({
        ...(boardState !== undefined ? { boardState } : {}),
        ...(status !== undefined ? { status } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(gameSessionsTable.id, id), eq(gameSessionsTable.userId, req.userId!)))
      .returning();
    if (!session) return res.status(404).json({ error: "الجلسة غير موجودة" });
    return res.json(session);
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.delete("/history/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "معرف غير صالح" });
  try {
    await db
      .delete(gameSessionsTable)
      .where(and(eq(gameSessionsTable.id, id), eq(gameSessionsTable.userId, req.userId!)));
    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
