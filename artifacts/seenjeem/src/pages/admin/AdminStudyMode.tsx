import { useState, useEffect } from "react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import {
  BookOpen, Layers, BookMarked, HelpCircle, GraduationCap,
  School, Plus, Trash2, Edit2, X, Check, ChevronDown,
} from "lucide-react";

type Stage    = { id: number; name: string; order: number };
type Grade    = { id: number; stageId: number; name: string; order: number };
type Subject  = { id: number; gradeId: number | null; name: string };
type Unit     = { id: number; subjectId: number; term: number; name: string };
type Lesson   = { id: number; unitId: number; name: string };
type Question = {
  id: number; subjectId: number; unitId: number; lessonId: number | null;
  questionText: string; questionImage?: string; answerText: string; answerImage?: string;
};

const TABS = [
  { key: "stages",    label: "المراحل",  icon: <School size={15} /> },
  { key: "grades",    label: "الصفوف",   icon: <GraduationCap size={15} /> },
  { key: "subjects",  label: "المواد",   icon: <BookOpen size={15} /> },
  { key: "units",     label: "الوحدات",  icon: <Layers size={15} /> },
  { key: "lessons",   label: "الدروس",   icon: <BookMarked size={15} /> },
  { key: "questions", label: "الأسئلة",  icon: <HelpCircle size={15} /> },
] as const;
type Tab = (typeof TABS)[number]["key"];

const cell = "px-4 py-3 text-right text-sm";
const th   = "px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider";

/* ── Reusable UI ── */
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        style={{ background: "#0f0f1e", border: "1px solid rgba(123,47,190,0.3)" }}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(123,47,190,0.2)" }}>
          <h3 className="font-black text-white text-base">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
      </div>
    </div>
  );
}

const iStyle = { background: "rgba(123,47,190,0.08)", border: "1px solid rgba(123,47,190,0.25)" };
const iCls   = "w-full px-3 py-2.5 rounded-xl text-sm text-white font-medium focus:outline-none focus:border-[#7B2FBE] transition-all";

function Inp({ label, k, form, setForm, placeholder, textarea }: {
  label: string; k: string; form: Record<string, string>; setForm: (f: any) => void;
  placeholder?: string; textarea?: boolean;
}) {
  const shared = { value: form[k] ?? "", onChange: (e: any) => setForm((f: any) => ({ ...f, [k]: e.target.value })), placeholder, className: `${iCls} ${textarea ? "resize-none" : ""}`, style: iStyle };
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: "#8888aa" }}>{label}</label>
      {textarea ? <textarea {...shared} rows={3} /> : <input {...shared} />}
    </div>
  );
}

function Sel({ label, k, form, setForm, opts, placeholder }: {
  label: string; k: string; form: Record<string, string>; setForm: (f: any) => void;
  opts: { value: string; label: string }[]; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold mb-1.5" style={{ color: "#8888aa" }}>{label}</label>
      <div className="relative">
        <select value={form[k] ?? ""} onChange={e => setForm((f: any) => ({ ...f, [k]: e.target.value }))}
          className={`${iCls} appearance-none pr-8`} style={iStyle}>
          {placeholder && <option value="">{placeholder}</option>}
          {opts.map(o => <option key={o.value} value={o.value} style={{ background: "#1a1a2e" }}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );
}

function EmptyRow({ cols, msg }: { cols: number; msg: string }) {
  return <tr><td colSpan={cols} className="text-center py-10 text-sm" style={{ color: "#555577" }}>{msg}</td></tr>;
}

function Actions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2">
      <button onClick={onEdit} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "#7B2FBE" }}><Edit2 size={13} /></button>
      <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 transition-colors text-red-400"><Trash2 size={13} /></button>
    </div>
  );
}

