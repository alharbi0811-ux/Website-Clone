import { useEffect, useState } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { Plus, Pencil, Trash2, ArrowRight, HelpCircle } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

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

  useEffect(() => {
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
  }, [categoryId, adminFetch]);

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
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#555577" }}
        >
          <ArrowRight size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono" style={{ color: "#7B2FBE" }}>~/admin/categories $</span>
            <span className="text-xs font-mono" style={{ color: "#444466" }}>questions --cat</span>
          </div>
          <h2 className="text-xl font-black text-white">
            أسئلة: <span style={{ color: "#c084fc" }}>{catName}</span>
          </h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555577" }}>{questions.length} سؤال</p>
        </div>
        <Link href={`/admin/questions/new?categoryId=${categoryId}`}>
          <a
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)",
              boxShadow: "0 0 14px rgba(123,47,190,0.4)",
              border: "1px solid rgba(123,47,190,0.5)",
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
            <div key={i} className="h-16 rounded-lg animate-pulse" style={{ background: "#12121f" }} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div
          className="rounded-xl p-14 text-center"
          style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <HelpCircle size={36} className="mx-auto mb-3" style={{ color: "#333355" }} />
          <p className="text-sm font-mono mb-4" style={{ color: "#555577" }}>لا توجد أسئلة في هذه الفئة بعد</p>
          <Link href={`/admin/questions/new?categoryId=${categoryId}`}>
            <a
              className="inline-block text-white text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: "rgba(123,47,190,0.3)", border: "1px solid rgba(123,47,190,0.4)" }}
            >
              أضف أول سؤال
            </a>
          </Link>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)" }}>
                {["#", "السؤال / الإجابة", "الصعوبة", "النقاط", "الوقت", ""].map((h, i) => (
                  <th
                    key={i}
                    className={`text-right px-5 py-2.5 ${i >= 2 && i < 5 ? "hidden md:table-cell" : ""}`}
                  >
                    <span className="text-[10px] font-mono" style={{ color: "#333355" }}>{h}</span>
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
                      <span className="text-xs font-mono" style={{ color: "#333355" }}>
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <p className="text-sm font-medium text-white line-clamp-2">{q.questionText}</p>
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
                                    : { background: "rgba(255,255,255,0.04)", color: "#444466", border: "1px solid rgba(255,255,255,0.06)" }
                                }
                              >
                                {opt}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs font-mono mt-0.5 line-clamp-1" style={{ color: "#555577" }}>▶ {q.answer}</p>
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
                      <span className="text-xs font-mono" style={{ color: "#555577" }}>{q.timeSeconds}ث</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/questions/${q.id}/edit`}>
                          <a
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: "#444466", border: "1px solid transparent" }}
                          >
                            <Pencil size={13} />
                          </a>
                        </Link>
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={deletingId === q.id}
                          className="p-1.5 rounded-lg transition-all disabled:opacity-40"
                          style={{ color: "#444466", border: "1px solid transparent" }}
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
    </div>
  );
}
