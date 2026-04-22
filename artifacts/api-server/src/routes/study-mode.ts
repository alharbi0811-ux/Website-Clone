import { Router } from "express";
import { db } from "@workspace/db";
import {
  studySubjectsTable,
  studyUnitsTable,
  studyLessonsTable,
  studyQuestionsTable,
} from "@workspace/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

/* ──────────────────── PUBLIC ──────────────────── */

router.get("/study/subjects", async (_req, res) => {
  try {
    const subjects = await db.select().from(studySubjectsTable).orderBy(studySubjectsTable.id);
    res.json(subjects);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/study/units", async (req, res) => {
  const { subjectId, term } = req.query;
  if (!subjectId) return res.status(400).json({ error: "subjectId required" });
  try {
    let query = db.select().from(studyUnitsTable).where(eq(studyUnitsTable.subjectId, Number(subjectId)));
    const units = await query.orderBy(studyUnitsTable.id);
    const filtered = term ? units.filter((u) => u.term === Number(term)) : units;
    res.json(filtered);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/study/lessons", async (req, res) => {
  const { unitId } = req.query;
  if (!unitId) return res.status(400).json({ error: "unitId required" });
  try {
    const lessons = await db
      .select()
      .from(studyLessonsTable)
      .where(eq(studyLessonsTable.unitId, Number(unitId)))
      .orderBy(studyLessonsTable.id);
    res.json(lessons);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/study/questions", async (req, res) => {
  const { unitId, lessonIds } = req.query;
  if (!unitId) return res.status(400).json({ error: "unitId required" });
  try {
    let questions;
    if (lessonIds) {
      const ids = String(lessonIds).split(",").map(Number).filter(Boolean);
      questions = ids.length
        ? await db.select().from(studyQuestionsTable).where(inArray(studyQuestionsTable.lessonId, ids))
        : [];
    } else {
      questions = await db
        .select()
        .from(studyQuestionsTable)
        .where(eq(studyQuestionsTable.unitId, Number(unitId)))
        .orderBy(sql`RANDOM()`);
    }
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

/* ──────────────────── ADMIN ──────────────────── */

// Subjects CRUD
router.get("/admin/study/subjects", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const subjects = await db.select().from(studySubjectsTable).orderBy(studySubjectsTable.id);
    res.json(subjects);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/study/subjects", requireAuth, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name required" });
  try {
    const [row] = await db.insert(studySubjectsTable).values({ name: name.trim() }).returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/admin/study/subjects/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name required" });
  try {
    const [row] = await db
      .update(studySubjectsTable)
      .set({ name: name.trim() })
      .where(eq(studySubjectsTable.id, Number(req.params.id)))
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/study/subjects/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studySubjectsTable).where(eq(studySubjectsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Units CRUD
router.get("/admin/study/units", requireAuth, requireAdmin, async (req, res) => {
  try {
    const units = await db.select().from(studyUnitsTable).orderBy(studyUnitsTable.id);
    res.json(units);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/study/units", requireAuth, requireAdmin, async (req, res) => {
  const { name, subjectId, term } = req.body;
  if (!name?.trim() || !subjectId || !term) return res.status(400).json({ error: "name, subjectId, term required" });
  try {
    const [row] = await db
      .insert(studyUnitsTable)
      .values({ name: name.trim(), subjectId: Number(subjectId), term: Number(term) })
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/admin/study/units/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, subjectId, term } = req.body;
  try {
    const [row] = await db
      .update(studyUnitsTable)
      .set({ name: name?.trim(), subjectId: Number(subjectId), term: Number(term) })
      .where(eq(studyUnitsTable.id, Number(req.params.id)))
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/study/units/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyUnitsTable).where(eq(studyUnitsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Lessons CRUD
router.get("/admin/study/lessons", requireAuth, requireAdmin, async (req, res) => {
  try {
    const lessons = await db.select().from(studyLessonsTable).orderBy(studyLessonsTable.id);
    res.json(lessons);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/study/lessons", requireAuth, requireAdmin, async (req, res) => {
  const { name, unitId } = req.body;
  if (!name?.trim() || !unitId) return res.status(400).json({ error: "name, unitId required" });
  try {
    const [row] = await db
      .insert(studyLessonsTable)
      .values({ name: name.trim(), unitId: Number(unitId) })
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/admin/study/lessons/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, unitId } = req.body;
  try {
    const [row] = await db
      .update(studyLessonsTable)
      .set({ name: name?.trim(), unitId: Number(unitId) })
      .where(eq(studyLessonsTable.id, Number(req.params.id)))
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/study/lessons/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyLessonsTable).where(eq(studyLessonsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

// Study Questions CRUD
router.get("/admin/study/questions", requireAuth, requireAdmin, async (req, res) => {
  try {
    const questions = await db
      .select()
      .from(studyQuestionsTable)
      .orderBy(studyQuestionsTable.id);
    res.json(questions);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/study/questions", requireAuth, requireAdmin, async (req, res) => {
  const { subjectId, unitId, lessonId, questionText, questionImage, answerText, answerImage } = req.body;
  if (!subjectId || !unitId || !questionText?.trim() || !answerText?.trim())
    return res.status(400).json({ error: "subjectId, unitId, questionText, answerText required" });
  try {
    const [row] = await db
      .insert(studyQuestionsTable)
      .values({
        subjectId: Number(subjectId),
        unitId: Number(unitId),
        lessonId: lessonId ? Number(lessonId) : null,
        questionText: questionText.trim(),
        questionImage: questionImage || null,
        answerText: answerText.trim(),
        answerImage: answerImage || null,
      })
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/admin/study/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  const { subjectId, unitId, lessonId, questionText, questionImage, answerText, answerImage } = req.body;
  try {
    const [row] = await db
      .update(studyQuestionsTable)
      .set({
        subjectId: Number(subjectId),
        unitId: Number(unitId),
        lessonId: lessonId ? Number(lessonId) : null,
        questionText: questionText?.trim(),
        questionImage: questionImage || null,
        answerText: answerText?.trim(),
        answerImage: answerImage || null,
      })
      .where(eq(studyQuestionsTable.id, Number(req.params.id)))
      .returning();
    res.json(row);
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/admin/study/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyQuestionsTable).where(eq(studyQuestionsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
