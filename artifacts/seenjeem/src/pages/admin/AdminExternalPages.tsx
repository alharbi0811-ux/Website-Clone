import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Globe, X, Check } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface ExternalPage {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  contentText: string | null;
  createdAt: string;
}

const inputStyle: React.CSSProperties = {
  background: "#0b0b14",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e2f0",
  borderRadius: "8px",
  padding: "10px 14px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontFamily: "monospace",
  color: "#555577",
  marginBottom: "6px",
  letterSpacing: "0.04em",
};

const emptyForm = { title: "", slug: "", imageUrl: "", contentText: "" };

export default function AdminExternalPages() {
  const adminFetch = useAdminFetch();
  const [pages, setPages] = useState<ExternalPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(123,47,190,0.6)"),
    onBlur: (e: React.FocusEvent<any>) => (e.target.style.borderColor = "rgba(255,255,255,0.08)"),
  };

  async function load() {
    try {
      const data = await adminFetch("/admin/external-pages");
      setPages(data);
    } catch {
      setError("فشل تحميل الصفحات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: ExternalPage) {
    setEditingId(p.id);
    setForm({ title: p.title, slug: p.slug, imageUrl: p.imageUrl || "", contentText: p.contentText || "" });
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    setError("");
    if (!form.title.trim()) return setError("العنوان مطلوب");
    if (!form.slug.trim()) return setError("الـ slug مطلوب");
    if (!/^[a-z0-9-]+$/.test(form.slug)) return setError("الـ slug يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط");
    setSaving(true);
    try {
      const body = {
        title: form.title,
        slug: form.slug,
        imageUrl: form.imageUrl || null,
        contentText: form.contentText || null,
      };
      if (editingId) {
        await adminFetch(`/admin/external-pages/${editingId}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await adminFetch("/admin/external-pages", { method: "POST", body: JSON.stringify(body) });
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("هل أنت متأكد من حذف هذه الصفحة؟")) return;
    try {
      await adminFetch(`/admin/external-pages/${id}`, { method: "DELETE" });
      load();
    } catch {
      setError("فشل الحذف");
    }
  }

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<any>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono" style={{ color: "#3b82f6" }}>~/admin/external-pages $</span>
          </div>
          <h2 className="text-xl font-black text-white">الصفحات الخارجية</h2>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold text-sm transition-all"
          style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 0 16px rgba(123,47,190,0.35)" }}
        >
          <Plus size={15} /> إضافة صفحة
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-lg rounded-2xl p-6 space-y-4"
            style={{ background: "#12121f", border: "1px solid rgba(123,47,190,0.25)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-black text-white">{editingId ? "تعديل الصفحة" : "صفحة جديدة"}</h3>
              <button onClick={() => setShowForm(false)} style={{ color: "#555577" }}><X size={18} /></button>
            </div>

            <div>
              <label style={labelStyle}>العنوان *</label>
              <input value={form.title} onChange={set("title")} placeholder="اسم الصفحة..." style={inputStyle} {...focusHandlers} />
            </div>

            <div>
              <label style={labelStyle}>الـ slug (رابط فريد) *</label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono" style={{ color: "#555577" }}>/p/</span>
                <input
                  value={form.slug}
                  onChange={set("slug")}
                  placeholder="my-page-name"
                  style={{ ...inputStyle, direction: "ltr" }}
                  {...focusHandlers}
                />
              </div>
              <p className="text-[10px] font-mono mt-1" style={{ color: "#444466" }}>أحرف إنجليزية صغيرة وأرقام وشرطات فقط</p>
            </div>

            <div>
              <label style={labelStyle}>رابط الصورة (اختياري)</label>
              <input value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." style={{ ...inputStyle, direction: "ltr" }} {...focusHandlers} />
            </div>

            <div>
              <label style={labelStyle}>محتوى نصي (اختياري)</label>
              <textarea
                value={form.contentText}
                onChange={set("contentText")}
                placeholder="نص إضافي يظهر في الصفحة..."
                rows={3}
                style={{ ...inputStyle, resize: "none" }}
                {...focusHandlers}
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg text-sm font-mono"
                style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
                ✗ {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-lg transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)", boxShadow: "0 0 16px rgba(59,130,246,0.35)" }}
              >
                {saving ? <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={15} />}
                {saving ? "جاري الحفظ..." : editingId ? "حفظ التعديلات" : "إضافة الصفحة"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#8888aa" }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages list */}
      {loading ? (
        <div className="text-center py-12 font-mono text-sm" style={{ color: "#555577" }}>جاري التحميل...</div>
      ) : pages.length === 0 ? (
        <div className="text-center py-16 rounded-xl" style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.06)" }}>
          <Globe size={40} className="mx-auto mb-3" style={{ color: "#333355" }} />
          <p className="font-mono text-sm" style={{ color: "#555577" }}>لا توجد صفحات خارجية بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pages.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: "#12121f", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <Globe size={16} style={{ color: "#3b82f6" }} />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{p.title}</p>
                  <p className="text-xs font-mono truncate" style={{ color: "#3b82f6" }}>/p/{p.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Pencil size={13} style={{ color: "#8888aa" }} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)" }}
                >
                  <Trash2 size={13} style={{ color: "#f87171" }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
