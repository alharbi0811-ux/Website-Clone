import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface Category { id: number; nameAr: string; }

const difficulties = [
  { value: "easy", label: "سهل", color: "#34d399", bg: "rgba(16,185,129,0.15)", border: "rgba(16,185,129,0.35)" },
  { value: "medium", label: "متوسط", color: "#fbbf24", bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.35)" },
  { value: "hard", label: "صعب", color: "#f87171", bg: "rgba(248,113,113,0.15)", border: "rgba(248,113,113,0.35)" },
];

const inputStyle: React.CSSProperties = {
  background: "#0b0b14",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e2f0",
  borderRadius: "8px",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#555577",
  marginBottom: "6px",
  letterSpacing: "0.04em",
};

function useFocusStyle(
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
) {
  return { onFocus, onBlur };
}

export default function AdminQuestionForm() {
  const [location, navigate] = useLocation();
  const [matchEdit, paramsEdit] = useRoute("/admin/questions/:id/edit");
  const isEdit = matchEdit;
  const editId = paramsEdit?.id;

  const urlParams = new URLSearchParams(location.split("?")[1] || "");
  const preselectedCategory = urlParams.get("categoryId");

  const adminFetch = useAdminFetch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    categoryId: preselectedCategory || "",
    questionText: "",
    answer: "",
    optionA: "", optionB: "", optionC: "", optionD: "",
    correctOption: "" as "" | "a" | "b" | "c" | "d",
    difficulty: "medium",
    points: "100",
    timeSeconds: "30",
    isActive: true,
  });

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(123,47,190,0.6)"),
    onBlur:  (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(255,255,255,0.08)"),
  };

  useEffect(() => {
    adminFetch("/admin/categories").then(setCategories).catch(console.error);
  }, [adminFetch]);

  useEffect(() => {
    if (isEdit && editId) {
      adminFetch("/admin/questions")
        .then((qs: any[]) => {
          const q = qs.find((x) => x.id === Number(editId));
          if (q) {
            setForm({
              categoryId: String(q.categoryId),
              questionText: q.questionText,
              answer: q.answer,
              optionA: q.optionA || "", optionB: q.optionB || "",
              optionC: q.optionC || "", optionD: q.optionD || "",
              correctOption: q.correctOption || "",
              difficulty: q.difficulty,
              points: String(q.points),
              timeSeconds: String(q.timeSeconds),
              isActive: q.isActive,
            });
          }
        })
        .catch(console.error);
    }
  }, [isEdit, editId, adminFetch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.categoryId) return setError("يرجى اختيار الفئة");
    if (!form.questionText.trim()) return setError("يرجى إدخال نص السؤال");
    if (!form.answer.trim()) return setError("يرجى إدخال الإجابة");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        categoryId: Number(form.categoryId),
        questionText: form.questionText,
        answer: form.answer,
        difficulty: form.difficulty,
        points: Number(form.points),
        timeSeconds: Number(form.timeSeconds),
        isActive: form.isActive,
      };
      if (form.optionA) payload.optionA = form.optionA;
      if (form.optionB) payload.optionB = form.optionB;
      if (form.optionC) payload.optionC = form.optionC;
      if (form.optionD) payload.optionD = form.optionD;
      if (form.correctOption) payload.correctOption = form.correctOption;

      if (isEdit && editId) {
        await adminFetch(`/admin/questions/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/admin/questions", { method: "POST", body: JSON.stringify(payload) });
      }
      navigate(`/admin/categories/${form.categoryId}/questions`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const hasOptions = form.optionA || form.optionB || form.optionC || form.optionD;

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate(-1 as any)}
          className="p-2 rounded-lg transition-all"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#555577" }}
        >
          <ArrowRight size={16} />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono" style={{ color: "#3b82f6" }}>~/admin/questions $</span>
            <span className="text-xs font-mono" style={{ color: "#444466" }}>{isEdit ? "edit" : "new"}</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {isEdit ? "تعديل السؤال" : "سؤال جديد"}
          </h2>
        </div>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 space-y-5"
          style={{ background: "#12121f", border: "1px solid rgba(59,130,246,0.15)" }}
        >
          {/* Category */}
          <div>
            <label style={labelStyle}>الفئة *</label>
            <select value={form.categoryId} onChange={set("categoryId")} required style={{ ...inputStyle, cursor: "pointer" }} {...focusHandlers}>
              <option value="" style={{ background: "#0b0b14" }}>اختر الفئة...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} style={{ background: "#0b0b14" }}>{c.nameAr}</option>
              ))}
            </select>
          </div>

          {/* Question text */}
          <div>
            <label style={labelStyle}>نص السؤال *</label>
            <textarea
              value={form.questionText}
              onChange={set("questionText")}
              required
              placeholder="اكتب السؤال هنا..."
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              {...focusHandlers}
            />
          </div>

          {/* Answer */}
          <div>
            <label style={labelStyle}>الإجابة الصحيحة *</label>
            <input type="text" value={form.answer} onChange={set("answer")} required placeholder="الإجابة..." style={inputStyle} {...focusHandlers} />
          </div>

          {/* Options */}
          <div>
            <label style={{ ...labelStyle, marginBottom: "10px" }}>
              الخيارات <span style={{ color: "#2a2a3a" }}>(اختياري — لأسئلة الاختيار من متعدد)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B", "C", "D"] as const).map((letter) => {
                const key = `option${letter}` as keyof typeof form;
                const val = letter.toLowerCase() as "a" | "b" | "c" | "d";
                const isCorrect = form.correctOption === val;
                return (
                  <div key={letter} className="relative">
                    <span
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-[10px] font-mono font-bold"
                      style={
                        isCorrect
                          ? { background: "#7B2FBE", color: "white" }
                          : { background: "rgba(255,255,255,0.06)", color: "#444466" }
                      }
                    >
                      {letter}
                    </span>
                    <input
                      type="text"
                      value={form[key] as string}
                      onChange={set(key)}
                      placeholder={`الخيار ${letter}`}
                      style={{ ...inputStyle, paddingRight: "36px" }}
                      {...focusHandlers}
                    />
                  </div>
                );
              })}
            </div>
            {hasOptions && (
              <div className="mt-3">
                <label style={{ ...labelStyle, marginBottom: "8px" }}>الخيار الصحيح</label>
                <div className="flex gap-2">
                  {(["a", "b", "c", "d"] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setForm((p) => ({ ...p, correctOption: v }))}
                      className="w-10 h-10 rounded-lg text-sm font-mono font-bold transition-all"
                      style={
                        form.correctOption === v
                          ? { background: "#7B2FBE", color: "white", boxShadow: "0 0 12px rgba(123,47,190,0.4)" }
                          : { background: "rgba(255,255,255,0.04)", color: "#555577", border: "1px solid rgba(255,255,255,0.07)" }
                      }
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Difficulty / Points / Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label style={labelStyle}>الصعوبة</label>
              <div className="flex flex-col gap-1.5">
                {difficulties.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, difficulty: d.value }))}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-right transition-all"
                    style={
                      form.difficulty === d.value
                        ? { background: d.bg, color: d.color, border: `1px solid ${d.border}` }
                        : { background: "rgba(255,255,255,0.03)", color: "#444466", border: "1px solid rgba(255,255,255,0.05)" }
                    }
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>النقاط</label>
              <input type="number" value={form.points} onChange={set("points")} min={1} style={inputStyle} {...focusHandlers} />
            </div>
            <div>
              <label style={labelStyle}>الوقت (ثانية)</label>
              <input type="number" value={form.timeSeconds} onChange={set("timeSeconds")} min={5} max={120} style={inputStyle} {...focusHandlers} />
            </div>
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
              style={{
                background: form.isActive ? "#7B2FBE" : "rgba(255,255,255,0.08)",
                boxShadow: form.isActive ? "0 0 10px rgba(123,47,190,0.4)" : "none",
              }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{ [form.isActive ? "right" : "left"]: "2px" }}
              />
            </button>
            <div className="flex items-center gap-1.5">
              {form.isActive ? <Eye size={12} style={{ color: "#34d399" }} /> : <EyeOff size={12} style={{ color: "#555577" }} />}
              <span className="text-xs font-mono" style={{ color: form.isActive ? "#34d399" : "#555577" }}>
                {form.isActive ? "السؤال نشط" : "السؤال مخفي"}
              </span>
            </div>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm font-mono"
              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}
            >
              ✗ {error}
            </div>
          )}

          {/* Actions */}
          <div
            className="flex gap-3 pt-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                boxShadow: "0 0 16px rgba(59,130,246,0.35)",
              }}
            >
              {saving ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Check size={15} />}
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة السؤال"}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1 as any)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#8888aa" }}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
