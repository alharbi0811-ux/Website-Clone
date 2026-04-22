import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  BookOpen, Layers, BookMarked, HelpCircle,
  Plus, Trash2, Edit2, X, Check, ChevronDown,
} from "lucide-react";

const API_BASE = "/api";

type Subject = { id: number; name: string; createdAt?: string };
type Unit = { id: number; name: string; subjectId: number; term: number };
type Lesson = { id: number; name: string; unitId: number };
type StudyQuestion = {
  id: number;
  subjectId: number;
  unitId: number;
  lessonId: number | null;
  questionText: string;
  questionImage?: string;
  answerText: string;
  answerImage?: string;
};

const TABS = [
  { key: "subjects", label: "المواد", icon: <BookOpen size={15} /> },
  { key: "units", label: "الوحدات", icon: <Layers size={15} /> },
  { key: "lessons", label: "الدروس", icon: <BookMarked size={15} /> },
  { key: "questions", label: "الأسئلة", icon: <HelpCircle size={15} /> },
] as const;
type Tab = (typeof TABS)[number]["key"];

const cell = "px-4 py-3 text-right text-sm";
const theadCell = "px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider";

function Modal({
  title, children, onClose,
}: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "#0f0f1e", border: "1px solid rgba(123,47,190,0.3)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(123,47,190,0.2)" }}
        >
          <h3 className="font-black text-white text-base">{title}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: "#8888aa" }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 rounded-xl text-sm text-white font-medium focus:outline-none transition-all";
const inputStyle = {
  background: "rgba(123,47,190,0.08)",
  border: "1px solid rgba(123,47,190,0.25)",
};
const inputFocusStyle = "focus:border-[#7B2FBE]";

