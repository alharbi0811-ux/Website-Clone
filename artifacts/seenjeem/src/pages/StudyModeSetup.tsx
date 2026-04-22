import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  BookOpen, Layers, BookMarked, Target, Check,
  GraduationCap, Users, Zap, Sword, Shield, ChevronRight,
  Star, Sprout, Flame, Sun, Moon, Calculator, FlaskConical,
  Globe, Palette, Activity, Monitor, Music, School,
  Package, FileText, ChevronLeft, TrendingUp,
} from "lucide-react";

const API = "/api";
const THEME_KEY = "rakez-theme";

type Stage   = { id: number; name: string; order: number };
type Grade   = { id: number; stageId: number; name: string; order: number };
type Subject = { id: number; gradeId: number | null; name: string };
type Unit    = { id: number; name: string; subjectId: number; term: number };
type Lesson  = { id: number; name: string; unitId: number };
type Theme   = "light" | "dark";

const STEP_MISSIONS = ["TEAM SETUP","SELECT ZONE","CHOOSE LEVEL","PICK SUBJECT","CHOOSE SEASON","SELECT MISSION","CUSTOMIZE"];
const SUBJECT_ICONS = [Calculator,FlaskConical,Globe,BookOpen,Palette,Activity,Monitor,Music];
const STAGE_ICONS   = [Sprout,Flame,Zap,TrendingUp];

/* ─── Theme palettes ─── */
const TH = {
  light: {
    bg: "#ffffff",
    cardBg: "#ffffff",
    cardBorder: "rgba(0,0,0,0.08)",
    cardShadow: "0 2px 12px rgba(0,0,0,0.04)",
    cardSelBg: "rgba(123,47,190,0.08)",
    cardSelBorder: "#7B2FBE",
    cardSelShadow: "0 0 0 3px rgba(123,47,190,0.2),0 0 24px rgba(123,47,190,0.25),inset 0 1px 0 rgba(255,255,255,0.8)",
    text: "#111827",
    textSub: "#6b7280",
    textMuted: "#9ca3af",
    label: "#9ca3af",
    inputBg: "#ffffff",
    inputBorder: "rgba(0,0,0,0.08)",
    inputFocusBorder: "#7B2FBE",
    inputFocusShadow: "0 0 0 3px rgba(123,47,190,0.1)",
    footerBg: "#ffffff",
    footerShadow: "0 -4px 20px rgba(0,0,0,0.05)",
    infoBoxBg: "rgba(123,47,190,0.05)",
    infoBoxBorder: "rgba(123,47,190,0.12)",
    iconBg: "#f3f4f6",
    iconColor: "#6b7280",
    scanline: "none",
    gridOverlay: false,
    toggleBg: "rgba(255,255,255,0.12)",
    numBadgeBg: "rgba(123,47,190,0.08)",
    numBadgeColor: "#7B2FBE",
    accent: "#7B2FBE",
    accentBright: "#a855f7",
  },
  dark: {
    bg: "#08001a",
    cardBg: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(168,85,247,0.14)",
    cardShadow: "0 2px 16px rgba(0,0,0,0.4)",
    cardSelBg: "rgba(168,85,247,0.13)",
    cardSelBorder: "#a855f7",
    cardSelShadow: "0 0 0 3px rgba(168,85,247,0.22),0 0 32px rgba(168,85,247,0.3)",
    text: "#ede8ff",
    textSub: "rgba(255,255,255,0.45)",
    textMuted: "rgba(255,255,255,0.28)",
    label: "rgba(168,85,247,0.7)",
    inputBg: "rgba(255,255,255,0.07)",
    inputBorder: "rgba(168,85,247,0.18)",
    inputFocusBorder: "#a855f7",
    inputFocusShadow: "0 0 0 3px rgba(168,85,247,0.15)",
    footerBg: "#08001a",
    footerShadow: "0 -4px 24px rgba(0,0,0,0.6)",
    infoBoxBg: "rgba(168,85,247,0.1)",
    infoBoxBorder: "rgba(168,85,247,0.25)",
    iconBg: "rgba(168,85,247,0.12)",
    iconColor: "#c084fc",
    scanline: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.018) 3px,rgba(255,255,255,0.018) 4px)",
    gridOverlay: true,
    toggleBg: "rgba(255,255,255,0.12)",
    numBadgeBg: "rgba(168,85,247,0.15)",
    numBadgeColor: "#c084fc",
    accent: "#a855f7",
    accentBright: "#e879f9",
  },
};