const rowStyle = (i: number) => ({ borderTop: "1px solid rgba(123,47,190,0.1)", background: i % 2 === 0 ? "transparent" : "rgba(123,47,190,0.03)" });
const thead = { background: "rgba(123,47,190,0.08)" };

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function AdminStudyMode() {
  const adminFetch = useAdminFetch();
  const [tab, setTab] = useState<Tab>("stages");
  const [stages,    setStages]    = useState<Stage[]>([]);
  const [grades,    setGrades]    = useState<Grade[]>([]);
  const [subjects,  setSubjects]  = useState<Subject[]>([]);
  const [units,     setUnits]     = useState<Unit[]>([]);
  const [lessons,   setLessons]   = useState<Lesson[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing,  setEditing]  = useState<any>(null);
  const [form,     setForm]     = useState<Record<string, string>>({});

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [st, gr, su, un, le, qu] = await Promise.all([
        adminFetch("/admin/study/stages"),
        adminFetch("/admin/study/grades"),
        adminFetch("/admin/study/subjects"),
        adminFetch("/admin/study/units"),
        adminFetch("/admin/study/lessons"),
        adminFetch("/admin/study/questions"),
      ]);
      setStages(   Array.isArray(st) ? st : []);
      setGrades(   Array.isArray(gr) ? gr : []);
      setSubjects( Array.isArray(su) ? su : []);
      setUnits(    Array.isArray(un) ? un : []);
      setLessons(  Array.isArray(le) ? le : []);
      setQuestions(Array.isArray(qu) ? qu : []);
    } catch (e: any) { setError(e.message || "خطأ في التحميل"); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditing(null); setForm({}); setShowModal(true); };
  const openEdit   = (row: any) => {
    setEditing(row);
    const f: Record<string, string> = {};
    Object.entries(row).forEach(([k, v]) => { if (v !== null && v !== undefined) f[k] = String(v); });
    setForm(f); setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm({}); };

  const epMap: Record<Tab, string> = { stages: "stages", grades: "grades", subjects: "subjects", units: "units", lessons: "lessons", questions: "questions" };

  const handleDelete = async (id: number) => {
    if (!confirm("حذف هذا العنصر؟ سيتم حذف كل البيانات المرتبطة به.")) return;
    try { await adminFetch(`/admin/study/${epMap[tab]}/${id}`, { method: "DELETE" }); fetchAll(); }
    catch (e: any) { alert(e.message || "خطأ في الحذف"); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ep  = `/admin/study/${epMap[tab]}`;
      const url = editing ? `${ep}/${editing.id}` : ep;
      await adminFetch(url, { method: editing ? "PUT" : "POST", body: JSON.stringify(form) });
      closeModal(); fetchAll();
    } catch (e: any) { alert(e.message || "خطأ في الحفظ"); }
    setSaving(false);
  };

  // Helpers
  const stageName   = (id: number)         => stages.find(s => s.id === id)?.name ?? "-";
  const gradeName   = (id: number)         => grades.find(g => g.id === id)?.name ?? "-";
  const subjectName = (id: number)         => subjects.find(s => s.id === id)?.name ?? "-";
  const unitName    = (id: number)         => units.find(u => u.id === id)?.name ?? "-";
  const lessonName  = (id: number | null)  => id ? lessons.find(l => l.id === id)?.name ?? "-" : "-";

  /* ── Table ── */
  const renderTable = () => {
    if (loading) return <div className="flex justify-center py-16"><div className="w-7 h-7 rounded-full border-2 border-[#7B2FBE]/30 border-t-[#7B2FBE] animate-spin" /></div>;
    if (error)   return <div className="text-center py-10 text-red-400 text-sm">{error} <button onClick={fetchAll} className="mr-2 text-[#7B2FBE] underline text-xs">إعادة المحاولة</button></div>;

    if (tab === "stages") return (
      <table className="w-full">
        <thead style={thead}><tr>
          <th className={th} style={{ color: "#555577" }}>الترتيب</th>
          <th className={th} style={{ color: "#555577" }}>المرحلة</th>
          <th className={th} style={{ color: "#555577" }}>الصفوف</th>
          <th className={th} style={{ color: "#555577" }}>الإجراءات</th>
        </tr></thead>
        <tbody>
          {stages.map((s, i) => (
            <tr key={s.id} style={rowStyle(i)}>
              <td className={cell} style={{ color: "#555577" }}>{s.order}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{s.name}</td>
              <td className={cell} style={{ color: "#8888aa" }}>{grades.filter(g => g.stageId === s.id).length} صف</td>
              <td className={cell}><Actions onEdit={() => openEdit(s)} onDelete={() => handleDelete(s.id)} /></td>
            </tr>
          ))}
          {stages.length === 0 && <EmptyRow cols={4} msg="لا توجد مراحل — أضف مرحلة دراسية أولاً" />}
        </tbody>
      </table>
    );

    if (tab === "grades") return (
      <table className="w-full">
        <thead style={thead}><tr>
          <th className={th} style={{ color: "#555577" }}>المرحلة</th>
          <th className={th} style={{ color: "#555577" }}>الصف</th>
          <th className={th} style={{ color: "#555577" }}>الترتيب</th>
          <th className={th} style={{ color: "#555577" }}>الإجراءات</th>
        </tr></thead>
        <tbody>
          {grades.map((g, i) => (
            <tr key={g.id} style={rowStyle(i)}>
              <td className={cell} style={{ color: "#c084fc" }}>{stageName(g.stageId)}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{g.name}</td>
              <td className={cell} style={{ color: "#555577" }}>{g.order}</td>
              <td className={cell}><Actions onEdit={() => openEdit(g)} onDelete={() => handleDelete(g.id)} /></td>
            </tr>
          ))}
          {grades.length === 0 && <EmptyRow cols={4} msg="لا توجد صفوف — أضف مرحلة أولاً" />}
        </tbody>
      </table>
    );

    if (tab === "subjects") return (
      <table className="w-full">
        <thead style={thead}><tr>
          <th className={th} style={{ color: "#555577" }}>الصف</th>
          <th className={th} style={{ color: "#555577" }}>المادة</th>
          <th className={th} style={{ color: "#555577" }}>الإجراءات</th>
        </tr></thead>
        <tbody>
          {subjects.map((s, i) => (
            <tr key={s.id} style={rowStyle(i)}>
              <td className={cell} style={{ color: "#c084fc" }}>{s.gradeId ? gradeName(s.gradeId) : "—"}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{s.name}</td>
              <td className={cell}><Actions onEdit={() => openEdit(s)} onDelete={() => handleDelete(s.id)} /></td>
            </tr>
          ))}
          {subjects.length === 0 && <EmptyRow cols={3} msg="لا توجد مواد — أضف صفوفاً أولاً" />}
        </tbody>
      </table>
    );

    if (tab === "units") return (
      <table className="w-full">
        <thead style={thead}><tr>
          <th className={th} style={{ color: "#555577" }}>المادة</th>
          <th className={th} style={{ color: "#555577" }}>الفصل</th>
          <th className={th} style={{ color: "#555577" }}>الوحدة</th>
          <th className={th} style={{ color: "#555577" }}>الإجراءات</th>
        </tr></thead>
        <tbody>
          {units.map((u, i) => (
            <tr key={u.id} style={rowStyle(i)}>
              <td className={cell} style={{ color: "#c084fc" }}>{subjectName(u.subjectId)}</td>
              <td className={cell} style={{ color: "#8888aa" }}>ف{u.term}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{u.name}</td>
              <td className={cell}><Actions onEdit={() => openEdit(u)} onDelete={() => handleDelete(u.id)} /></td>
            </tr>
          ))}
          {units.length === 0 && <EmptyRow cols={4} msg="لا توجد وحدات — أضف مادة ووحدة" />}
        </tbody>
      </table>
    );

    if (tab === "lessons") return (
      <table className="w-full">
        <thead style={thead}><tr>
          <th className={th} style={{ color: "#555577" }}>الوحدة</th>
          <th className={th} style={{ color: "#555577" }}>الدرس</th>
          <th className={th} style={{ color: "#555577" }}>الإجراءات</th>
        </tr></thead>
        <tbody>
          {lessons.map((l, i) => (
            <tr key={l.id} style={rowStyle(i)}>
              <td className={cell} style={{ color: "#c084fc" }}>{unitName(l.unitId)}</td>
              <td className={cell} style={{ color: "#e2e2f0" }}>{l.name}</td>
              <td className={cell}><Actions onEdit={() => openEdit(l)} onDelete={() => handleDelete(l.id)} /></td>
            </tr>
          ))}
          {lessons.length === 0 && <EmptyRow cols={3} msg="لا توجد دروس — أضف وحدة أولاً" />}
        </tbody>
      </table>
    );

    if (tab === "questions") return (
      <table className="w-full">
        <thead style={thead}><tr>
          <th className={th} style={{ color: "#555577" }}>المادة</th>
          <th className={th} style={{ color: "#555577" }}>الوحدة</th>
          <th className={th} style={{ color: "#555577" }}>الدرس</th>
          <th className={th} style={{ color: "#555577" }}>السؤال</th>
          <th className={th} style={{ color: "#555577" }}>الإجابة</th>
          <th className={th} style={{ color: "#555577" }}>الإجراءات</th>
        </tr></thead>
        <tbody>
          {questions.map((q, i) => (
            <tr key={q.id} style={rowStyle(i)}>
              <td className={cell} style={{ color: "#c084fc" }}>{subjectName(q.subjectId)}</td>
              <td className={cell} style={{ color: "#8888aa" }}>{unitName(q.unitId)}</td>
              <td className={cell} style={{ color: "#8888aa" }}>{lessonName(q.lessonId)}</td>
              <td className={`${cell} max-w-[160px]`} style={{ color: "#e2e2f0" }}><span className="block truncate" title={q.questionText}>{q.questionText}</span></td>
              <td className={`${cell} max-w-[160px]`} style={{ color: "#8888aa" }}><span className="block truncate" title={q.answerText}>{q.answerText}</span></td>
              <td className={cell}><Actions onEdit={() => openEdit(q)} onDelete={() => handleDelete(q.id)} /></td>
            </tr>
          ))}
          {questions.length === 0 && <EmptyRow cols={6} msg="لا توجد أسئلة — أضف مواد ووحدات ودروساً أولاً" />}
        </tbody>
      </table>
    );
  };

  /* ── Form ── */
  const renderForm = () => {
    if (tab === "stages") return (
      <>
        <Inp label="اسم المرحلة" k="name" form={form} setForm={setForm} placeholder="مثال: المرحلة الابتدائية" />
        <Inp label="الترتيب" k="order" form={form} setForm={setForm} placeholder="0" />
      </>
    );
    if (tab === "grades") return (
      <>
        <Sel label="المرحلة" k="stageId" form={form} setForm={setForm} placeholder="اختر المرحلة"
          opts={stages.map(s => ({ value: String(s.id), label: s.name }))} />
        <Inp label="اسم الصف" k="name" form={form} setForm={setForm} placeholder="مثال: الصف الأول" />
        <Inp label="الترتيب" k="order" form={form} setForm={setForm} placeholder="1" />
      </>
    );
    if (tab === "subjects") return (
      <>
        <Sel label="الصف (اختياري)" k="gradeId" form={form} setForm={setForm} placeholder="— بدون صف —"
          opts={grades.map(g => ({ value: String(g.id), label: `${stageName(g.stageId)} - ${g.name}` }))} />
        <Inp label="اسم المادة" k="name" form={form} setForm={setForm} placeholder="مثال: العلوم" />
      </>
    );
    if (tab === "units") return (
      <>
        <Sel label="المادة" k="subjectId" form={form} setForm={setForm} placeholder="اختر المادة"
          opts={subjects.map(s => ({ value: String(s.id), label: `${s.gradeId ? gradeName(s.gradeId) : "—"} - ${s.name}` }))} />
        <Sel label="الفصل" k="term" form={form} setForm={setForm} placeholder="اختر الفصل"
          opts={[{ value: "1", label: "الفصل الأول" }, { value: "2", label: "الفصل الثاني" }]} />
        <Inp label="اسم الوحدة" k="name" form={form} setForm={setForm} placeholder="مثال: الوحدة الأولى" />
      </>
    );
    if (tab === "lessons") return (
      <>
        <Sel label="الوحدة" k="unitId" form={form} setForm={setForm} placeholder="اختر الوحدة"
          opts={units.map(u => ({ value: String(u.id), label: `${subjectName(u.subjectId)} - ${u.name}` }))} />
        <Inp label="اسم الدرس" k="name" form={form} setForm={setForm} placeholder="مثال: الدرس الأول" />
      </>
    );
    if (tab === "questions") return (
      <>
        <Sel label="المادة" k="subjectId" form={form} setForm={(f: any) => setForm({ ...f, unitId: "", lessonId: "" })} placeholder="اختر المادة"
          opts={subjects.map(s => ({ value: String(s.id), label: s.name }))} />
        <Sel label="الوحدة" k="unitId" form={form} setForm={(f: any) => setForm({ ...f, lessonId: "" })} placeholder="اختر الوحدة"
          opts={units.filter(u => !form.subjectId || u.subjectId === Number(form.subjectId)).map(u => ({ value: String(u.id), label: u.name }))} />
        <Sel label="الدرس (اختياري)" k="lessonId" form={form} setForm={setForm}
          opts={[{ value: "", label: "— بدون درس —" }, ...lessons.filter(l => !form.unitId || l.unitId === Number(form.unitId)).map(l => ({ value: String(l.id), label: l.name }))]} />
        <Inp label="نص السؤال" k="questionText" form={form} setForm={setForm} placeholder="اكتب السؤال هنا" textarea />
        <Inp label="صورة السؤال (URL اختياري)" k="questionImage" form={form} setForm={setForm} placeholder="https://..." />
        <Inp label="نص الإجابة" k="answerText" form={form} setForm={setForm} placeholder="اكتب الإجابة هنا" textarea />
        <Inp label="صورة الإجابة (URL اختياري)" k="answerImage" form={form} setForm={setForm} placeholder="https://..." />
      </>
    );
  };

  const tabLabel: Record<Tab, string> = { stages: "المرحلة", grades: "الصف", subjects: "المادة", units: "الوحدة", lessons: "الدرس", questions: "السؤال" };

  return (
    <div dir="rtl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <BookOpen size={20} className="text-[#7B2FBE]" />
            وضع الدراسة
          </h1>
          <p className="text-xs mt-1" style={{ color: "#555577" }}>
            ترتيب الإضافة: المراحل ← الصفوف ← المواد ← الوحدات ← الدروس ← الأسئلة
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 0 16px rgba(123,47,190,0.3)" }}>
          <Plus size={15} /> إضافة {tabLabel[tab]}
        </button>
      </div>

      {/* Tabs — scrollable on small screens */}
      <div className="overflow-x-auto pb-2 mb-5">
        <div className="flex gap-1 p-1 rounded-xl w-fit min-w-full" style={{ background: "rgba(123,47,190,0.1)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
              style={tab === t.key ? { background: "#7B2FBE", color: "white", boxShadow: "0 0 12px rgba(123,47,190,0.4)" } : { color: "#8888aa" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(123,47,190,0.2)", background: "#0f0f1e" }}>
        <div className="overflow-x-auto">{renderTable()}</div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal title={editing ? `تعديل ${tabLabel[tab]}` : `إضافة ${tabLabel[tab]}`} onClose={closeModal}>
          {renderForm()}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)" }}>
              {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" /> : <Check size={14} />}
              {editing ? "حفظ التعديلات" : "إضافة"}
            </button>
            <button onClick={closeModal}
              className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/10"
              style={{ color: "#8888aa", border: "1px solid rgba(123,47,190,0.2)" }}>
              إلغاء
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
