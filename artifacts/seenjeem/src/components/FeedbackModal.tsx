import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus, X, Send, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

export function FeedbackModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(user?.username ?? "");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) { setError("اكتب رسالتك أولاً"); return; }
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name.trim() || "زائر", message: message.trim() }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setMessage(""); }, 2200);
    } catch {
      setError("فشل الإرسال، حاول مجدداً");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.08, boxShadow: "0 0 28px rgba(123,47,190,0.7)" }}
        whileTap={{ scale: 0.93 }}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-sm text-white shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #7B2FBE, #4a1a7e)",
          border: "1.5px solid rgba(180,120,255,0.4)",
          boxShadow: "0 8px 32px rgba(123,47,190,0.45)",
        }}
        title="صندوق الاقتراحات والشكاوى"
      >
        <MessageSquarePlus size={18} />
        <span className="hidden sm:inline">اقتراح / شكوى</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 40 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div
                className="relative w-full max-w-md rounded-3xl p-6 shadow-2xl pointer-events-auto"
                dir="rtl"
                style={{
                  background: "linear-gradient(160deg, #1a0a2e 0%, #0d0018 100%)",
                  border: "1.5px solid rgba(123,47,190,0.45)",
                  boxShadow: "0 0 60px rgba(123,47,190,0.2), 0 30px 80px rgba(0,0,0,0.6)",
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl"
                  style={{ background: "linear-gradient(90deg, #7B2FBE, #a855f7, #7B2FBE)" }} />

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-white font-black text-xl">صندوق الاقتراحات</h2>
                    <p className="text-white/45 text-xs mt-0.5">رأيك يفرق معنا</p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  >
                    <X size={16} className="text-white/60" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-3 py-8"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.6 }}
                      >
                        <CheckCircle size={52} className="text-emerald-400" style={{ filter: "drop-shadow(0 0 12px #34d399)" }} />
                      </motion.div>
                      <p className="text-white font-black text-lg">تم الإرسال!</p>
                      <p className="text-white/50 text-sm">شكراً على تواصلك معنا</p>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="flex flex-col gap-4">
                      {!user && (
                        <div>
                          <label className="text-white/60 text-xs font-bold mb-1.5 block">اسمك (اختياري)</label>
                          <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="اكتب اسمك..."
                            className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium outline-none"
                            style={{
                              background: "rgba(255,255,255,0.07)",
                              border: "1px solid rgba(123,47,190,0.35)",
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <label className="text-white/60 text-xs font-bold mb-1.5 block">رسالتك</label>
                        <textarea
                          value={message}
                          onChange={e => { setMessage(e.target.value); setError(""); }}
                          placeholder="اكتب اقتراحك أو شكواك هنا..."
                          rows={4}
                          className="w-full rounded-xl px-4 py-3 text-sm text-white font-medium outline-none resize-none"
                          style={{
                            background: "rgba(255,255,255,0.07)",
                            border: `1px solid ${error ? "rgba(239,68,68,0.6)" : "rgba(123,47,190,0.35)"}`,
                          }}
                        />
                        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
                      </div>

                      <motion.button
                        onClick={handleSubmit}
                        disabled={sending}
                        whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(123,47,190,0.6)" }}
                        whileTap={{ scale: 0.96 }}
                        className="w-full py-3.5 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)" }}
                      >
                        {sending ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Send size={16} />
                            إرسال
                          </>
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