/* ─── Particles ─── */
const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i, left: `${6 + i * 9}%`, size: 3 + (i % 4) * 2,
  duration: 5 + i * 1.2, delay: i * 0.7,
}));
function GameParticles({ dark }: { dark: boolean }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: p.left, bottom: -20, width: p.size, height: p.size,
            background: dark ? `rgba(168,85,247,${0.15 + (p.id % 3) * 0.07})` : "rgba(123,47,190,0.14)" }}
          animate={{ y: [0, -(typeof window !== "undefined" ? window.innerHeight + 40 : 900)], opacity: [0, 0.8, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ─── Locked-In overlay ─── */
function LockedIn({ show, label, dark }: { show: boolean; label: string; dark: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.35)", backdropFilter: "blur(6px)" }}>
          <motion.div
            initial={{ scale: 0.3, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="text-center px-10 py-7 rounded-3xl relative"
            style={{
              background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
              boxShadow: "0 0 70px rgba(123,47,190,0.75),0 20px 60px rgba(0,0,0,0.35)",
            }}>
            <p className="text-white font-black text-3xl tracking-wide">{label}</p>
            {[0,1,2].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-3xl border-2 border-purple-400"
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 1.7 + i * 0.5, opacity: 0 }}
                transition={{ duration: 0.65, delay: i * 0.1, ease: "easeOut" }} />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Step Flash ─── */
function StepFlash({ show, stepNum }: { show: boolean; stepNum: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(40,0,80,0.55)", backdropFilter: "blur(6px)" }}>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }} className="overflow-hidden text-center">
            <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.55, repeat: Infinity }}
              className="font-black tracking-[0.4em] text-sm mb-1.5" style={{ color: "#a855f7" }}>
              STAGE {stepNum} OF {STEP_MISSIONS.length}
            </motion.p>
            <p className="text-white font-black tracking-[0.18em]" style={{ fontSize: 30 }}>
              {STEP_MISSIONS[stepNum - 1]}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── NeonCard ─── */
function NCard({ selected, onClick, children, fullWidth = false, t, dark }: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
  fullWidth?: boolean; t: typeof TH.light; dark: boolean;
}) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.92 }}
      whileHover={!selected ? { scale: 1.03, y: -3 } : {}}
      className={`relative rounded-2xl border-2 overflow-hidden text-right ${fullWidth ? "w-full" : ""}`}
      style={selected ? {
        borderColor: t.cardSelBorder,
        background: t.cardSelBg,
        boxShadow: t.cardSelShadow,
      } : {
        borderColor: t.cardBorder,
        background: t.cardBg,
        boxShadow: t.cardShadow,
      }}>
      {selected && (
        <>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.35 }}
            className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: dark
              ? "linear-gradient(90deg,transparent,#e879f9,#a855f7,#e879f9,transparent)"
              : "linear-gradient(90deg,transparent,#a855f7,#7B2FBE,#a855f7,transparent)" }} />
          {dark && (
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(168,85,247,0.12),transparent 70%)" }} />
          )}
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 18 }}
            className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
            style={{ background: dark ? "#a855f7" : "#7B2FBE", boxShadow: `0 0 10px ${dark ? "rgba(168,85,247,0.7)" : "rgba(123,47,190,0.6)"}` }}>
            <Check size={11} className="text-white" />
          </motion.div>
        </>
      )}
      <div className="p-4">{children}</div>
    </motion.button>
  );
}

