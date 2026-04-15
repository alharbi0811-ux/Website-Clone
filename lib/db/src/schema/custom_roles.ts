import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const customRolesTable = pgTable("custom_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  label: text("label").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CustomRole = typeof customRolesTable.$inferSelect;
