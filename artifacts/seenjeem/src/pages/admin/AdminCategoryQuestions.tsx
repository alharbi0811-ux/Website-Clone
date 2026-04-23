import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Plus, Pencil, Trash2, ArrowRight, HelpCircle, BookOpen } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import AdminQuestionBank from "./AdminQuestionBank";

interface Question {
  id: number;
  questionText: string;
  answer: string;
  optionA: string | null;
  optionB: string | null;
  optionC: string | null;
  optionD: string | null;
  correctOption: string | null;
  difficulty: string;
  points: number;
  timeSeconds: number;
  isActive: boolean;
}

const diffStyle: Record<string, { color: string; bg: string; border: string }> = {
  easy:   { color: "#34d399", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)" },
  hard:   { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
};
const diffLabel: Record<string, string> = { easy: "سهل", medium: "متوسط", hard: "صعب" };

export default function AdminCategoryQuestions() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/admin/categories/:id/questions");
  const categoryId = params?.id;

  const adminFetch = useAdminFetch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [catName, setCatName] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showBank, setShowBank] = useState(false);

  function loadData() {
    if (!categoryId) return;
    setLoading(true);
    Promise.all([
      adminFetch(`/admin/questions?categoryId=${categoryId}`),
      adminFetch("/admin/categories"),
    ])
      .then(([qs, cats]) => {
        setQuestions(qs);
        const cat = (cats as any[]).find((c) => c.id === Number(categoryId));
        if (cat) setCatName(cat.nameAr);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadData(); }, [categoryId, adminFetch]);

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/admin/questions/${id}`, { method: "DELETE" });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert("فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate("/admin/categories")}
          className="p-2 rounded-lg transition-all"
          style={{ background: "#f9f8ff", border: "1px solid rgba(255,255,255,0.07)", color: "#9ca3af" }}
        >
          <ArrowRight size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono" style={{ color: "#7B2FBE" }}>~/admin/categories $</span>
            <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>questions --cat</span>
          </div>
          <h2 className="text-xl font-black" style={{ color: "#1a1a2e" }}>
            أسئلة: <span style={{ color: "#c084fc" }}>{catName}</span>
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#9ca3af" }}>{questions.length} سؤال</p>
        </div>

        {/* ── بنك الأسئلة ── */}
        <button
          onClick={() => setShowBank(true)}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
          style={{
            background: "rgba(123,47,190,0.12)",
            border: "1px solid rgba(123,47,190,0.35)",
            color: "#c084fc",
          }}
        >
          <BookOpen size={15} />
          بنك الأسئلة
        </button>

        <Link href={`/admin/questions/new?categoryId=${categoryId}`}>
          <a
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #6A00F4, #7B3FF2, #8E63E6, #A07CE0, #B89AE6)",
              boxShadow: "0 4px 14px rgba(106,0,244,0.3)",
              
            }}
          >
            <Plus size={15} />
            سؤال جديد
          </a>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: "#ffffff" }} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div
          className="rounded-xl p-14 text-center"
          style={{ background: "#ffffff", border: "1px solid rgba(123,63,242,0.1)" }}
        >
          <HelpCircle size={36} className="mx-auto mb-3" style={{ color: "#d1d5db" }} />
          <p className="text-sm font-mono mb-4" style={{ color: "#9ca3af" }}>لا توجد أسئلة في هذه الفئة بعد</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowBank(true)}
              className="text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: "rgba(123,47,190,0.15)", border: "1px solid rgba(123,47,190,0.35)", color: "#c084fc" }}
            >
              بنك الأسئلة
            </button>
            <Link href={`/admin/questions/new?categoryId=${categoryId}`}>
              <a
                className="inline-block text-white text-sm font-semibold px-4 py-2 rounded-lg"
                style={{ background: "rgba(123,47,190,0.3)", border: "1px solid rgba(123,47,190,0.4)" }}
              >
                أضف أول سؤال
              </a>
            </Link>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#ffffff", border: "1px solid rgba(123,63,242,0.1)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#f9f8ff" }}>
                {["#", "السؤال / الإجابة", "الصعوبة", "النقاط", "الوقت", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`text-right px-5 py-2.5 ${i >= 2 && i < 5 ? "hidden md:table-cell" : ""}`}
                  >
                    <span className="text-[10px] font-mono" style={{ color: "#d1d5db" }}>{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => {
                const ds = diffStyle[q.difficulty] || { color: "#8888aa", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" };
                return (
                  <tr
                    key={q.id}
                    style={{ borderBottom: idx < questions.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                  >
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono" style={{ color: "#d1d5db" }}>
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm font-medium line-clamp-2" style={{ color: "#1a1a2e" }}>{q.questionText}</p>
                      {q.optionA ? (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {[q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean).map((opt, i) => {
                            const letter = ["a", "b", "c", "d"][i];
                            const isCorrect = letter === q.correctOption;
                            return (
                              <span
                                key={i}
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                                style={
                                  isCorrect
                                    ? { background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }
                                    : { background: "#f9f8ff", color: "#9ca3af", border: "1px solid rgba(123,63,242,0.1)" }
                                }
                              >
                                {opt}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs font-mono mt-0.5 line-clamp-1" style={{ color: "#9ca3af" }}>▶ {q.answer}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded"
                        style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                      >
                        {diffLabel[q.difficulty] || q.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm font-mono font-bold" style={{ color: "#7B2FBE" }}>{q.points}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs font-mono" style={{ color: "#9ca3af" }}>{q.timeSeconds}ث</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/questions/${q.id}/edit`}>
                          <a
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: "#9ca3af", border: "1px solid transparent" }}
                          >
                            <Pencil size={13} />
                          </a>
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={deletingId === q.id}
                          className="p-1.5 rounded-lg transition-all disabled:opacity-40"
                          style={{ color: "#9ca3af", border: "1px solid transparent" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── مودال بنك الأسئلة ── */}
      {showBank && categoryId && (
        <AdminQuestionBank
          categoryId={Number(categoryId)}
          categoryName={catName}
          onClose={() => setShowBank(false)}
          onSuccess={() => { setShowBank(false); loadData(); }}
        />
      )}
    </div>
  );
}
