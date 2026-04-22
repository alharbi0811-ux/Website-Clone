import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const studySubjectsTable = pgTable("study_subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").default(sql`NOW()`),
});

export const studyUnitsTable = pgTable("study_units", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => studySubjectsTable.id, { onDelete: "cascade" }),
  term: integer("term").notNull(),
  name: text("name").notNull(),
});

export const studyLessonsTable = pgTable("study_lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => studyUnitsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

export const studyQuestionsTable = pgTable("study_questions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => studySubjectsTable.id, { onDelete: "cascade" }),
  unitId: integer("unit_id")
    .notNull()
    .references(() => studyUnitsTable.id, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").references(() => studyLessonsTable.id, {
    onDelete: "set null",
  }),
  questionText: text("question_text").notNull(),
  questionImage: text("question_image"),
  answerText: text("answer_text").notNull(),
  answerImage: text("answer_image"),
  createdAt: text("created_at").default(sql`NOW()`),
});
