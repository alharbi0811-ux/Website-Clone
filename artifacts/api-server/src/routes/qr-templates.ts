import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, qrTemplates } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `qr-template-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.get("/qr-templates/active", async (_req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const [template] = await db
      .select()
      .from(qrTemplates)
      .where(eq(qrTemplates.isActive, true))
      .limit(1);
    res.json(template || null);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch active template" });
  }
});

router.get("/admin/qr-templates", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const templates = await db
      .select()
      .from(qrTemplates)
      .orderBy(qrTemplates.createdAt);
    res.json(templates);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

router.post(
  "/admin/qr-templates",
  requireAuth,
  requireAdmin,
  upload.single("templateImage"),
  async (req, res) => {
    try {
      const { name, qrPositionX, qrPositionY, qrSize } = req.body;
      if (!name) return res.status(400).json({ error: "الاسم مطلوب" });

      let templateImageUrl: string | undefined;
      if (req.file) {
        templateImageUrl = `/api/uploads/${req.file.filename}`;
      } else if (req.body.templateImageUrl) {
        templateImageUrl = req.body.templateImageUrl;
      }

      const [template] = await db
        .insert(qrTemplates)
        .values({
          name,
          templateImageUrl,
          qrPositionX: qrPositionX ? parseInt(qrPositionX) : 50,
          qrPositionY: qrPositionY ? parseInt(qrPositionY) : 50,
          qrSize: qrSize ? parseInt(qrSize) : 200,
          isActive: false,
        })
        .returning();
      res.status(201).json(template);
    } catch (e) {
      res.status(500).json({ error: "Failed to create template" });
    }
  }
);

router.put(
  "/admin/qr-templates/:id",
  requireAuth,
  requireAdmin,
  upload.single("templateImage"),
  async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, qrPositionX, qrPositionY, qrSize, removeImage } = req.body;

      const updates: Partial<typeof qrTemplates.$inferInsert> = {};
      if (name !== undefined) updates.name = name;
      if (qrPositionX !== undefined) updates.qrPositionX = parseInt(qrPositionX);
      if (qrPositionY !== undefined) updates.qrPositionY = parseInt(qrPositionY);
      if (qrSize !== undefined) updates.qrSize = parseInt(qrSize);

      if (req.file) {
        updates.templateImageUrl = `/api/uploads/${req.file.filename}`;
      } else if (removeImage === "true") {
        updates.templateImageUrl = undefined;
      } else if (req.body.templateImageUrl !== undefined) {
        updates.templateImageUrl = req.body.templateImageUrl || undefined;
      }

      const [updated] = await db
        .update(qrTemplates)
        .set(updates)
        .where(eq(qrTemplates.id, id))
        .returning();
      if (!updated) return res.status(404).json({ error: "Template not found" });
      res.json(updated);
    } catch (e) {
      res.status(500).json({ error: "Failed to update template" });
    }
  }
);

router.patch("/admin/qr-templates/:id/activate", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.update(qrTemplates).set({ isActive: false });
    const [activated] = await db
      .update(qrTemplates)
      .set({ isActive: true })
      .where(eq(qrTemplates.id, id))
      .returning();
    if (!activated) return res.status(404).json({ error: "Template not found" });
    res.json(activated);
  } catch (e) {
    res.status(500).json({ error: "Failed to activate template" });
  }
});

router.patch("/admin/qr-templates/:id/deactivate", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(qrTemplates)
      .set({ isActive: false })
      .where(eq(qrTemplates.id, id))
      .returning();
    if (!updated) return res.status(404).json({ error: "Template not found" });
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: "Failed to deactivate template" });
  }
});

router.delete("/admin/qr-templates/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [deleted] = await db
      .delete(qrTemplates)
      .where(eq(qrTemplates.id, id))
      .returning();
    if (!deleted) return res.status(404).json({ error: "Template not found" });

    if (deleted.templateImageUrl?.startsWith("/api/uploads/")) {
      const filename = deleted.templateImageUrl.split("/api/uploads/")[1];
      const filePath = path.join(uploadsDir, filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: "Failed to delete template" });
  }
});

export default router;
