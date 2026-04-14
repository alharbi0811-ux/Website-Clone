import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

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

export default router;
