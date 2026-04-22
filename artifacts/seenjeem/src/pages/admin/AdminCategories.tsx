import { useEffect, useState } from "react";
import { Link } from "wouter";
import { FolderOpen, Plus, Pencil, Trash2, Eye, ImageIcon, Layers, Lock, Unlock, Clock, CheckCircle, ChevronDown, ChevronUp, Save, X } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { motion, AnimatePresence } from "framer-motion";

type CategoryStatus = "open" | "closed" | "in_progress";

interface Category {
  id: number;
  name: string;
  nameAr: string;
  section: string | null;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  status: CategoryStatus;
  lockMessage: string | null;
  isDefaultOpen: boolean;
  questionCount: number;
  createdAt: string;
}

const STATUS_CONFIG = {
  open: {
    label: "مفتوح",
    labelEn: "OPEN",
    icon: CheckCircle,
    bg: "rgba(16,185,129,0.18)",
    color: "#34d399",
    border: "rgba(16,185,129,0.35)",
    dot: "#34d399",
  },
  closed: {
    label: "مغلق",
    labelEn: "CLOSED",
    icon: Lock,
    bg: "rgba(239,68,68,0.18)",
    color: "#f87171",
    border: "rgba(239,68,68,0.35)",
    dot: "#f87171",
  },
  in_progress: {
    label: "قيد العمل",
    labelEn: "IN PROG",
    icon: Clock,
    bg: "rgba(251,191,36,0.18)",
    color: "#fbbf24",
    border: "rgba(251,191,36,0.35)",
    dot: "#fbbf24",
  },
} as const;

