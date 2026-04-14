import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowRight } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface Category { id: number; nameAr: string; }

const difficulties = [
  { value: "easy", label: "سهل" },
  { value: "medium", label: "متوسط" },
  { value: "hard", label: "صعب" },
];

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
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctOption: "" as "" | "a" | "b" | "c" | "d",
    difficulty: "medium",
    points: "100",
    timeSeconds: "30",
    isActive: true,
  });

  useEffect(() => {
    adminFetch("/admin/categories")
      .then(setCategories)
      .catch(console.error);
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
              optionA: q.optionA || "",
              optionB: q.optionB || "",
              optionC: q.optionC || "",
              optionD: q.optionD || "",
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
        navigate(`/admin/categories/${form.categoryId}/questions`);
      } else {
        await adminFetch("/admin/questions", { method: "POST", body: JSON.stringify(payload) });
        navigate(`/admin/categories/${form.categoryId}/questions`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/10 transition-all";

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1 as any)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowRight size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900">{isEdit ? "تعديل السؤال" : "سؤال جديد"}</h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            {isEdit ? "عدّل بيانات السؤال" : "أضف سؤالاً جديداً لبنك الأسئلة"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الفئة *</label>
            <select value={form.categoryId} onChange={set("categoryId")} required className={inputCls}>
              <option value="">اختر الفئة...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameAr}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">نص السؤال *</label>
            <textarea
              value={form.questionText}
              onChange={set("questionText")}
              required
              placeholder="اكتب السؤال هنا..."
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الإجابة الصحيحة *</label>
            <input type="text" value={form.answer} onChange={set("answer")} required placeholder="الإجابة..." className={inputCls} />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              الخيارات (اختياري — لأسئلة الاختيار من متعدد)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["A", "B", "C", "D"] as const).map((letter) => {
                const key = `option${letter}` as keyof typeof form;
                const val = letter.toLowerCase() as "a" | "b" | "c" | "d";
                return (
                  <div key={letter} className="relative">
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full
                      ${form.correctOption === val ? "bg-[#7B2FBE] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {letter}
                    </span>
                    <input
                      type="text"
                      value={form[key] as string}
                      onChange={set(key)}
                      placeholder={`الخيار ${letter}`}
                      className="w-full border border-gray-200 rounded-xl pr-10 pl-3 py-2.5 text-sm focus:outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/10 transition-all"
                    />
                  </div>
                );
              })}
            </div>
            {(form.optionA || form.optionB || form.optionC || form.optionD) && (
              <div className="mt-3">
                <label className="block text-xs font-semibold text-gray-500 mb-2">الخيار الصحيح</label>
                <div className="flex gap-2">
                  {(["a", "b", "c", "d"] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setForm((p) => ({ ...p, correctOption: v }))}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all
                        ${form.correctOption === v ? "bg-[#7B2FBE] text-white shadow-[0_4px_10px_rgba(123,47,190,0.3)]" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                    >
                      {v.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الصعوبة</label>
              <select value={form.difficulty} onChange={set("difficulty")} className={inputCls}>
                {difficulties.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">النقاط</label>
              <input type="number" value={form.points} onChange={set("points")} min={1} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الوقت (ثانية)</label>
              <input type="number" value={form.timeSeconds} onChange={set("timeSeconds")} min={5} max={120} className={inputCls} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-[#7B2FBE]" : "bg-gray-200"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "right-0.5" : "left-0.5"}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">{form.isActive ? "السؤال نشط" : "السؤال مخفي"}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#7B2FBE] text-white font-bold py-3 rounded-xl hover:bg-[#6a25a8] transition-all shadow-[0_4px_14px_rgba(123,47,190,0.3)] disabled:opacity-60">
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إضافة السؤال"}
            </button>
            <button type="button" onClick={() => navigate(-1 as any)}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