/* ─── Inputs ─── */
function GInput({ value, onChange, placeholder, icon: Icon, t }: {
  value: string; onChange: (v: string) => void; placeholder: string; icon: React.ElementType;
  t: typeof TH.light;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: focused ? t.accent : t.textMuted }}>
        <Icon size={15} />
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full pr-9 pl-4 py-3.5 rounded-xl font-bold text-sm focus:outline-none"
        style={{
          background: t.inputBg,
          border: `2px solid ${focused ? t.inputFocusBorder : t.inputBorder}`,
          boxShadow: focused ? t.inputFocusShadow : "none",
          color: t.text,
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      />
    </div>
  );
}

/* ─── Icon circle ─── */
function ICircle({ Icon, active, t }: { Icon: React.ElementType; active: boolean; t: typeof TH.light }) {
  return (
    <motion.div
      animate={active ? { background: "#7B2FBE", boxShadow: "0 0 18px rgba(123,47,190,0.6)" } : { background: t.iconBg, boxShadow: "none" }}
      className="rounded-xl flex items-center justify-center flex-shrink-0 w-12 h-12">
      <Icon size={22} style={{ color: active ? "white" : t.iconColor }} />
    </motion.div>
  );
}

/* ─── Spinner ─── */
function Spinner({ t }: { t: typeof TH.light }) {
  return (
    <div className="flex flex-col items-center py-14 gap-3">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full absolute" style={{ border: `3px solid ${t.cardBorder}` }} />
        <div className="w-12 h-12 border-3 border-transparent rounded-full animate-spin absolute"
          style={{ borderTopColor: t.accent }} />
        <div className="w-6 h-6 border-2 border-transparent rounded-full animate-spin absolute top-3 left-3"
          style={{ borderTopColor: t.accentBright, animationDirection: "reverse" }} />
      </div>
      <p className="text-xs font-black tracking-widest" style={{ color: t.accent }}>LOADING...</p>
    </div>
  );
}

/* ─── Empty ─── */
function Empty({ icon: Icon, msg, t }: { icon: React.ElementType; msg: string; t: typeof TH.light }) {
  return (
    <div className="flex flex-col items-center py-14 gap-3">
      <motion.div animate={{ y: [0,-6,0] }} transition={{ duration: 2, repeat: Infinity }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: t.infoBoxBg, border: `2px solid ${t.infoBoxBorder}` }}>
        <Icon size={26} style={{ color: t.textMuted }} />
      </motion.div>
      <p className="font-bold text-sm" style={{ color: t.textMuted }}>{msg}</p>
    </div>
  );
}