function SelectField({
  label, value, onChange, options, placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} ${inputFocusStyle} appearance-none pr-8`}
          style={inputStyle}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </Field>
  );
}

export default function AdminStudyMode() {
  const [tab, setTab] = useState<Tab>("subjects");

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<StudyQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  // Form state
  const [form, setForm] = useState<Record<string, string>>({});

  const headers = (path: string) => ({
    "Content-Type": "application/json",
    ...(document.cookie.includes("session") ? {} : {}),
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, u, l, q] = await Promise.all([
        fetch(`${API_BASE}/admin/study/subjects`, { credentials: "include" }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/study/units`, { credentials: "include" }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/study/lessons`, { credentials: "include" }).then((r) => r.json()),
        fetch(`${API_BASE}/admin/study/questions`, { credentials: "include" }).then((r) => r.json()),
      ]);
      setSubjects(Array.isArray(s) ? s : []);
      setUnits(Array.isArray(u) ? u : []);
      setLessons(Array.isArray(l) ? l : []);
      setQuestions(Array.isArray(q) ? q : []);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setForm({}); setShowModal(true); };
  const openEdit = (row: any) => {
    setEditing(row);
    const f: Record<string, string> = {};
    Object.entries(row).forEach(([k, v]) => { if (v !== null && v !== undefined) f[k] = String(v); });
    setForm(f);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({}); };

  const handleDelete = async (id: number) => {
    if (!confirm("حذف هذا العنصر؟")) return;
    const endpointMap: Record<Tab, string> = {
      subjects: "subjects",
      units: "units",
      lessons: "lessons",
      questions: "questions",
    };
    await fetch(`${API_BASE}/admin/study/${endpointMap[tab]}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchAll();
  };

  const handleSave = async () => {
    const endpointMap: Record<Tab, string> = {
      subjects: "subjects",
      units: "units",
      lessons: "lessons",
      questions: "questions",
    };
    const endpoint = `${API_BASE}/admin/study/${endpointMap[tab]}`;
    const method = editing ? "PUT" : "POST";
    const url = editing ? `${endpoint}/${editing.id}` : endpoint;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    closeModal();
    fetchAll();
  };

  // ──────────────── Tab content helpers ────────────────

  const subjectName = (id: number) => subjects.find((s) => s.id === id)?.name ?? "-";
  const unitName = (id: number) => units.find((u) => u.id === id)?.name ?? "-";
  const lessonName = (id: number | null) => id ? lessons.find((l) => l.id === id)?.name ?? "-" : "-";

  const renderTable = () => {
    if (loading) return (
      <div className="flex justify-center py-16">
        <div className="w-7 h-7 rounded-full border-2 border-[#7B2FBE]/30 border-t-[#7B2FBE] animate-spin" />
      </div>
    );

    if (tab === "subjects") return (
      <table className="w-full">
        <thead style={{ background: "rgba(123,47,190,0.08)" }}>
          <tr>
            <th className={theadCell} style={{ color: "#555577" }}>ID</th>
            <th className={theadCell} style={{ color: "#555577" }}>اسم المادة</th>
            <th className={theadCell} style={{ color: "#555577" }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={s.id} style={{ borderTop: "1px solid rgba(123,47,190,0.1)", background: i % 2 === 0 ? "transparent" : "rgba(123,47,190,0.03)" }}>
              <td className={cell} style={{ color: "#555577" }}>#{s.id}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{s.name}</td>
              <td className={cell}>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#7B2FBE" }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(s.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-400"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
          {subjects.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-sm" style={{ color: "#555577" }}>لا توجد مواد</td></tr>}
        </tbody>
      </table>
    );

    if (tab === "units") return (
      <table className="w-full">
        <thead style={{ background: "rgba(123,47,190,0.08)" }}>
          <tr>
            <th className={theadCell} style={{ color: "#555577" }}>المادة</th>
            <th className={theadCell} style={{ color: "#555577" }}>الفصل</th>
            <th className={theadCell} style={{ color: "#555577" }}>اسم الوحدة</th>
            <th className={theadCell} style={{ color: "#555577" }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u, i) => (
            <tr key={u.id} style={{ borderTop: "1px solid rgba(123,47,190,0.1)", background: i % 2 === 0 ? "transparent" : "rgba(123,47,190,0.03)" }}>
              <td className={cell} style={{ color: "#c084fc" }}>{subjectName(u.subjectId)}</td>
              <td className={cell} style={{ color: "#8888aa" }}>ف{u.term}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{u.name}</td>
              <td className={cell}>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#7B2FBE" }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(u.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-400"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
          {units.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-sm" style={{ color: "#555577" }}>لا توجد وحدات</td></tr>}
        </tbody>
      </table>
    );

    if (tab === "lessons") return (
      <table className="w-full">
        <thead style={{ background: "rgba(123,47,190,0.08)" }}>
          <tr>
            <th className={theadCell} style={{ color: "#555577" }}>الوحدة</th>
            <th className={theadCell} style={{ color: "#555577" }}>اسم الدرس</th>
            <th className={theadCell} style={{ color: "#555577" }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {lessons.map((l, i) => (
            <tr key={l.id} style={{ borderTop: "1px solid rgba(123,47,190,0.1)", background: i % 2 === 0 ? "transparent" : "rgba(123,47,190,0.03)" }}>
              <td className={cell} style={{ color: "#c084fc" }}>{unitName(l.unitId)}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{l.name}</td>
              <td className={cell}>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(l)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#7B2FBE" }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(l.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-400"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
          {lessons.length === 0 && <tr><td colSpan={3} className="text-center py-10 text-sm" style={{ color: "#555577" }}>لا توجد دروس</td></tr>}
        </tbody>
      </table>
    );

    if (tab === "questions") return (
      <table className="w-full">
        <thead style={{ background: "rgba(123,47,190,0.08)" }}>
          <tr>
            <th className={theadCell} style={{ color: "#555577" }}>المادة</th>
            <th className={theadCell} style={{ color: "#555577" }}>الوحدة</th>
            <th className={theadCell} style={{ color: "#555577" }}>الدرس</th>
            <th className={theadCell} style={{ color: "#555577" }}>السؤال</th>
            <th className={theadCell} style={{ color: "#555577" }}>الإجابة</th>
            <th className={theadCell} style={{ color: "#555577" }}>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, i) => (
            <tr key={q.id} style={{ borderTop: "1px solid rgba(123,47,190,0.1)", background: i % 2 === 0 ? "transparent" : "rgba(123,47,190,0.03)" }}>
              <td className={cell} style={{ color: "#c084fc" }}>{subjectName(q.subjectId)}</td>
              <td className={cell} style={{ color: "#8888aa" }}>{unitName(q.unitId)}</td>
              <td className={cell} style={{ color: "#8888aa" }}>{lessonName(q.lessonId)}</td>
              <td className={`${cell} max-w-[180px]`} style={{ color: "#e2e2f0" }}>
                <span className="block truncate" title={q.questionText}>{q.questionText}</span>
              </td>
              <td className={`${cell} max-w-[180px]`} style={{ color: "#8888aa" }}>
                <span className="block truncate" title={q.answerText}>{q.answerText}</span>
              </td>
              <td className={cell}>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(q)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#7B2FBE" }}><Edit2 size={13} /></button>
                  <button onClick={() => handleDelete(q.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-400"><Trash2 size={13} /></button>
                </div>
              </td>
            </tr>
          ))}
          {questions.length === 0 && <tr><td colSpan={6} className="text-center py-10 text-sm" style={{ color: "#555577" }}>لا توجد أسئلة</td></tr>}
        </tbody>
      </table>
    );
  };

  // ──────────────── Modal forms ────────────────

  const renderForm = () => {
    const inp = (key: string, label: string, placeholder?: string, textarea?: boolean) => (
      <Field label={label}>
        {textarea ? (
          <textarea
            value={form[key] ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            rows={3}
            className={`${inputCls} ${inputFocusStyle} resize-none`}
            style={inputStyle}
          />
        ) : (
          <input
            value={form[key] ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder={placeholder}
            className={`${inputCls} ${inputFocusStyle}`}
            style={inputStyle}
          />
        )}
      </Field>
    );

    if (tab === "subjects") return <>{inp("name", "اسم المادة", "مثال: العلوم")}</>;

    if (tab === "units") return (
      <>
        <SelectField
          label="المادة"
          value={form.subjectId ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, subjectId: v }))}
          options={subjects.map((s) => ({ value: String(s.id), label: s.name }))}
          placeholder="اختر المادة"
        />
        <SelectField
          label="الفصل الدراسي"
          value={form.term ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, term: v }))}
          options={[{ value: "1", label: "الفصل الأول" }, { value: "2", label: "الفصل الثاني" }]}
          placeholder="اختر الفصل"
        />
        {inp("name", "اسم الوحدة", "مثال: الوحدة الأولى")}
      </>
    );

    if (tab === "lessons") return (
      <>
        <SelectField
          label="الوحدة"
          value={form.unitId ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, unitId: v }))}
          options={units.map((u) => ({ value: String(u.id), label: `${subjectName(u.subjectId)} - ${u.name}` }))}
          placeholder="اختر الوحدة"
        />
        {inp("name", "اسم الدرس", "مثال: الدرس الأول")}
      </>
    );

    if (tab === "questions") return (
      <>
        <SelectField
          label="المادة"
          value={form.subjectId ?? ""}
          onChange={(v) => {
            setForm((f) => ({ ...f, subjectId: v, unitId: "", lessonId: "" }));
          }}
          options={subjects.map((s) => ({ value: String(s.id), label: s.name }))}
          placeholder="اختر المادة"
        />
        <SelectField
          label="الوحدة"
          value={form.unitId ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, unitId: v, lessonId: "" }))}
          options={units
            .filter((u) => !form.subjectId || u.subjectId === Number(form.subjectId))
            .map((u) => ({ value: String(u.id), label: u.name }))}
          placeholder="اختر الوحدة"
        />
        <SelectField
          label="الدرس (اختياري)"
          value={form.lessonId ?? ""}
          onChange={(v) => setForm((f) => ({ ...f, lessonId: v }))}
          options={[
            { value: "", label: "— بدون درس —" },
            ...lessons
              .filter((l) => !form.unitId || l.unitId === Number(form.unitId))
              .map((l) => ({ value: String(l.id), label: l.name })),
          ]}
        />
        {inp("questionText", "نص السؤال", "اكتب السؤال هنا", true)}
        {inp("questionImage", "صورة السؤال (URL اختياري)", "https://...")}
        {inp("answerText", "نص الإجابة", "اكتب الإجابة هنا", true)}
        {inp("answerImage", "صورة الإجابة (URL اختياري)", "https://...")}
      </>
    );
  };

  const tabLabels: Record<Tab, string> = {
    subjects: "المادة",
    units: "الوحدة",
    lessons: "الدرس",
    questions: "السؤال",
  };

  return (
    <AdminLayout>
      <div dir="rtl">
        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen size={20} className="text-[#7B2FBE]" />
              وضع الدراسة
            </h1>
            <p className="text-xs mt-1" style={{ color: "#555577" }}>
              إدارة المواد والوحدات والدروس والأسئلة
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 0 16px rgba(123,47,190,0.3)" }}
          >
            <Plus size={15} />
            إضافة {tabLabels[tab]}
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-xl mb-5 w-fit"
          style={{ background: "rgba(123,47,190,0.1)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={
                tab === t.key
                  ? { background: "#7B2FBE", color: "white", boxShadow: "0 0 12px rgba(123,47,190,0.4)" }
                  : { color: "#8888aa" }
              }
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid rgba(123,47,190,0.2)", background: "#0f0f1e" }}
        >
          <div className="overflow-x-auto">{renderTable()}</div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          title={editing ? `تعديل ${tabLabels[tab]}` : `إضافة ${tabLabels[tab]}`}
          onClose={closeModal}
        >
          {renderForm()}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)" }}
            >
              <Check size={14} />
              {editing ? "حفظ التعديلات" : "إضافة"}
            </button>
            <button
              onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
              style={{ color: "#8888aa", border: "1px solid rgba(123,47,190,0.2)" }}
            >
              إلغاء
            </button>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
