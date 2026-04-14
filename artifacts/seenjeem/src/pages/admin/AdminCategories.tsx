import { useEffect, useState } from "react";
import { Link } from "wouter";
import { FolderOpen, Plus, Pencil, Trash2, Eye, ImageIcon, Layers } from "lucide-react";
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
  const [sectionFilter, setSectionFilter] = useState("");

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
    } catch {
      alert("فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  }

  const sections = [...new Set(categories.map((c) => c.section).filter(Boolean))];
  const filtered = sectionFilter ? categories.filter((c) => c.section === sectionFilter) : categories;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono" style={{ color: "#7B2FBE" }}>~/admin/categories $</span>
            <span className="text-xs font-mono text-gray-600">list --all</span>
          </div>
          <h2 className="text-2xl font-black text-white">الفئات</h2>
          <p className="text-xs font-mono mt-0.5" style={{ color: "#555577" }}>
            {filtered.length} فئة مسجلة
          </p>
        </div>
        <Link href="/admin/categories/new">
          <a
            className="flex items-center gap-2 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all"
            style={{
              background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)",
              boxShadow: "0 0 16px rgba(123,47,190,0.4)",
              border: "1px solid rgba(123,47,190,0.5)",
            }}
          >
            <Plus size={15} />
            فئة جديدة
          </a>
        </Link>
      </div>

      {/* Section filter */}
      {sections.length > 0 && (
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <Layers size={12} style={{ color: "#555577" }} />
          <button
            onClick={() => setSectionFilter("")}
            className="px-3 py-1 rounded-md text-xs font-mono transition-all"
            style={
              !sectionFilter
                ? { background: "rgba(123,47,190,0.25)", color: "#c084fc", border: "1px solid rgba(123,47,190,0.4)" }
                : { color: "#555577", border: "1px solid rgba(255,255,255,0.06)" }
            }
          >
            الكل
          </button>
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSectionFilter(s!)}
              className="px-3 py-1 rounded-md text-xs font-mono transition-all"
              style={
                sectionFilter === s
                  ? { background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }
                  : { color: "#555577", border: "1px solid rgba(255,255,255,0.06)" }
              }
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-xl animate-pulse"
              style={{ background: "#12121f", border: "1px solid rgba(123,47,190,0.1)" }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl p-14 text-center"
          style={{ background: "#12121f", border: "1px solid rgba(123,47,190,0.15)" }}
        >
          <FolderOpen size={36} className="mx-auto mb-3" style={{ color: "#333355" }} />
          <p className="text-sm font-mono" style={{ color: "#555577" }}>لا توجد فئات بعد</p>
          <Link href="/admin/categories/new">
            <a
              className="mt-4 inline-block text-white text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: "rgba(123,47,190,0.3)", border: "1px solid rgba(123,47,190,0.4)" }}
            >
              أضف أول فئة
            </a>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl overflow-hidden transition-all group"
              style={{
                background: "#12121f",
                border: "1px solid rgba(123,47,190,0.15)",
              }}
            >
              {/* Image area */}
              <div
                className="h-28 relative overflow-hidden"
                style={{ background: "rgba(123,47,190,0.08)" }}
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt={cat.nameAr} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={24} style={{ color: "#333355" }} />
                  </div>
                )}
                {/* Overlay */}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, transparent 40%, #12121f)" }}
                />
                {/* Badges */}
                <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={
                      cat.isActive
                        ? { background: "rgba(16,185,129,0.2)", color: "#34d399", border: "1px solid rgba(16,185,129,0.3)" }
                        : { background: "rgba(255,255,255,0.05)", color: "#555577", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    {cat.isActive ? "● ACTIVE" : "○ HIDDEN"}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2.5 font-mono text-[10px]" style={{ color: "#555577" }}>
                  ID:{cat.id.toString().padStart(3, "0")}
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-white text-base mb-1">{cat.nameAr}</h3>
                {cat.description && (
                  <p className="text-xs line-clamp-1 mb-2" style={{ color: "#555577" }}>{cat.description}</p>
                )}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded"
                    style={{ background: "rgba(123,47,190,0.15)", color: "#a78bfa", border: "1px solid rgba(123,47,190,0.2)" }}
                  >
                    {cat.questionCount} سؤال
                  </span>
                  {cat.section && (
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
                    >
                      {cat.section}
                    </span>
                  )}
                </div>

                <div
                  className="flex items-center gap-2 mt-4 pt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <Link href={`/admin/categories/${cat.id}/questions`}>
                    <a
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-mono py-1.5 rounded-lg transition-all"
                      style={{
                        background: "rgba(123,47,190,0.15)",
                        color: "#a78bfa",
                        border: "1px solid rgba(123,47,190,0.2)",
                      }}
                    >
                      <Eye size={12} />
                      الأسئلة
                    </a>
                  </Link>
                  <Link href={`/admin/categories/${cat.id}/edit`}>
                    <a
                      className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#555577" }}
                    >
                      <Pencil size={13} />
                    </a>
                  </Link>
                  <button
                    onClick={() => handleDelete(cat.id, cat.nameAr)}
                    disabled={deletingId === cat.id}
                    className="flex items-center justify-center w-8 h-8 rounded-lg transition-all disabled:opacity-40"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#555577" }}
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
