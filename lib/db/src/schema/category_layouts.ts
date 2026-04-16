import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { categoriesTable } from "./questions";

export const categoryLayoutsTable = pgTable("category_layouts", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => categoriesTable.id, { onDelete: "cascade" }),
  pageKey: text("page_key").notNull(),
  settingsJson: text("settings_json").notNull().default("{}"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CategoryLayout = typeof categoryLayoutsTable.$inferSelect;
export type NewCategoryLayout = typeof categoryLayoutsTable.$inferInsert;

export const DEFAULT_LAYOUT_SETTINGS = {
  bgColor: "#ffffff",
  accentColor: "#7B2FBE",
  textColor: "#111827",
  cardBgColor: "#ffffff",
  showQr: true,
  showImage: true,
  showCategoryBadge: true,
  showTimer: true,
  questionTextSize: 30,
  answerTextSize: 100,
  bgImageUrl: null as string | null,
};

export type LayoutSettings = typeof DEFAULT_LAYOUT_SETTINGS;
