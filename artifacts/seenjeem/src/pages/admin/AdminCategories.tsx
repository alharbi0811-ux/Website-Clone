import { useEffect, useState } from "react";
import { Link } from "wouter";
import { FolderOpen, Plus, Pencil, Trash2, Eye, ImageIcon } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface Category {
  id: number;
  name: string;
  nameAr: string;
  section: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  questionCount: number;
  createdAt: string;
}

export default function AdminCategories() {
  const adminFetch = useAdminFetch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadCategories = () => {
    setLoading(true);
    adminFetch("/admin/categories")
      .then(setCategories)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCategories(); }, [adminFetch]);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`هل أنت متأكد من حذف فئة "${name}"؟ سيتم حذف جميع أسئلتها.`)) return;
    setDeletingId(id);
    try {
      await adminFetch(`/admin/categories/${id}`, { method: "DELETE" });
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">الفئات</h2>
          <p className="text-gray-500 mt-1 text-sm">{categories.length} فئة مسجلة</p>
        </div>
        <Link href="/admin/categories/new">
          <a className="flex items-center gap-2 bg-[#7B2FBE] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#6a25a8] transition-all shadow-[0_4px_14px_rgba(123,47,190,0.3)]">
            <Plus size={16} />
            فئة جديدة
          </a>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-40 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <FolderOpen size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">لا توجد فئات بعد</p>
          <Link href="/admin/categories/new">
            <a className="mt-4 inline-block bg-[#7B2FBE] text-white text-sm font-semibold px-4 py-2 rounded-xl">
              أضف أول فئة
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_4px_20px_rgba(123,47,190,0.1)] hover:border-violet-200 transition-all group overflow-hidden"
            >
              {/* Image */}
              <div className="h-28 bg-gradient-to-br from-violet-50 to-purple-100 relative overflow-hidden">
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.nameAr} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={28} className="text-violet-300" />
                  </div>
                )}
                <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-semibold ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {cat.isActive ? "نشط" : "مخفي"}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-gray-900 text-base">{cat.nameAr}</h3>
                {cat.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                )}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-xs bg-violet-50 text-[#7B2FBE] font-semibold px-2 py-0.5 rounded-full">
                    {cat.questionCount} سؤال
                  </span>
                  {cat.section && (
                    <span className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-100">
                      {cat.section}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
                  <Link href={`/admin/categories/${cat.id}/questions`}>
                    <a className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-[#7B2FBE] bg-violet-50 hover:bg-violet-100 px-3 py-2 rounded-xl transition-colors">
                      <Eye size={13} />
                      الأسئلة
                    </a>
                  </Link>
                  <Link href={`/admin/categories/${cat.id}/edit`}>
                    <a className="flex items-center justify-center text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 w-8 h-8 rounded-xl transition-colors">
                      <Pencil size={13} />
                    </a>
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id, cat.nameAr)}
                    disabled={deletingId === cat.id}
                    className="flex items-center justify-center text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 w-8 h-8 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
