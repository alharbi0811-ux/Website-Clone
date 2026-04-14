import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

export default function AdminCategoryForm() {
  const [, navigate] = useLocation();
  const [matchEdit, paramsEdit] = useRoute("/admin/categories/:id/edit");
  const isEdit = matchEdit;
  const editId = paramsEdit?.id;

  const adminFetch = useAdminFetch();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    nameAr: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (isEdit && editId) {
      setLoading(true);
      adminFetch(`/admin/categories`)
        .then((cats: any[]) => {
          const cat = cats.find((c) => c.id === Number(editId));
          if (cat) {
            setForm({
              name: cat.name,
              nameAr: cat.nameAr,
              description: cat.description || "",
              imageUrl: cat.imageUrl || "",
              isActive: cat.isActive,
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isEdit, editId, adminFetch]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: form.name || form.nameAr,
        nameAr: form.nameAr,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
      };
      if (isEdit && editId) {
        await adminFetch(`/admin/categories/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch("/admin/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/admin/categories");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate("/admin/categories")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowRight size={18} />
        </button>
        <div>
          <h2 className="text-2xl font-black text-gray-900">
            {isEdit ? "تعديل الفئة" : "فئة جديدة"}
          </h2>
          <p className="text-gray-500 mt-0.5 text-sm">
            {isEdit ? "عدّل بيانات الفئة" : "أضف فئة جديدة لبنك الأسئلة"}
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">اسم الفئة (عربي) *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              required
              placeholder="مثال: الكويت، علوم، تاريخ..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">وصف الفئة (اختياري)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف مختصر للفئة..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/10 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-2">
                <ImageIcon size={14} />
                رابط صورة الفئة (اختياري)
              </span>
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7B2FBE] focus:ring-2 focus:ring-[#7B2FBE]/10 transition-all"
            />
            {form.imageUrl && (
              <div className="mt-3 rounded-xl overflow-hidden h-36 border border-gray-100">
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, isActive: !form.isActive })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isActive ? "bg-[#7B2FBE]" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "right-0.5" : "left-0.5"}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {form.isActive ? "الفئة نشطة وتظهر في اللعبة" : "الفئة مخفية"}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#7B2FBE] text-white font-bold py-3 rounded-xl hover:bg-[#6a25a8] transition-all shadow-[0_4px_14px_rgba(123,47,190,0.3)] disabled:opacity-60"
            >
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إنشاء الفئة"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
