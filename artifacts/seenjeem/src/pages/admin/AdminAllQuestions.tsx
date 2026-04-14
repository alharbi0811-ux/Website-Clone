import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
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

const difficultyLabel: Record<string, string> = { easy: "سهل", medium: "متوسط", hard: "صعب" };
const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-yellow-50 text-yellow-600",
  hard: "bg-red-50 text-red-600",
};

export default function AdminAllQuestions() {
  const adminFetch = useAdminFetch();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    Promise.all([adminFetch("/admin/questions"), adminFetch("/admin/categories")])
      .then(([qs, cats]) => { setQuestions(qs); setCategories(cats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [adminFetch]);

  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.nameAr]));
  const filtered = filter ? questions.filter((q) => q.categoryId === Number(filter)) : questions;

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
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900">الأسئلة</h2>
          <p className="text-gray-500 mt-1 text-sm">{filtered.length} سؤال</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#7B2FBE] transition-all"
          >
            <option value="">جميع الفئات</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.nameAr}</option>)}
          </select>
          <Link href="/admin/questions/new">
            <a className="flex items-center gap-2 bg-[#7B2FBE] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#6a25a8] transition-all shadow-[0_4px_14px_rgba(123,47,190,0.3)]">
              <Plus size={16} />
              سؤال جديد
            </a>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-gray-100" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <HelpCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد أسئلة</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">#</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">السؤال</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">الفئة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">الصعوبة</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">النقاط</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((q, idx) => (
                  <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400 font-mono">{idx + 1}</td>
                    <td className="px-5 py-3 max-w-xs">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{q.questionText}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{q.answer}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-violet-50 text-[#7B2FBE] font-semibold px-2 py-0.5 rounded-full">
                        {catMap[q.categoryId] || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColor[q.difficulty] || "bg-gray-100 text-gray-500"}`}>
                        {difficultyLabel[q.difficulty] || q.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-600">{q.points}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/questions/${q.id}/edit`}>
                          <a className="p-1.5 text-gray-400 hover:text-[#7B2FBE] hover:bg-violet-50 rounded-lg transition-colors">
                            <Pencil size={14} />
                          </a>
                        </Link>
                        <button onClick={() => handleDelete(q.id)} disabled={deletingId === q.id}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
