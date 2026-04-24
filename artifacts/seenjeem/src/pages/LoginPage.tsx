import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function switchMode(next: "login" | "register") {
    setMode(next);
    setError("");
    setUsername("");
    setPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        const result = await register(username, password);
        window.location.href = result.isAdmin ? "/admin" : "/";
        return;
      }

      const result = await login(username, password);

      if (result.requiresOtp) {
        // Store OTP session data for /verify-otp page
        sessionStorage.setItem(
          "rakez-otp-session",
          JSON.stringify({
            tempToken: result.tempToken,
            otp: result.otp,
            expiresAt: Date.now() + result.expiresInSeconds * 1000,
          })
        );
        navigate("/verify-otp");
      } else {
        window.location.href = result.isAdmin ? "/admin" : "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      <div
        className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(135deg, #3a007a 0%, #5a1ab8 30%, #7B3FF2 60%, #a06eee 85%, #c49cf5 100%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <motion.img
              src="/logo-white.png"
              alt="ركز"
              className="w-36 mb-2"
              animate={{
                filter: [
                  "drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.6)) drop-shadow(0 0 80px rgba(180,100,255,0.7))",
                  "drop-shadow(0 0 28px rgba(255,255,255,1)) drop-shadow(0 0 60px rgba(255,255,255,0.9)) drop-shadow(0 0 110px rgba(180,100,255,0.9))",
                  "drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.6)) drop-shadow(0 0 80px rgba(180,100,255,0.7))",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ mixBlendMode: "screen" }}
            />
            <p className="text-xl text-center font-extrabold text-white">فكر بسرعة... جاوب بدقة</p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === "login" ? "bg-[#7B2FBE] text-white" : "text-white/60 hover:text-white"}`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all ${mode === "register" ? "bg-[#7B2FBE] text-white" : "text-white/60 hover:text-white"}`}
            >
              حساب جديد
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-white/80 text-sm mb-1.5">اسم المستخدم</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
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
                  onChange={e => setPassword(e.target.value)}
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
                className="mt-1 w-full bg-[#7B2FBE] hover:bg-[#8B35D6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#7B2FBE]/40 hover:-translate-y-0.5 transition-all"
              >
                {loading
                  ? "جاري التحميل..."
                  : mode === "login"
                  ? "دخول"
                  : "إنشاء حساب"}
              </button>
            </motion.form>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
