import { useState, useMemo } from "react";
import { X, BookOpen, ChevronDown, ChevronUp, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useAdminFetch } from "@/hooks/useAdminFetch";

interface Props {
  categoryId: number;
  categoryName: string;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedPair {
  questionText: string;
  answer: string;
  valid: boolean;
  error?: string;
}

interface Level {
  key: "easy" | "medium" | "hard";
  label: string;
  points: number;
  color: string;
  border: string;
  bg: string;
}

const LEVELS: Level[] = [
  { key: "easy",   label: "سهل",    points: 200, color: "#34d399", border: "rgba(52,211,153,0.3)",  bg: "rgba(52,211,153,0.05)"  },
  { key: "medium", label: "متوسط",  points: 400, color: "#fbbf24", border: "rgba(251,191,36,0.3)",  bg: "rgba(251,191,36,0.05)"  },
  { key: "hard",   label: "صعب",    points: 600, color: "#f87171", border: "rgba(248,113,113,0.3)", bg: "rgba(248,113,113,0.05)" },
];

// ── Smart Parser ──────────────────────────────────────────────────────────────
// Accepts text with Q: / A: pairs (any order, case-insensitive, Arabic colons ok)
// Also accepts numbered formats: 1. السؤال \n الجواب
function parseQA(raw: string): ParsedPair[] {
  if (!raw.trim()) return [];

  const pairs: ParsedPair[] = [];

  // Normalise Arabic colon → Latin colon
  const text = raw.replace(/：/g, ":").replace(/؟/g, "؟");

  // Split on blank lines or on every Q: prefix occurrence
  const blocks = text.split(/\n{2,}|\r\n{2,}/);

  for (const block of blocks) {
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    let q = "";
    let a = "";

    for (const line of lines) {
      const qMatch = line.match(/^[Qq]\s*[:：]\s*(.+)/);
      const aMatch = line.match(/^[Aa]\s*[:：]\s*(.+)/);
      if (qMatch) { q = qMatch[1].trim(); continue; }
      if (aMatch) { a = aMatch[1].trim(); continue; }
      // If no prefix found, first non-empty line = question, second = answer
      if (!q) { q = line; continue; }
      if (!a) { a = line; continue; }
    }

    if (!q && !a) continue;

    if (q && a) {
      pairs.push({ questionText: q, answer: a, valid: true });
    } else if (q && !a) {
      pairs.push({ questionText: q, answer: "", valid: false, error: "لا يوجد جواب لهذا السؤال" });
    }
  }

  return pairs;
}

function PreviewList({ pairs }: { pairs: ParsedPair[] }) {
  const [open, setOpen] = useState(false);
  if (!pairs.length) return null;
  const validCount = pairs.filter((p) => p.valid).length;
  return (
    <div className="mt-2 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-mono transition-colors"
        style={{ background: "rgba(255,255,255,0.03)", color: "#888899" }}
      >
        <span>
          معاينة: <span className="text-green-400">{validCount} صحيح</span>
          {pairs.length - validCount > 0 && (
            <span className="text-red-400 mr-2">{pairs.length - validCount} خطأ</span>
          )}
        </span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="divide-y" style={{ divideColor: "rgba(255,255,255,0.04)" }}>
          {pairs.map((p, i) => (
            <div key={i} className="px-3 py-2 flex gap-2" style={{ background: p.valid ? "transparent" : "rgba(248,113,113,0.05)" }}>
              <span className="text-xs font-mono mt-0.5" style={{ color: "#555577", minWidth: 20 }}>{i + 1}.</span>
              <div className="flex-1 min-w-0">
                {p.valid ? (
                  <>
                    <p className="text-xs text-white truncate">{p.questionText}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#888899" }}>← {p.answer}</p>
                  </>
                ) : (
                  <p className="text-xs" style={{ color: "#f87171" }}>
                    <AlertCircle size={10} className="inline ml-1" />
                    {p.questionText || "—"} · {p.error}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminQuestionBank({ categoryId, categoryName, onClose, onSuccess }: Props) {
  const adminFetch = useAdminFetch();
  const [texts, setTexts] = useState<Record<string, string>>({ easy: "", medium: "", hard: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const parsed = useMemo(() => {
    const out: Record<string, ParsedPair[]> = {};
    for (const lvl of LEVELS) out[lvl.key] = parseQA(texts[lvl.key]);
    return out;
  }, [texts]);

  const totalValid = useMemo(
    () => LEVELS.reduce((s, l) => s + parsed[l.key].filter((p) => p.valid).length, 0),
    [parsed]
  );

  const totalParsed = useMemo(
    () => LEVELS.reduce((s, l) => s + parsed[l.key].length, 0),
    [parsed]
  );

  async function handleSubmit() {
    if (totalValid === 0) {
      setResult({ type: "error", msg: "لا توجد أسئلة صحيحة للإضافة" });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = LEVELS.flatMap((lvl) =>
        parsed[lvl.key]
          .filter((p) => p.valid)
          .map((p) => ({
            categoryId,
            difficulty: lvl.key,
            points: lvl.points,
            questionText: p.questionText,
            answer: p.answer,
          }))
      );
      const data = await adminFetch("/admin/questions/bulk", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResult({ type: "success", msg: `تمت إضافة ${data.count} سؤال بنجاح!` });
      setTexts({ easy: "", medium: "", hard: "" });
      onSuccess(data.count);
    } catch (e: any) {
      setResult({ type: "error", msg: e?.message || "حدث خطأ في الخادم" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
        style={{ background: "#0d0d1a", border: "1px solid rgba(123,47,190,0.3)", boxShadow: "0 0 60px rgba(123,47,190,0.2)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <BookOpen size={15} style={{ color: "#7B2FBE" }} />
              <span className="text-xs font-mono" style={{ color: "#7B2FBE" }}>bank.import()</span>
            </div>
            <h2 className="text-lg font-black text-white">
              بنك الأسئلة
              <span className="text-sm font-normal mr-2" style={{ color: "#555577" }}>— {categoryName}</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ background: "rgba(255,255,255,0.04)", color: "#555577" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-3 text-xs font-mono" style={{ background: "rgba(123,47,190,0.06)", color: "#888899", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          اكتب الأسئلة بصيغة&nbsp;
          <span style={{ color: "#c084fc" }}>Q: السؤال</span> ثم&nbsp;
          <span style={{ color: "#34d399" }}>A: الجواب</span>، افصل بين كل زوج بسطر فارغ.
          يمكن كذلك كتابة السؤال في سطر والجواب في السطر التالي مباشرةً.
        </div>

        {/* Text areas */}
        <div className="px-6 py-5 space-y-5 flex-1">
          {LEVELS.map((lvl) => {
            const pairs = parsed[lvl.key];
            const validCount = pairs.filter((p) => p.valid).length;
            return (
              <div key={lvl.key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}` }}
                    >
                      {lvl.label} — {lvl.points} نقطة
                    </span>
                  </div>
                  {validCount > 0 && (
                    <span className="text-xs font-mono" style={{ color: lvl.color }}>
                      {validCount} سؤال ✓
                    </span>
                  )}
                </div>
                <textarea
                  dir="auto"
                  rows={5}
                  placeholder={`Q: ما هي عاصمة فرنسا؟\nA: باريس\n\nQ: 2 + 2 = ؟\nA: 4`}
                  value={texts[lvl.key]}
                  onChange={(e) => setTexts((t) => ({ ...t, [lvl.key]: e.target.value }))}
                  className="w-full rounded-xl resize-none text-sm outline-none transition-all font-mono leading-relaxed"
                  style={{
                    background: "#12121f",
                    border: `1px solid ${texts[lvl.key].trim() ? lvl.border : "rgba(255,255,255,0.07)"}`,
                    color: "#e2e8f0",
                    padding: "12px 14px",
                  }}
                />
                <PreviewList pairs={pairs} />
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex items-center justify-between gap-4 border-t"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="text-xs font-mono" style={{ color: "#555577" }}>
            {totalParsed > 0 ? (
              <span>
                تم اكتشاف <span className="text-white">{totalParsed}</span> سؤال،{" "}
                <span style={{ color: "#34d399" }}>{totalValid}</span> صالح للإضافة
              </span>
            ) : (
              <span>أدخل الأسئلة في المربعات أعلاه</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {result && (
              <div
                className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg"
                style={{
                  background: result.type === "success" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                  color: result.type === "success" ? "#34d399" : "#f87171",
                  border: `1px solid ${result.type === "success" ? "rgba(52,211,153,0.3)" : "rgba(248,113,113,0.3)"}`,
                }}
              >
                {result.type === "success"
                  ? <CheckCircle2 size={12} />
                  : <AlertCircle size={12} />}
                {result.msg}
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "#888899", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              إغلاق
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading || totalValid === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm font-black text-white rounded-lg transition-all"
              style={{
                background: totalValid > 0 ? "linear-gradient(135deg, #7B2FBE, #5a1f8e)" : "rgba(255,255,255,0.06)",
                boxShadow: totalValid > 0 ? "0 0 14px rgba(123,47,190,0.4)" : "none",
                border: `1px solid ${totalValid > 0 ? "rgba(123,47,190,0.5)" : "rgba(255,255,255,0.06)"}`,
                color: totalValid > 0 ? "#fff" : "#555577",
                cursor: loading || totalValid === 0 ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? "جاري الإضافة..." : `إضافة ${totalValid} سؤال`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
