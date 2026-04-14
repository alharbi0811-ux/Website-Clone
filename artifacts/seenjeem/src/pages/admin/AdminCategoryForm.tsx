import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowRight, ImageIcon, Check, Eye, EyeOff } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

const inputStyle = {
  background: "#0b0b14",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e2f0",
  borderRadius: "8px",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#555577",
  marginBottom: "6px",
  letterSpacing: "0.04em",
};

const SECTIONS = [
  "أجدد الفئات", "الكويت", "عام", "إسلامي",
  "دول", "حروف", "ولا كلمة", "التفكير",
];

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
    name: "", nameAr: "", section: "", description: "", imageUrl: "", isActive: true,
  });

  useEffect(() => {
    if (isEdit && editId) {
      setLoading(true);
      adminFetch("/admin/categories")
        .then((cats: any[]) => {
          const cat = cats.find((c) => c.id === Number(editId));
          if (cat) {
            setForm({
              name: cat.name, nameAr: cat.nameAr,
              section: cat.section || "", description: cat.description || "",
              imageUrl: cat.imageUrl || "", isActive: cat.isActive,
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
        section: form.section || undefined,
        description: form.description || undefined,
        imageUrl: form.imageUrl || undefined,
        isActive: form.isActive,
      };
      if (isEdit && editId) {
        await adminFetch(`/admin/categories/${editId}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await adminFetch("/admin/categories", { method: "POST", body: JSON.stringify(payload) });
      }
      navigate("/admin/categories");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="rounded-xl h-64 animate-pulse" style={{ background: "#12121f" }} />;
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
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono" style={{ color: "#7B2FBE" }}>~/admin/categories $</span>
            <span className="text-xs font-mono" style={{ color: "#444466" }}>{isEdit ? "edit" : "new"}</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {isEdit ? "تعديل الفئة" : "فئة جديدة"}
          </h2>
        </div>
      </div>

      <div className="max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl p-6 space-y-5"
          style={{ background: "#12121f", border: "1px solid rgba(123,47,190,0.15)" }}
        >

          {/* Name */}
          <div>
            <label style={labelStyle}>اسم الفئة (عربي) *</label>
            <input
              type="text"
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              required
              placeholder="مثال: الكويت، علوم، تاريخ..."
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(123,47,190,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Section */}
          <div>
            <label style={labelStyle}>المجال *</label>
            <select
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              required
              dir="rtl"
              style={{ ...inputStyle, cursor: "pointer" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(123,47,190,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            >
              <option value="" style={{ background: "#0b0b14" }}>-- اختر المجال --</option>
              {SECTIONS.map((s) => (
                <option key={s} value={s} style={{ background: "#0b0b14" }}>{s}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>وصف الفئة <span style={{ color: "#333355" }}>(اختياري)</span></label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="وصف مختصر للفئة..."
              rows={3}
              style={{ ...inputStyle, resize: "none" }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(123,47,190,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {/* Image URL */}
          <div>
            <label style={labelStyle}>
              <span className="flex items-center gap-1.5">
                <ImageIcon size={10} />
                رابط صورة الفئة <span style={{ color: "#333355" }}>(اختياري)</span>
              </span>
            </label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://example.com/image.png"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "rgba(123,47,190,0.6)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
            {form.imageUrl && (
              <div
                className="mt-3 rounded-lg overflow-hidden h-32 relative"
                style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <img
                  src={form.imageUrl}
                  alt="preview"
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>

          {/* Toggle */}
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
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                style={{ [form.isActive ? "right" : "left"]: "2px" }}
              />
            </button>
            <div className="flex items-center gap-1.5">
              {form.isActive
                ? <Eye size={12} style={{ color: "#34d399" }} />
                : <EyeOff size={12} style={{ color: "#555577" }} />}
              <span className="text-xs font-mono" style={{ color: form.isActive ? "#34d399" : "#555577" }}>
                {form.isActive ? "الفئة نشطة · تظهر في اللعبة" : "الفئة مخفية · لن تظهر في اللعبة"}
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
                background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)",
                boxShadow: "0 0 16px rgba(123,47,190,0.35)",
              }}
            >
              {saving ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : <Check size={15} />}
              {saving ? "جاري الحفظ..." : isEdit ? "حفظ التعديلات" : "إنشاء الفئة"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
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