export default function AdminCategories() {
  const adminFetch = useAdminFetch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [sectionFilter, setSectionFilter] = useState("");
  const [expandedStatusId, setExpandedStatusId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<Record<number, { status: CategoryStatus; lockMessage: string }>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

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

  function toggleStatusExpand(id: number, cat: Category) {
    if (expandedStatusId === id) {
      setExpandedStatusId(null);
    } else {
      setExpandedStatusId(id);
      if (!pendingStatus[id]) {
        setPendingStatus((prev) => ({
          ...prev,
          [id]: { status: cat.status ?? "open", lockMessage: cat.lockMessage ?? "" },
        }));
      }
    }
  }

  async function handleSaveStatus(id: number) {
    const pending = pendingStatus[id];
    if (!pending) return;
    setSavingId(id);
    try {
      await adminFetch(`/admin/categories/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: pending.status, lockMessage: pending.lockMessage || null }),
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: pending.status, lockMessage: pending.lockMessage || null } : c
        )
      );
      setExpandedStatusId(null);
    } catch {
      alert("فشل حفظ الحالة");
    } finally {
      setSavingId(null);
    }
  }

  async function handleQuickStatus(id: number, newStatus: CategoryStatus, currentLockMsg: string | null) {
    setSavingId(id);
    try {
      await adminFetch(`/admin/categories/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, lockMessage: currentLockMsg }),
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      if (pendingStatus[id]) {
        setPendingStatus((prev) => ({ ...prev, [id]: { ...prev[id], status: newStatus } }));
      }
    } catch {
      alert("فشل تغيير الحالة");
    } finally {
      setSavingId(null);
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
              className="h-56 rounded-xl animate-pulse"
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
          {filtered.map((cat) => {
            const statusCfg = STATUS_CONFIG[cat.status as CategoryStatus] ?? STATUS_CONFIG.open;
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedStatusId === cat.id;
            const pending = pendingStatus[cat.id];

            return (
              <motion.div
                key={cat.id}
                layout
                className="rounded-xl overflow-hidden transition-all group"
                style={{
                  background: "#12121f",
                  border: `1px solid ${cat.status !== "open" ? statusCfg.border : "rgba(123,47,190,0.15)"}`,
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
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 40%, #12121f)" }}
                  />
                  {/* Badges top-right */}
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
                  {/* Status badge top-left */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded"
                      style={{ background: statusCfg.bg, color: statusCfg.color, border: `1px solid ${statusCfg.border}` }}
                    >
                      <StatusIcon size={9} />
                      {statusCfg.labelEn}
                    </span>
                  </div>
                  {/* isDefaultOpen badge */}
                  {cat.isDefaultOpen && (
                    <div className="absolute bottom-7 left-2.5">
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: "rgba(16,185,129,0.12)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.2)" }}>
                        ⭐ افتراضي
                      </span>
                    </div>
                  )}
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
                    {cat.lockMessage && cat.status !== "open" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded truncate max-w-[120px]"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" }}>
                        {cat.lockMessage}
                      </span>
                    )}
                  </div>

                  {/* ── Quick Status Buttons ── */}
                  <div className="flex items-center gap-1.5 mt-3">
                    {(["open", "in_progress", "closed"] as CategoryStatus[]).map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      const Ic = cfg.icon;
                      const isActive = cat.status === s;
                      return (
                        <button
                          key={s}
                          disabled={savingId === cat.id}
                          onClick={() => handleQuickStatus(cat.id, s, cat.lockMessage)}
                          className="flex-1 flex items-center justify-center gap-1 text-[10px] font-mono py-1.5 rounded-lg transition-all disabled:opacity-50"
                          style={
                            isActive
                              ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
                              : { background: "rgba(255,255,255,0.03)", color: "#444466", border: "1px solid rgba(255,255,255,0.06)" }
                          }
                        >
                          <Ic size={9} />
                          {cfg.label}
                        </button>
                      );
                    })}
                    {/* Expand advanced */}
                    <button
                      onClick={() => toggleStatusExpand(cat.id, cat)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                      style={{
                        background: isExpanded ? "rgba(123,47,190,0.2)" : "rgba(255,255,255,0.04)",
                        border: isExpanded ? "1px solid rgba(123,47,190,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        color: isExpanded ? "#c084fc" : "#555577",
                      }}
                    >
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* ── Advanced Status Editor ── */}
                  <AnimatePresence>
                    {isExpanded && pending && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="mt-3 p-3 rounded-lg"
                          style={{ background: "rgba(123,47,190,0.06)", border: "1px solid rgba(123,47,190,0.15)" }}
                        >
                          <p className="text-[10px] font-mono mb-2" style={{ color: "#7B2FBE" }}>حالة الفئة</p>
                          {/* Status radio buttons */}
                          <div className="flex gap-1.5 mb-3">
                            {(["open", "in_progress", "closed"] as CategoryStatus[]).map((s) => {
                              const cfg = STATUS_CONFIG[s];
                              const Ic = cfg.icon;
                              const isSelected = pending.status === s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => setPendingStatus((p) => ({ ...p, [cat.id]: { ...p[cat.id], status: s } }))}
                                  className="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-mono transition-all"
                                  style={
                                    isSelected
                                      ? { background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }
                                      : { background: "rgba(255,255,255,0.03)", color: "#444466", border: "1px solid rgba(255,255,255,0.06)" }
                                  }
                                >
                                  <Ic size={12} />
                                  {cfg.label}
                                </button>
                              );
                            })}
                          </div>
                          {/* Lock message input */}
                          <div className="mb-3">
                            <label className="text-[10px] font-mono mb-1 block" style={{ color: "#555577" }}>
                              رسالة مخصصة (اختياري)
                            </label>
                            <input
                              type="text"
                              value={pending.lockMessage}
                              onChange={(e) =>
                                setPendingStatus((p) => ({ ...p, [cat.id]: { ...p[cat.id], lockMessage: e.target.value } }))
                              }
                              placeholder="مثال: قريبًا..."
                              className="w-full text-xs font-mono px-3 py-2 rounded-lg outline-none transition-all"
                              style={{
                                background: "rgba(255,255,255,0.05)",
                                border: "1px solid rgba(123,47,190,0.2)",
                                color: "#e2e8f0",
                              }}
                              dir="rtl"
                            />
                          </div>
                          {/* Save / Cancel */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveStatus(cat.id)}
                              disabled={savingId === cat.id}
                              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-mono py-2 rounded-lg transition-all disabled:opacity-50"
                              style={{
                                background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)",
                                color: "#fff",
                                border: "1px solid rgba(123,47,190,0.5)",
                              }}
                            >
                              {savingId === cat.id ? (
                                <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
                              ) : (
                                <Save size={11} />
                              )}
                              حفظ
                            </button>
                            <button
                              onClick={() => setExpandedStatusId(null)}
                              className="w-8 flex items-center justify-center rounded-lg transition-all"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#555577" }}
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── Actions Row ── */}
                  <div
                    className="flex items-center gap-2 mt-3 pt-3"
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
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
