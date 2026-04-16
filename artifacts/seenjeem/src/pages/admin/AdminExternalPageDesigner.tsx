import { useEffect, useRef, useState, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import ExternalPageRenderer, { DEFAULT_EXTERNAL_DESIGN, ExternalDesign, parseDesign } from "@/components/ExternalPageRenderer";
import { ArrowRight, Monitor, Smartphone, RefreshCw } from "lucide-react";

type SaveStatus = "idle" | "unsaved" | "saving" | "saved";
type Tab = "bg" | "badge" | "image" | "title" | "content" | "layout";
type PreviewSize = "desktop" | "mobile";

interface Page {
  id: number;
  title: string;
  slug: string;
  imageUrl: string | null;
  contentText: string | null;
  designJson: string | null;
}

const SWATCH = ["#ffffff", "#000000", "#7B2FBE", "#3b82f6", "#22c55e", "#ef4444", "#eab308", "#f97316", "#ec4899", "#0b0b14", "#12122a", "#9b6dff"];

function ColorSwatch({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {SWATCH.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-md transition-all hover:scale-110"
          style={{
            background: c,
            border: value === c ? "2px solid #c084fc" : "1px solid rgba(255,255,255,0.15)",
            boxShadow: value === c ? "0 0 8px #c084fc" : "none",
          }}
          title={c}
        />
      ))}
      <input
        type="color"
        value={value.startsWith("#") ? value : "#7B2FBE"}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6 rounded-md cursor-pointer"
        style={{ border: "1px solid rgba(255,255,255,0.15)", padding: 0 }}
        title="اختر لوناً مخصصاً"
      />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-bold" style={{ color: "#888899" }}>{label}</p>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step = 1, unit = "", onChange }: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void;
}) {
  return (
    <Row label={`${label}: ${value}${unit}`}>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-purple-500"
        style={{ height: 4 }}
      />
    </Row>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-bold" style={{ color: "#888899" }}>{label}</p>
      <button
        onClick={() => onChange(!value)}
        className="relative w-10 h-5 rounded-full transition-all"
        style={{ background: value ? "#7B2FBE" : "rgba(255,255,255,0.1)" }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
          style={{ left: value ? "calc(100% - 18px)" : "2px" }}
        />
      </button>
    </div>
  );
}

function AlignButtons({ value, onChange }: { value: "right" | "center" | "left"; onChange: (v: "right" | "center" | "left") => void }) {
  return (
    <div className="flex gap-1">
      {(["right", "center", "left"] as const).map((a) => (
        <button
          key={a}
          onClick={() => onChange(a)}
          className="flex-1 py-1 text-xs font-bold rounded-lg transition-all"
          style={{
            background: value === a ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
            color: value === a ? "#c084fc" : "#666688",
            border: `1px solid ${value === a ? "rgba(123,47,190,0.5)" : "transparent"}`,
          }}
        >
          {a === "right" ? "يمين" : a === "center" ? "وسط" : "يسار"}
        </button>
      ))}
    </div>
  );
}

function TextInput({ value, onChange, dir = "rtl", placeholder }: { value: string; onChange: (v: string) => void; dir?: string; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      className="w-full px-3 py-2 rounded-lg text-xs"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(123,47,190,0.25)", color: "#e2e2f0", outline: "none" }}
    />
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: "bg", label: "الخلفية" },
  { id: "badge", label: "الشارة" },
  { id: "image", label: "الصورة" },
  { id: "title", label: "العنوان" },
  { id: "content", label: "المحتوى" },
  { id: "layout", label: "التخطيط" },
];

export default function AdminExternalPageDesigner() {
  const [, params] = useRoute("/admin/external-pages/:id/design");
  const [, navigate] = useLocation();
  const adminFetch = useAdminFetch();
  const pageId = Number(params?.id);

  const [page, setPage] = useState<Page | null>(null);
  const [design, setDesign] = useState<ExternalDesign>({ ...DEFAULT_EXTERNAL_DESIGN });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [tab, setTab] = useState<Tab>("bg");
  const [previewSize, setPreviewSize] = useState<PreviewSize>("desktop");
  const [uploading, setUploading] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bgFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pageId) return;
    adminFetch(`/admin/external-pages/${pageId}`)
      .then((data: Page) => {
        setPage(data);
        setDesign(parseDesign(data.designJson));
      })
      .catch(() => {});
  }, [pageId]);

  const doSave = useCallback(async (d: ExternalDesign) => {
    setSaveStatus("saving");
    try {
      await adminFetch(`/admin/external-pages/${pageId}/design`, {
        method: "PUT",
        body: JSON.stringify({ designJson: JSON.stringify(d) }),
      });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("unsaved");
    }
  }, [pageId]);

  const update = useCallback(<K extends keyof ExternalDesign>(key: K, value: ExternalDesign[K]) => {
    setDesign((prev) => {
      const next = { ...prev, [key]: value };
      setSaveStatus("unsaved");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => doSave(next), 1200);
      return next;
    });
  }, [doSave]);

  async function handleUploadBg(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const token = localStorage.getItem("rakez-auth-token");
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      update("bgImageUrl", data.url);
      update("bgType", "image");
    } catch { alert("فشل رفع الصورة"); }
    finally { setUploading(false); }
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "#7B2FBE" }}>
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const previewW = previewSize === "mobile" ? 390 : 900;

  return (
    <div className="fixed inset-0 flex" style={{ background: "#08080f", zIndex: 100 }} dir="rtl">

      {/* ── Left: Controls ────────────────────────────────────────────── */}
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{ width: 320, borderLeft: "1px solid rgba(123,47,190,0.2)", background: "#0f0f1e", flexShrink: 0 }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(123,47,190,0.2)" }}>
          <button
            onClick={() => navigate("/admin/external-pages")}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <ArrowRight size={15} style={{ color: "#888899" }} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-white">{page.title}</p>
            <p className="text-[10px] font-mono" style={{ color: "#555577" }}>/p/{page.slug}</p>
          </div>
          {/* Save indicator */}
          <div className="flex items-center gap-1.5">
            {saveStatus === "unsaved" && <div className="w-2 h-2 rounded-full bg-yellow-400" />}
            {saveStatus === "saving" && <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />}
            {saveStatus === "saved" && <div className="w-2 h-2 rounded-full bg-green-400" />}
            {saveStatus === "idle" && <div className="w-2 h-2 rounded-full bg-blue-400 opacity-50" />}
            <span className="text-[10px]" style={{ color: "#555577" }}>
              {saveStatus === "unsaved" ? "غير محفوظ" : saveStatus === "saving" ? "حفظ..." : saveStatus === "saved" ? "✓ محفوظ" : "محرر"}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto px-2 py-2 gap-1" style={{ borderBottom: "1px solid rgba(123,47,190,0.15)" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: tab === t.id ? "rgba(123,47,190,0.3)" : "transparent",
                color: tab === t.id ? "#c084fc" : "#555577",
                border: `1px solid ${tab === t.id ? "rgba(123,47,190,0.4)" : "transparent"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">

          {/* ── BACKGROUND ── */}
          {tab === "bg" && (
            <>
              <Row label="نوع الخلفية">
                <div className="flex gap-1">
                  {(["solid", "gradient", "image"] as const).map((t) => (
                    <button key={t} onClick={() => update("bgType", t)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
                      style={{
                        background: design.bgType === t ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
                        color: design.bgType === t ? "#c084fc" : "#666688",
                        border: `1px solid ${design.bgType === t ? "rgba(123,47,190,0.5)" : "transparent"}`,
                      }}>
                      {t === "solid" ? "لون" : t === "gradient" ? "تدرج" : "صورة"}
                    </button>
                  ))}
                </div>
              </Row>

              {design.bgType === "solid" && (
                <Row label="لون الخلفية">
                  <ColorSwatch value={design.bgColor} onChange={(c) => update("bgColor", c)} />
                </Row>
              )}

              {design.bgType === "gradient" && (
                <>
                  <Row label="لون البداية">
                    <ColorSwatch value={design.bgGradientFrom} onChange={(c) => update("bgGradientFrom", c)} />
                  </Row>
                  <Row label="لون النهاية">
                    <ColorSwatch value={design.bgGradientTo} onChange={(c) => update("bgGradientTo", c)} />
                  </Row>
                  <Slider label="زاوية التدرج" value={design.bgGradientAngle} min={0} max={360} unit="°" onChange={(v) => update("bgGradientAngle", v)} />
                </>
              )}

              {design.bgType === "image" && (
                <>
                  <Row label="صورة الخلفية">
                    <button
                      onClick={() => bgFileRef.current?.click()}
                      disabled={uploading}
                      className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                      style={{ background: "rgba(123,47,190,0.2)", color: "#c084fc", border: "1px solid rgba(123,47,190,0.3)" }}
                    >
                      {uploading ? "⏳ جاري الرفع..." : "📤 رفع صورة خلفية"}
                    </button>
                    <input ref={bgFileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUploadBg(f); }} />
                    {design.bgImageUrl && (
                      <div className="mt-2 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(123,47,190,0.2)" }}>
                        <img src={design.bgImageUrl} className="w-full h-20 object-cover" alt="bg" />
                      </div>
                    )}
                  </Row>
                  <Row label="لون الطبقة الشفافة">
                    <ColorSwatch value={design.bgOverlayColor} onChange={(c) => update("bgOverlayColor", c)} />
                  </Row>
                  <Slider label="شفافية الطبقة" value={design.bgOverlayOpacity} min={0} max={100} unit="%" onChange={(v) => update("bgOverlayOpacity", v)} />
                </>
              )}
            </>
          )}

          {/* ── BADGE ── */}
          {tab === "badge" && (
            <>
              <Toggle label="إظهار الشارة" value={design.showBadge} onChange={(v) => update("showBadge", v)} />
              {design.showBadge && (
                <>
                  <Row label="نص الشارة">
                    <TextInput value={design.badgeText} onChange={(v) => update("badgeText", v)} placeholder="بدون كلام" />
                  </Row>
                  <Row label="لون النص">
                    <ColorSwatch value={design.badgeTextColor} onChange={(c) => update("badgeTextColor", c)} />
                  </Row>
                </>
              )}
            </>
          )}

          {/* ── IMAGE ── */}
          {tab === "image" && (
            <>
              <Toggle label="إظهار الصورة" value={design.showImage} onChange={(v) => update("showImage", v)} />
              {design.showImage && (
                <>
                  <Slider label="الحجم الأقصى" value={design.imageMaxWidth} min={100} max={900} unit="px" onChange={(v) => update("imageMaxWidth", v)} />
                  <Slider label="استدارة الحواف" value={design.imageBorderRadius} min={0} max={64} unit="px" onChange={(v) => update("imageBorderRadius", v)} />
                  <Toggle label="ظل الصورة" value={design.imageHasShadow} onChange={(v) => update("imageHasShadow", v)} />
                </>
              )}
            </>
          )}

          {/* ── TITLE ── */}
          {tab === "title" && (
            <div className="space-y-5">
              <Toggle label="إظهار العنوان" value={design.showTitle} onChange={(v) => update("showTitle", v)} />
              {design.showTitle && (
                <div className="space-y-5">
                  <Row label="لون العنوان">
                    <ColorSwatch value={design.titleColor} onChange={(c) => update("titleColor", c)} />
                  </Row>
                  <Slider label="حجم الخط" value={design.titleSize} min={16} max={120} unit="px" onChange={(v) => update("titleSize", v)} />
                  <Row label="محاذاة">
                    <AlignButtons value={design.titleAlign} onChange={(v) => update("titleAlign", v)} />
                  </Row>
                  <Row label="وزن الخط">
                    <div className="flex gap-1 flex-wrap">
                      {[["400", "عادي"], ["700", "عريض"], ["900", "أعرض"]].map(([w, l]) => (
                        <button key={w} onClick={() => update("titleWeight", w)}
                          className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                          style={{
                            background: design.titleWeight === w ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
                            color: design.titleWeight === w ? "#c084fc" : "#666688",
                            border: `1px solid ${design.titleWeight === w ? "rgba(123,47,190,0.5)" : "transparent"}`,
                          }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </Row>
                  <Toggle label="ظل النص" value={design.titleHasShadow} onChange={(v) => update("titleHasShadow", v)} />
                </div>
              )}
            </div>
          )}

          {/* ── CONTENT ── */}
          {tab === "content" && (
            <>
              <Row label="لون المحتوى">
                <ColorSwatch value={design.contentColor} onChange={(c) => update("contentColor", c)} />
              </Row>
              <Slider label="حجم الخط" value={design.contentSize} min={16} max={200} unit="px" onChange={(v) => update("contentSize", v)} />
              <Row label="محاذاة">
                <AlignButtons value={design.contentAlign} onChange={(v) => update("contentAlign", v)} />
              </Row>
              <Row label="وزن الخط">
                <div className="flex gap-1 flex-wrap">
                  {[["400", "عادي"], ["700", "عريض"], ["900", "أعرض"]].map(([w, l]) => (
                    <button key={w} onClick={() => update("contentWeight", w)}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: design.contentWeight === w ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
                        color: design.contentWeight === w ? "#c084fc" : "#666688",
                        border: `1px solid ${design.contentWeight === w ? "rgba(123,47,190,0.5)" : "transparent"}`,
                      }}>
                      {l}
                    </button>
                  ))}
                </div>
              </Row>
            </>
          )}

          {/* ── LAYOUT ── */}
          {tab === "layout" && (
            <>
              <Row label="محاذاة رأسية">
                <div className="flex gap-1">
                  {(["center", "top"] as const).map((v) => (
                    <button key={v} onClick={() => update("verticalAlign", v)}
                      className="flex-1 py-1.5 text-xs font-bold rounded-lg transition-all"
                      style={{
                        background: design.verticalAlign === v ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
                        color: design.verticalAlign === v ? "#c084fc" : "#666688",
                        border: `1px solid ${design.verticalAlign === v ? "rgba(123,47,190,0.5)" : "transparent"}`,
                      }}>
                      {v === "center" ? "مركز الصفحة" : "أعلى الصفحة"}
                    </button>
                  ))}
                </div>
              </Row>
              <Slider label="المسافة بين العناصر" value={design.elementSpacing} min={4} max={80} unit="px" onChange={(v) => update("elementSpacing", v)} />
              <Slider label="حشو الصفحة" value={design.pagePadding} min={8} max={80} unit="px" onChange={(v) => update("pagePadding", v)} />

              <div className="pt-2" style={{ borderTop: "1px solid rgba(123,47,190,0.15)" }}>
                <button
                  onClick={() => {
                    const d = { ...DEFAULT_EXTERNAL_DESIGN };
                    setDesign(d);
                    setSaveStatus("unsaved");
                    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                    saveTimerRef.current = setTimeout(() => doSave(d), 1200);
                  }}
                  className="w-full py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  إعادة ضبط التصميم الافتراضي
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Right: Preview ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview toolbar */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(123,47,190,0.15)", background: "#0b0b14" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono" style={{ color: "#555577" }}>معاينة حية</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewSize("desktop")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: previewSize === "desktop" ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
                color: previewSize === "desktop" ? "#c084fc" : "#666688",
              }}
              title="سطح المكتب"
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setPreviewSize("mobile")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{
                background: previewSize === "mobile" ? "rgba(123,47,190,0.3)" : "rgba(255,255,255,0.05)",
                color: previewSize === "mobile" ? "#c084fc" : "#666688",
              }}
              title="الجوال"
            >
              <Smartphone size={15} />
            </button>
            <button
              onClick={() => window.open(`/p/${page.slug}`, "_blank")}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.05)", color: "#666688" }}
              title="فتح الصفحة في نافذة جديدة"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-6" style={{ background: "#0b0b14" }}>
          <div
            style={{
              width: previewW,
              minHeight: previewSize === "mobile" ? 700 : 500,
              borderRadius: previewSize === "mobile" ? 24 : 12,
              overflow: "hidden",
              boxShadow: "0 0 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(123,47,190,0.2)",
              flexShrink: 0,
            }}
          >
            <ExternalPageRenderer
              title={page.title}
              imageUrl={page.imageUrl}
              contentText={page.contentText}
              design={design}
              scale={previewSize === "mobile" ? 0.6 : 0.75}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
