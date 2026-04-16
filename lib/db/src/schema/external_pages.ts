import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const externalPagesTable = pgTable("external_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  contentText: text("content_text"),
  designJson: text("design_json").default("{}"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertExternalPageSchema = createInsertSchema(externalPagesTable).omit({
  id: true,
  createdAt: true,
});

export type ExternalPage = typeof externalPagesTable.$inferSelect;
export type InsertExternalPage = z.infer<typeof insertExternalPageSchema>;
