import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const API_BASE = "/api";
const RESEND_COOLDOWN = 60;

type Step = "login" | "register" | "otp";

type OtpContext = {
  tempToken: string;
  maskedPhone: string;
  purpose: "login" | "register";
};

export default function LoginPage() {
  const { login, register, finalizeAuth } = useAuth();

  const [step, setStep] = useState<Step>("login");
  const [otpCtx, setOtpCtx] = useState<OtpContext | null>(null);

  function goOtp(ctx: OtpContext) {
    setOtpCtx(ctx);
    setStep("otp");
  }

  function goBack() {
    setStep(otpCtx?.purpose === "register" ? "register" : "login");
    setOtpCtx(null);
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

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <motion.img
              src="/logo-white.png"
              alt="ركز"
              className="w-36 mb-2"
              animate={{ filter: [
                "drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.6)) drop-shadow(0 0 80px rgba(180,100,255,0.7))",
                "drop-shadow(0 0 28px rgba(255,255,255,1)) drop-shadow(0 0 60px rgba(255,255,255,0.9)) drop-shadow(0 0 110px rgba(180,100,255,0.9))",
                "drop-shadow(0 0 18px rgba(255,255,255,1)) drop-shadow(0 0 40px rgba(255,255,255,0.6)) drop-shadow(0 0 80px rgba(180,100,255,0.7))",
              ]}}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ mixBlendMode: "screen" }}
            />
            <p className="text-xl text-center font-extrabold text-white">فكر بسرعة... جاوب بدقة</p>
          </div>

          <AnimatePresence mode="wait">
            {step === "login" && (
              <LoginForm key="login" onOtp={goOtp} onSwitchToRegister={() => setStep("register")} login={login} />
            )}
            {step === "register" && (
              <RegisterForm key="register" onOtp={goOtp} onSwitchToLogin={() => setStep("login")} register={register} />
            )}
            {step === "otp" && otpCtx && (
              <OtpForm key="otp" ctx={otpCtx} onBack={goBack} onSuccess={finalizeAuth} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Login Form ─── */
function LoginForm({ onOtp, onSwitchToRegister, login }: {
  onOtp: (ctx: OtpContext) => void;
  onSwitchToRegister: () => void;
  login: (u: string, p: string) => Promise<any>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await login(username, password);
      if (result.requiresOtp) {
        onOtp({ tempToken: result.tempToken, maskedPhone: result.phone, purpose: "login" });
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
    <Slide>
      <TabRow active="login" onLogin={() => {}} onRegister={onSwitchToRegister} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="اسم المستخدم">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم" required autoComplete="username" className={inputCls} />
        </Field>
        <Field label="كلمة المرور">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور" required autoComplete="current-password" className={inputCls} />
        </Field>
        {error && <ErrorBox msg={error} />}
        <SubmitBtn loading={loading} label="دخول" loadingLabel="جاري التحميل..." />
      </form>
    </Slide>
  );
}

/* ─── Register Form ─── */
function RegisterForm({ onOtp, onSwitchToLogin, register }: {
  onOtp: (ctx: OtpContext) => void;
  onSwitchToLogin: () => void;
  register: (u: string, p: string, ph: string) => Promise<any>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const localNum = phone.replace(/\D/g, "");
    if (!localNum) { setError("رقم الهاتف مطلوب للتحقق"); return; }
    if (localNum.length !== 8) { setError("رقم الهاتف الكويتي يجب أن يكون 8 أرقام"); return; }
    if (!/^[569]\d{7}$/.test(localNum)) { setError("أدخل رقم هاتف كويتي صحيح يبدأ بـ 5، 6، أو 9"); return; }
    setLoading(true);
    try {
      const fullPhone = `+965${localNum}`;
      const result = await register(username, password, fullPhone);
      if (result.requiresOtp) {
        onOtp({ tempToken: result.tempToken, maskedPhone: result.phone, purpose: "register" });
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Slide>
      <TabRow active="register" onLogin={onSwitchToLogin} onRegister={() => {}} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="اسم المستخدم">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)}
            placeholder="أدخل اسم المستخدم" required autoComplete="username" className={inputCls} />
        </Field>
        <Field label="كلمة المرور">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="أدخل كلمة المرور" required autoComplete="new-password" className={inputCls} />
        </Field>
        <KuwaitPhoneInput value={phone} onChange={setPhone} />
        {error && <ErrorBox msg={error} />}
        <SubmitBtn loading={loading} label="إنشاء حساب وتحقق" loadingLabel="جاري الإنشاء..." />
      </form>
    </Slide>
  );
}

/* ─── OTP Form ─── */
function OtpForm({ ctx, onBack, onSuccess }: {
  ctx: OtpContext;
  onBack: () => void;
  onSuccess: (token: string, user: any) => void;
}) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startCooldown();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCooldown(c => { if (c <= 1) { clearInterval(timerRef.current!); return 0; } return c - 1; });
    }, 1000);
  }

  async function handleResend() {
    if (cooldown > 0 || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: ctx.tempToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في إرسال الرمز");
      startCooldown();
      setCode("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إرسال الرمز");
    } finally {
      setSending(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length < 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken: ctx.tempToken, code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "رمز غير صحيح");
      onSuccess(data.token, data.user);
      window.location.href = data.user.isAdmin ? "/admin" : "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
      setCode("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Slide>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck size={26} className="text-purple-300" />
        </div>
        <p className="text-white font-bold text-lg mb-1">التحقق من رقم هاتفك</p>
        {ctx.maskedPhone ? (
          <p className="text-white/55 text-sm">
            أرسلنا رمز تحقق إلى <span className="text-white/85 font-mono tracking-wide">{ctx.maskedPhone}</span>
          </p>
        ) : (
          <p className="text-white/55 text-sm">أرسلنا رمز تحقق إلى رقم هاتفك</p>
        )}
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        {/* 6-digit boxes */}
        <OtpBoxes value={code} onChange={setCode} />

        {error && <ErrorBox msg={error} />}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full bg-[#7B2FBE] hover:bg-[#8B35D6] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transition-all"
        >
          {loading ? "جاري التحقق..." : "تحقق وادخل"}
        </button>

        {/* Resend + back */}
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={onBack}
            className="flex items-center gap-1 text-white/45 hover:text-white transition-colors">
            <ChevronRight size={14} />
            رجوع
          </button>

          <button type="button" onClick={handleResend}
            disabled={cooldown > 0 || sending}
            className="flex items-center gap-1.5 text-purple-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <RotateCcw size={13} />
            {sending ? "جاري الإرسال..." : cooldown > 0 ? `إعادة الإرسال (${cooldown}s)` : "إعادة الإرسال"}
          </button>
        </div>
      </form>
    </Slide>
  );
}

/* ─── OTP 6-box input ─── */
function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);

  function focusAt(i: number) {
    const el = containerRef.current?.querySelectorAll("input")[i] as HTMLInputElement | undefined;
    el?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (value[i]) {
        onChange(value.slice(0, i) + value.slice(i + 1));
      } else if (i > 0) {
        focusAt(i - 1);
        onChange(value.slice(0, i - 1) + value.slice(i));
      }
    }
  }

  function handleChange(i: number, raw: string) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    const arr = (value.padEnd(6, " ")).split("");
    arr[i] = digit;
    const joined = arr.join("").trimEnd();
    onChange(joined);
    if (i < 5) focusAt(i + 1);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); e.preventDefault(); focusAt(Math.min(pasted.length, 5)); }
  }

  return (
    <div ref={containerRef} className="flex gap-2 justify-center" dir="ltr">
      {[0,1,2,3,4,5].map((i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          autoFocus={i === 0}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-14 text-center text-xl font-black text-white rounded-xl border-2 bg-white/10 outline-none transition-all font-mono"
          style={{
            borderColor: value[i] && value[i] !== " " ? "rgba(167,139,250,0.9)" : "rgba(255,255,255,0.2)",
            boxShadow: value[i] && value[i] !== " " ? "0 0 12px rgba(167,139,250,0.35)" : "none",
          }}
        />
      ))}
    </div>
  );
}

