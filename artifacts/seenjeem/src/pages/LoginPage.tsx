import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [step, setStep] = useState<Step>("credentials");
  const [tempToken, setTempToken] = useState("");
  const [maskedPhone, setMaskedPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        await register(username, password);
        navigate("/");
        return;
      }
      const result = await login(username, password);
      if ("requiresOtp" in result && result.requiresOtp) {
        setTempToken((result as any).tempToken);
        setMaskedPhone((result as any).phone ?? "");
        setStep("otp");
        handleSendOtp((result as any).tempToken);
      } else {
        navigate((result as any).isAdmin ? "/admin" : "/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(token?: string) {
    setSendingOtp(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: token ?? tempToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في إرسال الرمز");
      setOtpSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الرمز");
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "رمز غير صحيح");
      localStorage.setItem("rakez-auth-token", data.token);
      window.location.href = data.user.isAdmin ? "/admin" : "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 z-0"
        style={{ background: "linear-gradient(135deg, #3a007a 0%, #5a1ab8 30%, #7B3FF2 60%, #a06eee 85%, #c49cf5 100%)" }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src="/logo-white.png"
              alt="ركز"
              className="w-40 mb-3"
              animate={{ filter: [
                "drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.6)) drop-shadow(0 0 80px rgba(180,100,255,0.7))",
                "drop-shadow(0 0 28px rgba(255,255,255,1)) drop-shadow(0 0 60px rgba(255,255,255,0.9)) drop-shadow(0 0 110px rgba(180,100,255,0.9))",
                "drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.6)) drop-shadow(0 0 80px rgba(180,100,255,0.7))",
              ]}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ mixBlendMode: "screen" }}
            />
            <p className="text-[26px] text-center font-extrabold text-white">فكر  بسرعه ...  جاوب بدقة</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.div key="creds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
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

                <form onSubmit={handleCredentials} className="flex flex-col gap-4">
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

                  {error && <ErrorBox msg={error} />}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full bg-[#7B2FBE] hover:bg-[#8B35D6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#7B2FBE]/40 hover:-translate-y-0.5 transition-all"
                  >
                    {loading ? "جاري التحميل..." : mode === "login" ? "دخول" : "إنشاء حساب"}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 text-2xl">
                    📱
                  </div>
                  <p className="text-white font-bold text-lg mb-1">تحقق من هاتفك</p>
                  {maskedPhone && (
                    <p className="text-white/60 text-sm">
                      تم إرسال رمز التحقق إلى <span className="text-white/90 font-mono">{maskedPhone}</span>
                    </p>
                  )}
                  {!maskedPhone && (
                    <p className="text-white/60 text-sm">تم إرسال رمز التحقق إلى رقم هاتفك</p>
                  )}
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-1.5">رمز التحقق</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="أدخل الرمز المكون من 6 أرقام"
                      required
                      autoFocus
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7B2FBE] focus:ring-1 focus:ring-[#7B2FBE] transition-all text-center text-xl tracking-widest font-mono"
                    />
                  </div>

                  {error && <ErrorBox msg={error} />}

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 4}
                    className="w-full bg-[#7B2FBE] hover:bg-[#8B35D6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
                  >
                    {loading ? "جاري التحقق..." : "تحقق وادخل"}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => { setStep("credentials"); setOtpCode(""); setError(""); setOtpSent(false); }}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      تغيير الحساب
                    </button>
                    <button
                      type="button"
                      disabled={sendingOtp}
                      onClick={() => handleSendOtp()}
                      className="text-purple-300 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {sendingOtp ? "جاري الإرسال..." : "إعادة إرسال الرمز"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm text-center"
    >
      {msg}
    </motion.div>
  );
}
