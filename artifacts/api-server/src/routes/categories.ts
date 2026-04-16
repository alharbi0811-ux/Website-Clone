import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, questionsTable, externalPagesTable } from "@workspace/db";
import { eq, asc, and, notInArray, sql } from "drizzle-orm";

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const cats = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(asc(categoriesTable.id));

    const sectionOrder = [
      "أجدد الفئات",
      "الكويت",
      "عام",
      "إسلامي",
      "دول",
      "حروف",
      "ولا كلمة",
      "التفكير",
    ];

    const grouped: Record<string, typeof cats> = {};
    for (const cat of cats) {
      const sec = cat.section || "أخرى";
      if (!grouped[sec]) grouped[sec] = [];
      grouped[sec].push(cat);
    }

    const sections = Object.keys(grouped)
      .sort((a, b) => {
        const ia = sectionOrder.indexOf(a);
        const ib = sectionOrder.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      })
      .map((name) => ({
        name,
        flagUrl: grouped[name][0]?.flagUrl ?? null,
        categories: grouped[name].map((c) => ({
          id: String(c.id),
          name: c.nameAr,
          img: c.imageUrl ?? "",
          flag: c.flagUrl ?? undefined,
        })),
      }));

    res.json(sections);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Random question for game play
// GET /api/questions/game?categoryId=:id&difficulty=easy|medium|hard&excludeIds=1,2,3
router.get("/questions/game", async (req, res) => {
  try {
    const categoryId = Number(req.query.categoryId);
    const difficulty = (req.query.difficulty as string) || undefined;
    const excludeIds = req.query.excludeIds
      ? String(req.query.excludeIds).split(",").map(Number).filter(Boolean)
      : [];

    if (!categoryId) return res.status(400).json({ error: "categoryId مطلوب" });

    const diffMap: Record<string, string> = { "200": "easy", "400": "medium", "600": "hard" };
    const resolvedDiff = difficulty ?? undefined;

    const buildWhere = (withDiff: boolean) => {
      const conditions = [
        eq(questionsTable.categoryId, categoryId),
        eq(questionsTable.isActive, true),
        ...(withDiff && resolvedDiff ? [eq(questionsTable.difficulty, resolvedDiff as any)] : []),
        ...(excludeIds.length > 0 ? [notInArray(questionsTable.id, excludeIds)] : []),
      ];
      return conditions.length === 1 ? conditions[0] : and(...conditions);
    };

    // Try with difficulty first, then fall back to any
    let questions = await db
      .select()
      .from(questionsTable)
      .where(buildWhere(true))
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (questions.length === 0 && resolvedDiff) {
      questions = await db
        .select()
        .from(questionsTable)
        .where(buildWhere(false))
        .orderBy(sql`RANDOM()`)
        .limit(1);
    }

    if (questions.length === 0) return res.status(404).json({ error: "لا توجد أسئلة لهذه الفئة" });

    const q = questions[0];

    let externalPageSlug: string | null = null;
    if (q.externalPageId) {
      const [ep] = await db
        .select({ slug: externalPagesTable.slug })
        .from(externalPagesTable)
        .where(eq(externalPagesTable.id, q.externalPageId));
      externalPageSlug = ep?.slug ?? null;
    }

    res.json({
      id: q.id,
      question: q.questionText,
      answer: q.answer,
      image: q.imageUrl ?? "",
      points: q.points,
      difficulty: q.difficulty,
      externalPageId: q.externalPageId ?? null,
      externalPageSlug,
      qrTemplateId: q.qrTemplateId ?? null,
    });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
