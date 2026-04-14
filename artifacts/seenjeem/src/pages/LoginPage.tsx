import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const result = await login(username, password);
        navigate(result.isAdmin ? "/admin" : "/");
      } else {
        await register(username, password);
        navigate("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 z-0">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo-white.png" alt="ركز" className="w-32 mb-3" style={{ mixBlendMode: "screen" }} />
            <p className="text-white/70 text-sm">الجواب عليك، و السؤال علينا</p>
          </div>

          <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === "login" ? "bg-[#7B2FBE] text-white" : "text-white/60 hover:text-white"}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === "register" ? "bg-[#7B2FBE] text-white" : "text-white/60 hover:text-white"}`}
            >
              حساب جديد
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-1.5">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
                autoComplete="username"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7B2FBE] focus:ring-1 focus:ring-[#7B2FBE] transition-all"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7B2FBE] focus:ring-1 focus:ring-[#7B2FBE] transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-[#7B2FBE] hover:bg-[#8B35D6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#7B2FBE]/40 hover:-translate-y-0.5 transition-all"
            >
              {loading ? "جاري التحميل..." : mode === "login" ? "دخول" : "إنشاء حساب"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
