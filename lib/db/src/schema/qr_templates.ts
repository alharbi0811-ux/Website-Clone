import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const qrTemplates = pgTable("qr_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  templateImageUrl: text("template_image_url"),
  qrPositionX: integer("qr_position_x").default(50),
  qrPositionY: integer("qr_position_y").default(50),
  qrSize: integer("qr_size").default(200),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type QrTemplate = typeof qrTemplates.$inferSelect;
export type NewQrTemplate = typeof qrTemplates.$inferInsert;