/* ─── Kuwait Phone Input ─── */
function KuwaitPhoneInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const isValid = /^[569]\d{7}$/.test(digits);
  const isDirty = digits.length > 0;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 8);
    onChange(raw);
  }

  return (
    <div>
      <label className="block text-white/80 text-sm mb-1.5">رقم الهاتف</label>

      {/* Combined row */}
      <div
        className="flex overflow-hidden rounded-xl transition-all"
        style={{
          border: focused
            ? "1px solid rgba(123,47,190,0.9)"
            : isDirty && !isValid
            ? "1px solid rgba(248,113,113,0.6)"
            : "1px solid rgba(255,255,255,0.2)",
          boxShadow: focused ? "0 0 0 1px rgba(123,47,190,0.5)" : "none",
        }}
      >
        {/* Flag + code prefix — fixed, not editable */}
        <div className="flex items-center gap-1.5 px-3 bg-white/[0.07] border-l border-white/10 shrink-0 select-none">
          <span className="text-base leading-none">🇰🇼</span>
          <span className="text-white/80 text-sm font-semibold font-mono tracking-wide">+965</span>
          {/* thin divider */}
          <span className="text-white/20 ml-1">|</span>
        </div>

        {/* Number-only input (LTR) */}
        <input
          type="tel"
          inputMode="numeric"
          dir="ltr"
          value={digits}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="5XXXXXXXX"
          maxLength={8}
          className="flex-1 min-w-0 bg-transparent px-3 py-3 text-white placeholder:text-white/25 outline-none text-left font-mono tracking-wider text-sm"
        />

        {/* Live digit counter */}
        <div className="flex items-center pr-3 shrink-0">
          <span
            className="text-xs font-mono tabular-nums transition-colors"
            style={{ color: isValid ? "rgba(167,243,208,0.8)" : "rgba(255,255,255,0.25)" }}
          >
            {digits.length}/8
          </span>
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between mt-1.5 px-0.5">
        <p className="text-white/40 text-xs">
          سيُرسَل رمز التحقق إلى رقمك الكويتي
        </p>
        {isDirty && !isValid && digits.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-300/80 text-xs"
          >
            {digits.length < 8 ? `${8 - digits.length} أرقام متبقية` : "رقم غير صحيح"}
          </motion.p>
        )}
        {isValid && (
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-300/80 text-xs"
          >
            ✓ رقم صحيح
          </motion.p>
        )}
      </div>
    </div>
  );
}

/* ─── Shared tiny components ─── */
const inputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7B2FBE] focus:ring-1 focus:ring-[#7B2FBE] transition-all";

function Slide({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      {children}
    </motion.div>
  );
}

function TabRow({ active, onLogin, onRegister }: { active: "login" | "register"; onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-white/20 mb-6">
      <button onClick={onLogin}
        className={`flex-1 py-2.5 text-sm font-semibold transition-all ${active === "login" ? "bg-[#7B2FBE] text-white" : "text-white/60 hover:text-white"}`}>
        تسجيل الدخول
      </button>
      <button onClick={onRegister}
        className={`flex-1 py-2.5 text-sm font-semibold transition-all ${active === "register" ? "bg-[#7B2FBE] text-white" : "text-white/60 hover:text-white"}`}>
        حساب جديد
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-white/80 text-sm mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button type="submit" disabled={loading}
      className="mt-1 w-full bg-[#7B2FBE] hover:bg-[#8B35D6] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-[#7B2FBE]/40 hover:-translate-y-0.5 transition-all">
      {loading ? loadingLabel : label}
    </button>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
      className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm text-center">
      {msg}
    </motion.div>
  );
}
