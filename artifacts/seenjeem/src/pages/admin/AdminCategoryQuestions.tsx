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

const difficultyLabel: Record<string, string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};
const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-50 text-emerald-600",
  medium: "bg-yellow-50 text-yellow-600",
  hard: "bg-red-50 text-red-600",
};

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
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate("/admin/categories")} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowRight size={18} />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-gray-900">أسئلة: {catName}</h2>
          <p className="text-gray-500 mt-0.5 text-sm">{questions.length} سؤال</p>
        </div>
        <Link href={`/admin/questions/new?categoryId=${categoryId}`}>
          <a className="flex items-center gap-2 bg-[#7B2FBE] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#6a25a8] transition-all shadow-[0_4px_14px_rgba(123,47,190,0.3)]">
            <Plus size={16} />
            سؤال جديد
          </a>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100" />)}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <HelpCircle size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد أسئلة في هذه الفئة</p>
          <Link href={`/admin/questions/new?categoryId=${categoryId}`}>
            <a className="mt-4 inline-block bg-[#7B2FBE] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              أضف أول سؤال
            </a>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">#</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3">السؤال</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 hidden sm:table-cell">الإجابة</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 hidden md:table-cell">الصعوبة</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 hidden md:table-cell">النقاط</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-5 py-3 hidden md:table-cell">الوقت</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {questions.map((q, idx) => (
                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-400 font-mono">{idx + 1}</td>
                  <td className="px-5 py-4 max-w-xs">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{q.questionText}</p>
                    {q.optionA && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {[q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean).map((opt, i) => (
                          <span key={i} className={`text-xs px-1.5 py-0.5 rounded ${["a","b","c","d"][i] === q.correctOption ? "bg-emerald-100 text-emerald-700 font-semibold" : "bg-gray-100 text-gray-500"}`}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-600 line-clamp-1">{q.answer}</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColor[q.difficulty] || "bg-gray-100 text-gray-500"}`}>
                      {difficultyLabel[q.difficulty] || q.difficulty}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-600">{q.points}</td>
                  <td className="px-5 py-4 hidden md:table-cell text-sm text-gray-600">{q.timeSeconds}ث</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/questions/${q.id}/edit`}>
                        <a className="p-1.5 text-gray-400 hover:text-[#7B2FBE] hover:bg-violet-50 rounded-lg transition-colors">
                          <Pencil size={14} />
                        </a>
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={deletingId === q.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