/* ─── Section Title ─── */
function StepTitle({ icon: Icon, title, sub, t }: { icon: React.ElementType; title: string; sub?: string; t: typeof TH.light }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.05 }}
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 4px 14px rgba(123,47,190,0.45)" }}>
        <Icon size={18} className="text-white" />
      </motion.div>
      <div>
        <motion.h2 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
          className="font-black text-xl" style={{ color: t.text }}>{title}</motion.h2>
        {sub && <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ══════════════ MAIN ══════════════ */
export default function StudyModeSetup() {
  const [, navigate] = useLocation();
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || "light");
  const [step, setStep]   = useState(0);
  const [dir, setDir]     = useState(1);

  const [lockedIn, setLockedIn]       = useState(false);
  const [lockedLabel, setLockedLabel] = useState("");
  const [stepFlash, setStepFlash]     = useState(false);
  const [nextStepNum, setNextStepNum] = useState(0);

  const [gender, setGender]       = useState<"male" | "female" | null>(null);
  const [gameName, setGameName]   = useState("");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");

  const [stages,   setStages]   = useState<Stage[]>([]);
  const [grades,   setGrades]   = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStage,   setSelectedStage]   = useState<Stage | null>(null);
  const [selectedGrade,   setSelectedGrade]   = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [term, setTerm]                       = useState<1 | 2 | null>(null);
  const [units, setUnits]                     = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit]       = useState<Unit | null>(null);
  const [lessons, setLessons]                 = useState<Lesson[]>([]);
  const [focusMode, setFocusMode]             = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [loading, setLoading]                 = useState(false);

  const isDark = theme === "dark";
  const t = TH[theme];

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  };

  useEffect(() => {
    fetch(`${API}/study/stages`).then(r => r.json()).then(d => setStages(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);
  useEffect(() => {
    if (!selectedStage) return;
    setLoading(true);
    fetch(`${API}/study/grades?stageId=${selectedStage.id}`).then(r => r.json())
      .then(d => { setGrades(Array.isArray(d) ? d : []); setSelectedGrade(null); setSelectedSubject(null); })
      .finally(() => setLoading(false));
  }, [selectedStage]);
  useEffect(() => {
    if (!selectedGrade) return;
    setLoading(true);
    fetch(`${API}/study/subjects?gradeId=${selectedGrade.id}`).then(r => r.json())
      .then(d => { setSubjects(Array.isArray(d) ? d : []); setSelectedSubject(null); })
      .finally(() => setLoading(false));
  }, [selectedGrade]);
  useEffect(() => {
    if (!selectedSubject || !term) return;
    setLoading(true);
    fetch(`${API}/study/units?subjectId=${selectedSubject.id}&term=${term}`).then(r => r.json())
      .then(d => { setUnits(Array.isArray(d) ? d : []); setSelectedUnit(null); })
      .finally(() => setLoading(false));
  }, [selectedSubject, term]);
  useEffect(() => {
    if (!selectedUnit) return;
    setLoading(true);
    fetch(`${API}/study/lessons?unitId=${selectedUnit.id}`).then(r => r.json())
      .then(d => { setLessons(Array.isArray(d) ? d : []); setSelectedLessons([]); })
      .finally(() => setLoading(false));
  }, [selectedUnit]);

  /* Auto-advance */
  const advance = useCallback((setter: () => void, label: string, toStep: number) => {
    setter();
    setLockedLabel(label);
    setLockedIn(true);
    setTimeout(() => {
      setLockedIn(false);
      setNextStepNum(toStep);
      setStepFlash(true);
      setTimeout(() => { setStepFlash(false); setDir(1); setStep(toStep); }, 480);
    }, 580);
  }, []);

  const canProceed = () => {
    if (step === 0) return !!gender && team1Name.trim().length > 0 && team2Name.trim().length > 0;
    if (step === 6) return !focusMode || selectedLessons.length > 0;
    return false;
  };

  const handleStart = async () => {
    if (!selectedSubject || !selectedUnit || !term || !gender) return;
    setLoading(true);
    try {
      const lp = focusMode && selectedLessons.length > 0 ? `&lessonIds=${selectedLessons.join(",")}` : "";
      const gp = selectedGrade ? `&gradeId=${selectedGrade.id}` : "";
      const res = await fetch(`${API}/study/questions?unitId=${selectedUnit.id}${gp}${lp}`);
      const questions = await res.json();
      if (!Array.isArray(questions) || questions.length === 0) { alert("لا توجد أسئلة."); setLoading(false); return; }
      localStorage.setItem("rakez-study-game", JSON.stringify({
        gameName: gameName.trim() || `${selectedSubject.name} — ${selectedUnit.name}`,
        gender, team1Name, team2Name, subject: selectedSubject, unit: selectedUnit,
        grade: selectedGrade, stage: selectedStage, term,
        questions: [...questions].sort(() => Math.random() - 0.5),
      }));
      localStorage.setItem("rakez-study-scores", JSON.stringify({ team1: 0, team2: 0 }));
      localStorage.setItem("rakez-study-index", "0");
      navigate("/study-game");
    } catch { alert("خطأ في التحميل."); }
    finally { setLoading(false); }
  };

  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const pageV = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit:  (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80, scale: 0.96 }),
  };

  return (
    <motion.div className="min-h-screen flex flex-col relative" dir="rtl"
      animate={{ background: t.bg }}
      transition={{ duration: 0.4 }}
      style={{ fontFamily: "'Lalezar','Cairo',sans-serif", backgroundImage: t.scanline }}>

      {/* Dark grid overlay */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
          style={{ backgroundImage: "linear-gradient(rgba(168,85,247,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,1) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
      )}

      <GameParticles dark={isDark} />
      <LockedIn show={lockedIn} label={lockedLabel} dark={isDark} />
      <StepFlash show={stepFlash} stepNum={nextStepNum} />

      {/* ── HUD ── */}
      <div className="flex-shrink-0 relative z-10 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6d28d9,#3a1060)", boxShadow: isDark ? "0 6px 40px rgba(109,40,217,0.8)" : "0 6px 32px rgba(109,40,217,0.55)" }}>

        {/* Shimmer */}
        <motion.div animate={{ x: ["-100%","200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-full pointer-events-none opacity-10"
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)" }} />

        <div className="relative px-4 pt-3 pb-1 flex items-center gap-3">
          <motion.button whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.08 }}
            onClick={() => step === 0 ? navigate("/") : goBack()}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <ChevronRight size={20} className="text-white" />
          </motion.button>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Sword size={13} className="text-white/60" />
              <span className="text-white font-black text-sm tracking-wide">وضع الدراسة</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={step} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-xs font-black tracking-widest mt-0.5" style={{ color: "rgba(192,132,252,0.9)" }}>
                {STEP_MISSIONS[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <motion.button whileTap={{ scale: 0.85 }} onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.12)" }}>
              {isDark ? <Sun size={14} className="text-yellow-300" /> : <Moon size={14} className="text-white" />}
            </motion.button>
            <motion.div key={step} initial={{ scale: 0.5 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }} dir="ltr"
              className="px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
              <span className="text-white font-black text-sm">{step + 1}</span>
              <span className="text-white/35 text-xs">/{STEP_MISSIONS.length}</span>
            </motion.div>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-1.5 py-2.5 px-4">
          {STEP_MISSIONS.map((_, i) => (
            <motion.div key={i}
              animate={i < step
                ? { background: "#a855f7", width: 20, height: 4, borderRadius: 2 }
                : i === step
                ? { background: "#ffffff", width: 28, height: 4, borderRadius: 2, boxShadow: "0 0 10px rgba(255,255,255,0.9)" }
                : { background: "rgba(255,255,255,0.2)", width: 6, height: 4, borderRadius: 2 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Fill bar */}
        <div className="h-[2px]" style={{ background: "rgba(255,255,255,0.07)" }}>
          <motion.div className="h-full"
            style={{ background: "linear-gradient(90deg,#c084fc,#7B2FBE,#c084fc)", backgroundSize: "200% 100%" }}
            animate={{ width: `${((step + 1) / STEP_MISSIONS.length) * 100}%`, backgroundPosition: ["0% 0%","100% 0%","0% 0%"] }}
            transition={{ width: { duration: 0.5, ease: [0.22,1,0.36,1] }, backgroundPosition: { duration: 2, repeat: Infinity } }} />
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait" custom={dir}>

            {/* STEP 0 */}
            {step === 0 && (
              <motion.div key="s0" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }} className="space-y-5">
                <StepTitle icon={Users} title="إعداد الفريقين" t={t} />
                <div>
                  <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: t.label }}>— جنس اللاعبين —</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["male","ذكر","Blue Team",Shield],["female","أنثى","Pink Team",Star]] as const).map(([g,label,tag,Ic]) => (
                      <NCard key={g} selected={gender === g} onClick={() => setGender(g)} t={t} dark={isDark}>
                        <div className="text-center py-1">
                          <ICircle Icon={Ic} active={gender === g} t={t} />
                          <div className="font-black text-lg mt-2" style={{ color: gender === g ? t.accent : t.text }}>{label}</div>
                          <div className="text-[10px] font-black tracking-wide mt-0.5" style={{ color: gender === g ? t.accentBright : t.textMuted }}>{tag}</div>
                        </div>
                      </NCard>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest mb-3" style={{ color: t.label }}>— أسماء الفريقين —</p>
                  <div className="space-y-2.5">
                    <GInput value={team1Name} onChange={setTeam1Name} placeholder="الفريق الأول" icon={Shield} t={t} />
                    <GInput value={team2Name} onChange={setTeam2Name} placeholder="الفريق الثاني" icon={Sword} t={t} />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest mb-2" style={{ color: t.label }}>— اسم الجلسة (اختياري) —</p>
                  <GInput value={gameName} onChange={setGameName} placeholder="مراجعة اختبار العلوم" icon={Zap} t={t} />
                </div>
              </motion.div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="s1" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
                <StepTitle icon={GraduationCap} title="اختر المرحلة" sub="ما هي منطقة معركتك؟" t={t} />
                {stages.length === 0 ? <Empty icon={School} msg="لا توجد مراحل" t={t} />
                  : <div className="grid grid-cols-1 gap-3">
                    {stages.map((s, i) => {
                      const SI = STAGE_ICONS[i] ?? BookOpen;
                      const sel = selectedStage?.id === s.id;
                      return (
                        <NCard key={s.id} selected={sel} fullWidth t={t} dark={isDark}
                          onClick={() => advance(() => setSelectedStage(s), `✓ ${s.name}`, 2)}>
                          <div className="flex items-center gap-4">
                            <ICircle Icon={SI} active={sel} t={t} />
                            <div className="flex-1">
                              <div className="font-black text-xl" style={{ color: sel ? t.accent : t.text }}>{s.name}</div>
                              <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? t.accentBright : t.textMuted }}>ZONE {i + 1}</div>
                            </div>
                            <ChevronLeft size={16} style={{ color: sel ? t.accent : t.textMuted }} />
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="s2" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
                <StepTitle icon={Star} title="اختر الصف" sub={selectedStage?.name} t={t} />
                {loading ? <Spinner t={t} /> : grades.length === 0 ? <Empty icon={GraduationCap} msg="لا توجد صفوف" t={t} />
                  : <div className="grid grid-cols-2 gap-3">
                    {grades.map(g => {
                      const sel = selectedGrade?.id === g.id;
                      return (
                        <NCard key={g.id} selected={sel} t={t} dark={isDark}
                          onClick={() => advance(() => setSelectedGrade(g), `✓ ${g.name}`, 3)}>
                          <div className="text-center py-2">
                            <motion.div
                              animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 16px rgba(123,47,190,0.6)", color: "white" }
                                           : { background: t.iconBg, boxShadow: "none", color: t.iconColor }}
                              className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-base">
                              {g.order}
                            </motion.div>
                            <div className="font-black text-sm" style={{ color: sel ? t.accent : t.text }}>{g.name}</div>
                            <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? t.accentBright : t.textMuted }}>LVL {g.order}</div>
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="s3" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
                <StepTitle icon={BookOpen} title="اختر المادة" sub={selectedGrade?.name} t={t} />
                {loading ? <Spinner t={t} /> : subjects.length === 0 ? <Empty icon={BookOpen} msg="لا توجد مواد" t={t} />
                  : <div className="grid grid-cols-2 gap-3">
                    {subjects.map((s, i) => {
                      const SubIcon = SUBJECT_ICONS[i % SUBJECT_ICONS.length];
                      const sel = selectedSubject?.id === s.id;
                      return (
                        <NCard key={s.id} selected={sel} t={t} dark={isDark}
                          onClick={() => advance(() => setSelectedSubject(s), `✓ ${s.name}`, 4)}>
                          <div className="text-center py-2">
                            <ICircle Icon={SubIcon} active={sel} t={t} />
                            <div className="font-black text-sm mt-2" style={{ color: sel ? t.accent : t.text }}>{s.name}</div>
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div key="s4" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
                <StepTitle icon={BookMarked} title="اختر الفصل" sub={selectedSubject?.name} t={t} />
                <div className="grid grid-cols-2 gap-4">
                  {([1, 2] as const).map(tm => {
                    const sel = term === tm;
                    return (
                      <NCard key={tm} selected={sel} t={t} dark={isDark}
                        onClick={() => advance(() => setTerm(tm), tm === 1 ? "✓ الفصل الأول" : "✓ الفصل الثاني", 5)}>
                        <div className="text-center py-3">
                          <motion.div
                            animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 18px rgba(123,47,190,0.6)" } : { background: t.iconBg, boxShadow: "none" }}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            {tm === 1 ? <Sun size={26} style={{ color: sel ? "white" : t.iconColor }} />
                                      : <Moon size={26} style={{ color: sel ? "white" : t.iconColor }} />}
                          </motion.div>
                          <div className="font-black text-lg" style={{ color: sel ? t.accent : t.text }}>
                            {tm === 1 ? "الفصل الأول" : "الفصل الثاني"}
                          </div>
                          <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? t.accentBright : t.textMuted }}>SEASON {tm}</div>
                        </div>
                      </NCard>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <motion.div key="s5" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
                <StepTitle icon={Layers} title="اختر الوحدة" sub={`${selectedSubject?.name} • ف${term}`} t={t} />
                {loading ? <Spinner t={t} /> : units.length === 0 ? <Empty icon={Package} msg="لا توجد وحدات" t={t} />
                  : <div className="space-y-2.5">
                    {units.map((u, i) => {
                      const sel = selectedUnit?.id === u.id;
                      return (
                        <NCard key={u.id} selected={sel} fullWidth t={t} dark={isDark}
                          onClick={() => advance(() => setSelectedUnit(u), `✓ ${u.name}`, 6)}>
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={sel
                                ? { background: "#7B2FBE", color: "white", boxShadow: "0 0 14px rgba(123,47,190,0.6)" }
                                : { background: t.numBadgeBg, color: t.numBadgeColor, boxShadow: "none" }}
                              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0">
                              {i + 1}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className="font-black text-base" style={{ color: sel ? t.accent : t.text }}>{u.name}</div>
                              <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? t.accentBright : t.textMuted }}>MISSION {i + 1}</div>
                            </div>
                            <ChevronLeft size={15} style={{ color: sel ? t.accent : t.textMuted, flexShrink: 0 }} />
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <motion.div key="s6" custom={dir} variants={pageV} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22,1,0.36,1] }}>
                <StepTitle icon={Target} title="خصّص التحدي" sub={selectedUnit?.name} t={t} />

                <motion.div onClick={() => setFocusMode(v => !v)} whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl border-2 mb-4 cursor-pointer flex items-center justify-between gap-3"
                  style={focusMode ? {
                    borderColor: t.cardSelBorder,
                    background: t.cardSelBg,
                    boxShadow: isDark ? "0 0 0 3px rgba(168,85,247,0.12),0 0 20px rgba(168,85,247,0.15)" : "0 0 0 3px rgba(123,47,190,0.1)",
                  } : { borderColor: t.cardBorder, background: t.cardBg }}>
                  <div className="flex items-center gap-3">
                    <motion.div animate={focusMode ? { background: "#7B2FBE", boxShadow: "0 0 12px rgba(123,47,190,0.5)" } : { background: t.iconBg, boxShadow: "none" }}
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target size={15} style={{ color: focusMode ? "white" : t.iconColor }} />
                    </motion.div>
                    <div>
                      <p className="font-black text-sm" style={{ color: t.text }}>وضع التركيز</p>
                      <p className="text-xs" style={{ color: t.textMuted }}>اختر دروساً محددة</p>
                    </div>
                  </div>
                  <motion.div animate={{ background: focusMode ? "#7B2FBE" : isDark ? "rgba(255,255,255,0.12)" : "#e5e7eb" }}
                    className="w-12 h-6 rounded-full flex items-center px-1 flex-shrink-0"
                    style={{ boxShadow: focusMode ? "0 0 10px rgba(123,47,190,0.5)" : "none" }}>
                    <motion.div animate={{ x: focusMode ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {focusMode && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
                      {loading ? <Spinner t={t} /> : lessons.length === 0 ? <Empty icon={FileText} msg="لا توجد دروس" t={t} />
                        : <>
                          <motion.button whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedLessons(selectedLessons.length === lessons.length ? [] : lessons.map(l => l.id))}
                            className="w-full py-2.5 rounded-xl text-sm font-black"
                            style={{ border: `2px dashed ${isDark ? "rgba(168,85,247,0.35)" : "rgba(123,47,190,0.25)"}`, color: t.accent, background: "transparent" }}>
                            {selectedLessons.length === lessons.length ? "إلغاء الكل" : "تحديد الكل"}
                          </motion.button>
                          {lessons.map(l => {
                            const sel = selectedLessons.includes(l.id);
                            return (
                              <motion.button key={l.id} whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedLessons(p => p.includes(l.id) ? p.filter(x => x !== l.id) : [...p, l.id])}
                                className="w-full p-3.5 rounded-xl border-2 text-right flex items-center gap-3"
                                style={sel ? { borderColor: t.cardSelBorder, background: t.cardSelBg } : { borderColor: t.cardBorder, background: t.cardBg }}>
                                <motion.div animate={{ background: sel ? "#7B2FBE" : "transparent", borderColor: sel ? "#7B2FBE" : t.textMuted }}
                                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0">
                                  {sel && <Check size={11} className="text-white" />}
                                </motion.div>
                                <span className="font-bold text-sm" style={{ color: sel ? t.accent : t.text }}>{l.name}</span>
                              </motion.button>
                            );
                          })}
                        </>}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!focusMode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: t.infoBoxBg, border: `2px solid ${t.infoBoxBorder}` }}>
                    <Zap size={16} style={{ color: t.accent, flexShrink: 0 }} />
                    <p className="text-sm font-black" style={{ color: t.accent }}>أسئلة عشوائية من كامل الوحدة</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-4 pb-6 pt-3 relative z-10"
        style={{ background: t.footerBg, boxShadow: t.footerShadow }}>
        {step === 0 ? (
          <motion.button onClick={() => canProceed() && (setDir(1), setStep(1))}
            disabled={!canProceed()} whileTap={canProceed() ? { scale: 0.95 } : {}}
            animate={canProceed() ? { boxShadow: ["0 6px 24px rgba(123,47,190,0.4)","0 6px 36px rgba(123,47,190,0.7)","0 6px 24px rgba(123,47,190,0.4)"] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
            style={canProceed()
              ? { background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", color: "white" }
              : { background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8", cursor: "not-allowed" }}>
            <span>التالي</span><ChevronLeft size={20} />
          </motion.button>
        ) : step === 6 ? (
          <motion.button onClick={handleStart} disabled={loading || !canProceed()}
            whileTap={!loading ? { scale: 0.94 } : {}}
            animate={!loading && canProceed()
              ? { boxShadow: ["0 8px 28px rgba(123,47,190,0.5)","0 8px 45px rgba(123,47,190,0.75)","0 8px 28px rgba(123,47,190,0.5)"] }
              : {}} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3"
            style={loading
              ? { background: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9", color: isDark ? "rgba(255,255,255,0.25)" : "#94a3b8" }
              : { background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", color: "white" }}>
            {loading
              ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Zap size={22} /><span>ابدأ التحدي!</span></>}
          </motion.button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.2,0.9,0.2], scale: [1,1.4,1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: t.accent }} />
            ))}
            <p className="text-xs font-black mx-2" style={{ color: t.textMuted }}>اختر للمتابعة تلقائياً</p>
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.2,0.9,0.2], scale: [1,1.4,1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 + 0.6 }}
                className="w-1.5 h-1.5 rounded-full" style={{ background: t.accent }} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
