import { Router } from "express";
import { db } from "@workspace/db";
import {
  studyStagesTable,
  studyGradesTable,
  studySubjectsTable,
  studyUnitsTable,
  studyLessonsTable,
  studyQuestionsTable,
} from "@workspace/db/schema";
import { eq, inArray, sql, asc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

/* ════════════════════ PUBLIC ════════════════════ */

router.get("/study/stages", async (_req, res) => {
  try {
    const stages = await db.select().from(studyStagesTable).orderBy(asc(studyStagesTable.order));
    res.json(stages);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.get("/study/grades", async (req, res) => {
  const { stageId } = req.query;
  try {
    let rows;
    if (stageId) {
      rows = await db.select().from(studyGradesTable)
        .where(eq(studyGradesTable.stageId, Number(stageId)))
        .orderBy(asc(studyGradesTable.order));
    } else {
      rows = await db.select().from(studyGradesTable).orderBy(asc(studyGradesTable.order));
    }
    res.json(rows);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.get("/study/subjects", async (req, res) => {
  const { gradeId } = req.query;
  try {
    let rows;
    if (gradeId) {
      rows = await db.select().from(studySubjectsTable)
        .where(eq(studySubjectsTable.gradeId, Number(gradeId)))
        .orderBy(asc(studySubjectsTable.id));
    } else {
      rows = await db.select().from(studySubjectsTable).orderBy(asc(studySubjectsTable.id));
    }
    res.json(rows);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.get("/study/units", async (req, res) => {
  const { subjectId, term } = req.query;
  if (!subjectId) return res.status(400).json({ error: "subjectId required" });
  try {
    const units = await db.select().from(studyUnitsTable)
      .where(eq(studyUnitsTable.subjectId, Number(subjectId)))
      .orderBy(asc(studyUnitsTable.id));
    const filtered = term ? units.filter((u) => u.term === Number(term)) : units;
    res.json(filtered);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.get("/study/lessons", async (req, res) => {
  const { unitId } = req.query;
  if (!unitId) return res.status(400).json({ error: "unitId required" });
  try {
    const lessons = await db.select().from(studyLessonsTable)
      .where(eq(studyLessonsTable.unitId, Number(unitId)))
      .orderBy(asc(studyLessonsTable.id));
    res.json(lessons);
  } catch { res.status(500).json({ error: "Server error" }); }
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
      questions = await db.select().from(studyQuestionsTable)
        .where(eq(studyQuestionsTable.unitId, Number(unitId)))
        .orderBy(sql`RANDOM()`);
    }
    res.json(questions);
  } catch { res.status(500).json({ error: "Server error" }); }
});

/* ════════════════════ ADMIN ════════════════════ */

// ── Stages ──
router.get("/admin/study/stages", requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await db.select().from(studyStagesTable).orderBy(asc(studyStagesTable.order))); }
  catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/admin/study/stages", requireAuth, requireAdmin, async (req, res) => {
  const { name, order } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name required" });
  try {
    const [row] = await db.insert(studyStagesTable).values({ name: name.trim(), order: Number(order) || 0 }).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/admin/study/stages/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, order } = req.body;
  try {
    const [row] = await db.update(studyStagesTable)
      .set({ name: name?.trim(), order: Number(order) || 0 })
      .where(eq(studyStagesTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/admin/study/stages/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyStagesTable).where(eq(studyStagesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ── Grades ──
router.get("/admin/study/grades", requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await db.select().from(studyGradesTable).orderBy(asc(studyGradesTable.order))); }
  catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/admin/study/grades", requireAuth, requireAdmin, async (req, res) => {
  const { name, stageId, order } = req.body;
  if (!name?.trim() || !stageId) return res.status(400).json({ error: "name, stageId required" });
  try {
    const [row] = await db.insert(studyGradesTable)
      .values({ name: name.trim(), stageId: Number(stageId), order: Number(order) || 0 }).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/admin/study/grades/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, stageId, order } = req.body;
  try {
    const [row] = await db.update(studyGradesTable)
      .set({ name: name?.trim(), stageId: Number(stageId), order: Number(order) || 0 })
      .where(eq(studyGradesTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/admin/study/grades/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyGradesTable).where(eq(studyGradesTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ── Subjects ──
router.get("/admin/study/subjects", requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await db.select().from(studySubjectsTable).orderBy(asc(studySubjectsTable.id))); }
  catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/admin/study/subjects", requireAuth, requireAdmin, async (req, res) => {
  const { name, gradeId } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name required" });
  try {
    const [row] = await db.insert(studySubjectsTable)
      .values({ name: name.trim(), gradeId: gradeId ? Number(gradeId) : null }).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/admin/study/subjects/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, gradeId } = req.body;
  try {
    const [row] = await db.update(studySubjectsTable)
      .set({ name: name?.trim(), gradeId: gradeId ? Number(gradeId) : null })
      .where(eq(studySubjectsTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/admin/study/subjects/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studySubjectsTable).where(eq(studySubjectsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ── Units ──
router.get("/admin/study/units", requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await db.select().from(studyUnitsTable).orderBy(asc(studyUnitsTable.id))); }
  catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/admin/study/units", requireAuth, requireAdmin, async (req, res) => {
  const { name, subjectId, term } = req.body;
  if (!name?.trim() || !subjectId || !term) return res.status(400).json({ error: "name, subjectId, term required" });
  try {
    const [row] = await db.insert(studyUnitsTable)
      .values({ name: name.trim(), subjectId: Number(subjectId), term: Number(term) }).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/admin/study/units/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, subjectId, term } = req.body;
  try {
    const [row] = await db.update(studyUnitsTable)
      .set({ name: name?.trim(), subjectId: Number(subjectId), term: Number(term) })
      .where(eq(studyUnitsTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/admin/study/units/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyUnitsTable).where(eq(studyUnitsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ── Lessons ──
router.get("/admin/study/lessons", requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await db.select().from(studyLessonsTable).orderBy(asc(studyLessonsTable.id))); }
  catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/admin/study/lessons", requireAuth, requireAdmin, async (req, res) => {
  const { name, unitId } = req.body;
  if (!name?.trim() || !unitId) return res.status(400).json({ error: "name, unitId required" });
  try {
    const [row] = await db.insert(studyLessonsTable)
      .values({ name: name.trim(), unitId: Number(unitId) }).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/admin/study/lessons/:id", requireAuth, requireAdmin, async (req, res) => {
  const { name, unitId } = req.body;
  try {
    const [row] = await db.update(studyLessonsTable)
      .set({ name: name?.trim(), unitId: Number(unitId) })
      .where(eq(studyLessonsTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/admin/study/lessons/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyLessonsTable).where(eq(studyLessonsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

// ── Questions ──
router.get("/admin/study/questions", requireAuth, requireAdmin, async (_req, res) => {
  try { res.json(await db.select().from(studyQuestionsTable).orderBy(asc(studyQuestionsTable.id))); }
  catch { res.status(500).json({ error: "Server error" }); }
});

router.post("/admin/study/questions", requireAuth, requireAdmin, async (req, res) => {
  const { subjectId, unitId, lessonId, questionText, questionImage, answerText, answerImage } = req.body;
  if (!subjectId || !unitId || !questionText?.trim() || !answerText?.trim())
    return res.status(400).json({ error: "subjectId, unitId, questionText, answerText required" });
  try {
    const [row] = await db.insert(studyQuestionsTable).values({
      subjectId: Number(subjectId), unitId: Number(unitId),
      lessonId: lessonId ? Number(lessonId) : null,
      questionText: questionText.trim(), questionImage: questionImage || null,
      answerText: answerText.trim(), answerImage: answerImage || null,
    }).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.put("/admin/study/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  const { subjectId, unitId, lessonId, questionText, questionImage, answerText, answerImage } = req.body;
  try {
    const [row] = await db.update(studyQuestionsTable).set({
      subjectId: Number(subjectId), unitId: Number(unitId),
      lessonId: lessonId ? Number(lessonId) : null,
      questionText: questionText?.trim(), questionImage: questionImage || null,
      answerText: answerText?.trim(), answerImage: answerImage || null,
    }).where(eq(studyQuestionsTable.id, Number(req.params.id))).returning();
    res.json(row);
  } catch { res.status(500).json({ error: "Server error" }); }
});

router.delete("/admin/study/questions/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await db.delete(studyQuestionsTable).where(eq(studyQuestionsTable.id, Number(req.params.id)));
    res.json({ ok: true });
  } catch { res.status(500).json({ error: "Server error" }); }
});

export default router;
