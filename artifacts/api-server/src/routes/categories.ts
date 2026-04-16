import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, questionsTable, externalPagesTable } from "@workspace/db";
import { eq, asc, and, notInArray, sql, inArray } from "drizzle-orm";

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
          status: c.status ?? "open",
          lockMessage: c.lockMessage ?? null,
        })),
      }));

    res.json(sections);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// GET /api/categories/statuses?ids=1,2,3,4,5,6
router.get("/categories/statuses", async (req, res) => {
  try {
    const raw = String(req.query.ids || "");
    const ids = raw.split(",").map(Number).filter(Boolean);
    if (ids.length === 0) return res.json({});

    const cats = await db
      .select({ id: categoriesTable.id, status: categoriesTable.status, lockMessage: categoriesTable.lockMessage })
      .from(categoriesTable)
      .where(inArray(categoriesTable.id, ids));

    const result: Record<string, { status: string; lockMessage: string | null }> = {};
    for (const cat of cats) {
      result[String(cat.id)] = { status: cat.status, lockMessage: cat.lockMessage };
    }
    res.json(result);
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

// Random question for game play
// GET /api/questions/game?categoryId=:id&points=200|400|600&excludeIds=1,2,3
router.get("/questions/game", async (req, res) => {
  try {
    const categoryId = Number(req.query.categoryId);
    const points = Number(req.query.points) || undefined;
    const excludeIds = req.query.excludeIds
      ? String(req.query.excludeIds).split(",").map(Number).filter(Boolean)
      : [];

    if (!categoryId) return res.status(400).json({ error: "categoryId مطلوب" });
    if (!points || ![200, 400, 600].includes(points)) return res.status(400).json({ error: "points يجب أن يكون 200 أو 400 أو 600" });

    const conditions = [
      eq(questionsTable.categoryId, categoryId),
      eq(questionsTable.isActive, true),
      eq(questionsTable.points, points),
      ...(excludeIds.length > 0 ? [notInArray(questionsTable.id, excludeIds)] : []),
    ];
    const where = and(...conditions);

    const questions = await db
      .select()
      .from(questionsTable)
      .where(where)
      .orderBy(sql`RANDOM()`)
      .limit(1);

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
      answerImage: q.answerImageUrl ?? "",
    });
  } catch {
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

export default router;
