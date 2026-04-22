import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// المراحل الدراسية (ابتدائي، متوسط، ثانوي)
export const studyStagesTable = pgTable("study_stages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
});

// الصفوف الدراسية
export const studyGradesTable = pgTable("study_grades", {
  id: serial("id").primaryKey(),
  stageId: integer("stage_id")
    .notNull()
    .references(() => studyStagesTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
});

// المواد (مرتبطة بالصف)
export const studySubjectsTable = pgTable("study_subjects", {
  id: serial("id").primaryKey(),
  gradeId: integer("grade_id").references(() => studyGradesTable.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  createdAt: text("created_at").default(sql`NOW()`),
});

// الوحدات
export const studyUnitsTable = pgTable("study_units", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id")
    .notNull()
    .references(() => studySubjectsTable.id, { onDelete: "cascade" }),
  term: integer("term").notNull(),
  name: text("name").notNull(),
});

// الدروس
export const studyLessonsTable = pgTable("study_lessons", {
  id: serial("id").primaryKey(),
  unitId: integer("unit_id")
    .notNull()
    .references(() => studyUnitsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

// الأسئلة
export const studyQuestionsTable = pgTable("study_questions", {
  id: serial("id").primaryKey(),
  stageId: integer("stage_id").references(() => studyStagesTable.id, {
    onDelete: "set null",
  }),
  gradeId: integer("grade_id").references(() => studyGradesTable.id, {
    onDelete: "set null",
  }),
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
