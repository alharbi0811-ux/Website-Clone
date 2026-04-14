import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, HelpCircle, Search } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface Question {
  id: number;
  categoryId: number;
  questionText: string;
  answer: string;
  difficulty: string;
  points: number;
  timeSeconds: number;
  isActive: boolean;
}

interface Category { id: number; nameAr: string; }

const diffLabel: Record<string, string> = { easy: "سهل", medium: "متوسط", hard: "صعب" };
const diffStyle: Record<string, { color: string; bg: string; border: string }> = {
  easy:   { color: "#34d399", bg: "rgba(16,185,129,0.12)",  border: "rgba(16,185,129,0.25)" },
  medium: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)",  border: "rgba(251,191,36,0.25)" },
  hard:   { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.25)" },
};

export default function AdminAllQuestions() {
  const adminFetch = useAdminFetch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([adminFetch("/admin/questions"), adminFetch("/admin/categories")])
      .then(([qs, cats]) => { setQuestions(qs); setCategories(cats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.nameAr]));
  const filtered = questions
    .filter((q) => !catFilter || q.categoryId === Number(catFilter))
    .filter((q) => !search || q.questionText.includes(search) || q.answer.includes(search));

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذا السؤال؟")) return;
    setDeletingId(id);
    try {
      await adminFetch(`/admin/questions/${id}`, { method: "DELETE" });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch { alert("فشل الحذف"); }
    finally { setDeletingId(null); }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono" style={{ color: "#3b82f6" }}>~/admin/questions $</span>
            <span className="text-xs font-mono text-gray-600">list --all</span>
          </div>
          <h2 className="text-2xl font-black text-white">الأسئلة</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555577" }}>{filtered.length} سؤال مسجل</p>
        </div>
        <Link href="/admin/questions/new">
          <a
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              boxShadow: "0 0 16px rgba(59,130,246,0.4)",
              border: "1px solid rgba(59,130,246,0.5)",
            }}
          >
            <Plus size={15} />
            سؤال جديد
          </a>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[180px]"
          style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Search size={13} style={{ color: "#555577" }} />
          <input
            type="text"
            placeholder="ابحث في الأسئلة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none font-mono"
            style={{ color: "#e2e2f0" }}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm font-mono outline-none transition-all"
          style={{
            background: "#12121f",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "#8888aa",
          }}
        >
          <option value="">جميع الفئات</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg animate-pulse" style={{ background: "#12121f" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-14 text-center"
          style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          <HelpCircle size={36} className="mx-auto mb-3" style={{ color: "#333355" }} />
          <p className="text-sm font-mono" style={{ color: "#555577" }}>لا توجد أسئلة</p>
        </div>
      ) : (
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                  <th className="text-right px-5 py-3">
                    <span className="text-[10px] font-mono" style={{ color: "#444466" }}>#ID</span>
                  </th>
                  <th className="text-right px-5 py-3">
                    <span className="text-[10px] font-mono" style={{ color: "#444466" }}>السؤال / الإجابة</span>
                  </th>
                  <th className="text-right px-5 py-3">
                    <span className="text-[10px] font-mono" style={{ color: "#444466" }}>الفئة</span>
                  </th>
                  <th className="text-right px-5 py-3">
                    <span className="text-[10px] font-mono" style={{ color: "#444466" }}>الصعوبة</span>
                  </th>
                  <th className="text-right px-5 py-3">
                    <span className="text-[10px] font-mono" style={{ color: "#444466" }}>النقاط</span>
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((q, idx) => {
                  const ds = diffStyle[q.difficulty] || { color: "#8888aa", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.08)" };
                  return (
                    <tr
                      key={q.id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-mono" style={{ color: "#333355" }}>
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-xs">
                        <p className="text-sm font-medium text-white line-clamp-1">{q.questionText}</p>
                        <p className="text-xs font-mono mt-0.5 line-clamp-1" style={{ color: "#555577" }}>
                          ▶ {q.answer}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(123,47,190,0.12)",
                            color: "#a78bfa",
                            border: "1px solid rgba(123,47,190,0.2)",
                          }}
                        >
                          {catMap[q.categoryId] || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded"
                          style={{ background: ds.bg, color: ds.color, border: `1px solid ${ds.border}` }}
                        >
                          {diffLabel[q.difficulty] || q.difficulty}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-mono font-bold" style={{ color: "#7B2FBE" }}>{q.points}</span>
                      </td>
                      <td className="px-5 py-3.5">
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
        </div>
      )}
    </div>
  );
}
