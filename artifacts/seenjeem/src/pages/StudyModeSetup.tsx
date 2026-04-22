import { useState, useEffect, useCallback, useRef } from "react";
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
type Stage   = { id: number; name: string; order: number };
type Grade   = { id: number; stageId: number; name: string; order: number };
type Subject = { id: number; gradeId: number | null; name: string };
type Unit    = { id: number; name: string; subjectId: number; term: number };
type Lesson  = { id: number; name: string; unitId: number };

const STEP_LABELS    = ["الفريق", "المرحلة", "الصف", "المادة", "الفصل", "الوحدة", "الدروس"];
const STEP_MISSIONS  = ["TEAM SETUP", "SELECT ZONE", "CHOOSE LEVEL", "PICK SUBJECT", "CHOOSE SEASON", "SELECT MISSION", "CUSTOMIZE"];
const SUBJECT_ICONS  = [Calculator, FlaskConical, Globe, BookOpen, Palette, Activity, Monitor, Music];
const STAGE_ICONS    = [Sprout, Flame, Zap, TrendingUp];

/* ── Lightweight CSS Particles ── */
const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: `${10 + i * 11}%`,
  size: 4 + (i % 3) * 3,
  duration: 6 + i * 1.4,
  delay: i * 0.9,
}));

function GameParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {PARTICLES.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: p.left, bottom: -20, width: p.size, height: p.size, background: "rgba(123,47,190,0.18)" }}
          animate={{ y: [0, -window.innerHeight - 40], opacity: [0, 0.7, 0.5, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ── "LOCKED IN!" Confirmation Overlay ── */
function LockedInOverlay({ show, label }: { show: boolean; label: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.4, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="text-center"
          >
            <div className="px-10 py-6 rounded-3xl text-white font-black"
              style={{
                background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                boxShadow: "0 0 60px rgba(123,47,190,0.7), 0 20px 60px rgba(0,0,0,0.3)",
                fontSize: 36,
                letterSpacing: "0.05em",
              }}>
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 0.3, repeat: 1 }}
              >
                {label}
              </motion.div>
            </div>
            {/* Radiating rings */}
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                className="absolute inset-0 rounded-3xl border-2 border-[#a855f7]"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.8 + i * 0.5, opacity: 0 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Step Flash Overlay ── */
function StepFlash({ show, stepNum }: { show: boolean; stepNum: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(74,26,126,0.45)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-white/40 text-xs font-black tracking-[0.3em] text-center mb-1">
              STAGE {stepNum} OF {STEP_LABELS.length}
            </p>
            <p className="text-white font-black tracking-[0.2em] text-center" style={{ fontSize: 28 }}>
              {STEP_MISSIONS[stepNum - 1]}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Neon Card ── */
function NCard({
  selected, onClick, children, fullWidth = false,
}: { selected: boolean; onClick: () => void; children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      whileHover={!selected ? { scale: 1.03, y: -3 } : {}}
      className={`relative rounded-2xl border-2 overflow-hidden text-right ${fullWidth ? "w-full" : ""}`}
      style={selected ? {
        borderColor: "#7B2FBE",
        background: "linear-gradient(135deg,rgba(123,47,190,0.14),rgba(123,47,190,0.04))",
        boxShadow: "0 0 0 3px rgba(123,47,190,0.25), 0 0 30px rgba(123,47,190,0.3), inset 0 1px 0 rgba(255,255,255,0.6)",
      } : {
        borderColor: "rgba(0,0,0,0.08)",
        background: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {/* Top neon line on selected */}
      {selected && (
        <motion.div layoutId="neon-line"
          className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #a855f7, #7B2FBE, #a855f7, transparent)" }}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
      {/* Check */}
      {selected && (
        <motion.div
          initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 600, damping: 18 }}
          className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
          style={{ background: "#7B2FBE", boxShadow: "0 0 10px rgba(123,47,190,0.7)" }}
        >
          <Check size={11} className="text-white" />
        </motion.div>
      )}
      <div className="p-4">{children}</div>
    </motion.button>
  );
}

/* ── Game Input ── */
function GInput({ value, onChange, placeholder, icon: Icon }: {
  value: string; onChange: (v: string) => void; placeholder: string; icon: React.ElementType;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: focused ? "#7B2FBE" : "#9ca3af" }}>
        <Icon size={15} />
      </div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="w-full pr-9 pl-4 py-3.5 rounded-xl font-bold text-sm text-gray-800 bg-white focus:outline-none"
        style={{
          border: `2px solid ${focused ? "#7B2FBE" : "rgba(0,0,0,0.08)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(123,47,190,0.12)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      />
    </div>
  );
}

/* ── Spinner ── */
const Spinner = () => (
  <div className="flex flex-col items-center py-14 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 border-3 border-[#7B2FBE]/10 rounded-full" />
      <div className="w-12 h-12 border-3 border-transparent border-t-[#7B2FBE] rounded-full animate-spin absolute inset-0" />
      <div className="w-6 h-6 border-2 border-transparent border-t-purple-400 rounded-full animate-spin absolute top-3 left-3" style={{ animationDirection: "reverse" }} />
    </div>
    <p className="text-xs font-black tracking-widest" style={{ color: "#7B2FBE" }}>LOADING...</p>
  </div>
);

/* ── Empty ── */
const Empty = ({ icon: Icon, msg }: { icon: React.ElementType; msg: string }) => (
  <div className="flex flex-col items-center py-14 gap-3">
    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: "rgba(123,47,190,0.06)", border: "2px solid rgba(123,47,190,0.1)" }}>
      <Icon size={26} style={{ color: "rgba(123,47,190,0.3)" }} />
    </motion.div>
    <p className="font-bold text-sm text-gray-400">{msg}</p>
  </div>
);

/* ── Section Title ── */
function StepTitle({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 16, delay: 0.05 }}
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 4px 14px rgba(123,47,190,0.45)" }}>
        <Icon size={18} className="text-white" />
      </motion.div>
      <div>
        <motion.h2 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}
          className="font-black text-gray-900 text-xl">{title}</motion.h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ══════════════════ MAIN ══════════════════ */
export default function StudyModeSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  /* overlays */
  const [lockedIn, setLockedIn]     = useState(false);
  const [lockedLabel, setLockedLabel] = useState("");
  const [stepFlash, setStepFlash]   = useState(false);
  const [nextStep, setNextStep]     = useState(0);

  /* data */
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

  /* Auto-advance with overlays */
  const advance = useCallback((setter: () => void, label: string, toStep: number) => {
    setter();
    setLockedLabel(label);
    setLockedIn(true);
    setTimeout(() => {
      setLockedIn(false);
      setNextStep(toStep);
      setStepFlash(true);
      setTimeout(() => {
        setStepFlash(false);
        setDir(1);
        setStep(toStep);
      }, 500);
    }, 600);
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

  const pageVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 80 : -80, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -80 : 80, scale: 0.96 }),
  };

  /* icon helper */
  const IconCircle = ({ Icon, active }: { Icon: React.ElementType; active: boolean }) => (
    <motion.div
      animate={active
        ? { background: "#7B2FBE", boxShadow: "0 0 18px rgba(123,47,190,0.6)" }
        : { background: "#f3f4f6", boxShadow: "none" }}
      className="rounded-xl flex items-center justify-center flex-shrink-0 w-12 h-12"
    >
      <Icon size={22} className={active ? "text-white" : "text-gray-500"} />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col relative" dir="rtl"
      style={{ fontFamily: "'Lalezar', 'Cairo', sans-serif" }}>

      <GameParticles />
      <LockedInOverlay show={lockedIn} label={lockedLabel} />
      <StepFlash show={stepFlash} stepNum={nextStep} />

      {/* ── HUD HEADER ── */}
      <div className="flex-shrink-0 relative z-10 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#6d28d9 0%,#3a1060 100%)", boxShadow: "0 6px 32px rgba(109,40,217,0.6)" }}>

        {/* Animated lines */}
        <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-full pointer-events-none opacity-10"
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)" }} />

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
              <motion.p key={step}
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="text-xs font-black tracking-widest mt-0.5"
                style={{ color: "rgba(168,85,247,0.9)" }}>
                {STEP_MISSIONS[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          <motion.div key={step} initial={{ scale: 0.5 }} animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
            dir="ltr"
            className="flex-shrink-0 px-2.5 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <span className="text-white font-black text-sm">{step + 1}</span>
            <span className="text-white/35 text-xs">/{STEP_LABELS.length}</span>
          </motion.div>
        </div>

        {/* Dot progress */}
        <div className="flex items-center justify-center gap-1.5 py-2.5 px-4">
          {STEP_LABELS.map((_, i) => (
            <motion.div key={i}
              animate={i < step
                ? { background: "#a855f7", width: 20, height: 4, borderRadius: 2 }
                : i === step
                ? { background: "#ffffff", width: 28, height: 4, borderRadius: 2, boxShadow: "0 0 8px rgba(255,255,255,0.8)" }
                : { background: "rgba(255,255,255,0.2)", width: 6, height: 4, borderRadius: 2 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Fill bar */}
        <div className="h-[2px]" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div className="h-full"
            style={{ background: "linear-gradient(90deg,#c084fc,#7B2FBE,#c084fc)", backgroundSize: "200% 100%" }}
            animate={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%`, backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"] }}
            transition={{ width: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, backgroundPosition: { duration: 2, repeat: Infinity } }}
          />
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait" custom={dir}>

            {/* STEP 0 */}
            {step === 0 && (
              <motion.div key="s0" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5">
                <StepTitle icon={Users} title="إعداد الفريقين" />

                <div>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">— جنس اللاعبين —</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["male","ذكر","Blue Team",Shield],["female","أنثى","Pink Team",Star]] as const).map(([g,label,tag,Ic]) => (
                      <NCard key={g} selected={gender === g} onClick={() => setGender(g)}>
                        <div className="text-center py-1">
                          <IconCircle Icon={Ic} active={gender === g} />
                          <div className={`font-black text-lg mt-2 ${gender === g ? "text-[#7B2FBE]" : "text-gray-800"}`}>{label}</div>
                          <div className="text-[10px] font-black tracking-wide mt-0.5" style={{ color: gender === g ? "#a855f7" : "#9ca3af" }}>{tag}</div>
                        </div>
                      </NCard>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 mb-3">— أسماء الفريقين —</p>
                  <div className="space-y-2.5">
                    <GInput value={team1Name} onChange={setTeam1Name} placeholder="الفريق الأول" icon={Shield} />
                    <GInput value={team2Name} onChange={setTeam2Name} placeholder="الفريق الثاني" icon={Sword} />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 mb-2">— اسم الجلسة (اختياري) —</p>
                  <GInput value={gameName} onChange={setGameName} placeholder="مراجعة اختبار العلوم" icon={Zap} />
                </div>
              </motion.div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <motion.div key="s1" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <StepTitle icon={GraduationCap} title="اختر المرحلة" sub="ما هي منطقة معركتك؟" />
                {stages.length === 0 ? <Empty icon={School} msg="لا توجد مراحل" />
                  : <div className="grid grid-cols-1 gap-3">
                    {stages.map((s, i) => {
                      const SI = STAGE_ICONS[i] ?? BookOpen;
                      const sel = selectedStage?.id === s.id;
                      return (
                        <NCard key={s.id} selected={sel} fullWidth
                          onClick={() => advance(() => setSelectedStage(s), `✓ ${s.name}`, 2)}>
                          <div className="flex items-center gap-4">
                            <IconCircle Icon={SI} active={sel} />
                            <div className="flex-1">
                              <div className={`font-black text-xl ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{s.name}</div>
                              <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>ZONE {i + 1}</div>
                            </div>
                            <ChevronLeft size={16} style={{ color: sel ? "#7B2FBE" : "#d1d5db" }} />
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div key="s2" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <StepTitle icon={Star} title="اختر الصف" sub={selectedStage?.name} />
                {loading ? <Spinner /> : grades.length === 0 ? <Empty icon={GraduationCap} msg="لا توجد صفوف" />
                  : <div className="grid grid-cols-2 gap-3">
                    {grades.map(g => {
                      const sel = selectedGrade?.id === g.id;
                      return (
                        <NCard key={g.id} selected={sel}
                          onClick={() => advance(() => setSelectedGrade(g), `✓ ${g.name}`, 3)}>
                          <div className="text-center py-2">
                            <motion.div
                              animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 16px rgba(123,47,190,0.6)", color: "white" } : { background: "#f3f4f6", boxShadow: "none", color: "#6b7280" }}
                              className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-base">
                              {g.order}
                            </motion.div>
                            <div className={`font-black text-sm ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{g.name}</div>
                            <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>LVL {g.order}</div>
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div key="s3" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <StepTitle icon={BookOpen} title="اختر المادة" sub={selectedGrade?.name} />
                {loading ? <Spinner /> : subjects.length === 0 ? <Empty icon={BookOpen} msg="لا توجد مواد" />
                  : <div className="grid grid-cols-2 gap-3">
                    {subjects.map((s, i) => {
                      const SubIcon = SUBJECT_ICONS[i % SUBJECT_ICONS.length];
                      const sel = selectedSubject?.id === s.id;
                      return (
                        <NCard key={s.id} selected={sel}
                          onClick={() => advance(() => setSelectedSubject(s), `✓ ${s.name}`, 4)}>
                          <div className="text-center py-2">
                            <IconCircle Icon={SubIcon} active={sel} />
                            <div className={`font-black text-sm mt-2 ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{s.name}</div>
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <motion.div key="s4" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <StepTitle icon={BookMarked} title="اختر الفصل" sub={selectedSubject?.name} />
                <div className="grid grid-cols-2 gap-4">
                  {([1, 2] as const).map(t => {
                    const sel = term === t;
                    return (
                      <NCard key={t} selected={sel}
                        onClick={() => advance(() => setTerm(t), t === 1 ? "✓ الفصل الأول" : "✓ الفصل الثاني", 5)}>
                        <div className="text-center py-3">
                          <motion.div
                            animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 18px rgba(123,47,190,0.6)" } : { background: "#f3f4f6", boxShadow: "none" }}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            {t === 1 ? <Sun size={26} className={sel ? "text-white" : "text-gray-500"} />
                                     : <Moon size={26} className={sel ? "text-white" : "text-gray-500"} />}
                          </motion.div>
                          <div className={`font-black text-lg ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>
                            {t === 1 ? "الفصل الأول" : "الفصل الثاني"}
                          </div>
                          <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>SEASON {t}</div>
                        </div>
                      </NCard>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <motion.div key="s5" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <StepTitle icon={Layers} title="اختر الوحدة" sub={`${selectedSubject?.name} • ف${term}`} />
                {loading ? <Spinner /> : units.length === 0 ? <Empty icon={Package} msg="لا توجد وحدات" />
                  : <div className="space-y-2.5">
                    {units.map((u, i) => {
                      const sel = selectedUnit?.id === u.id;
                      return (
                        <NCard key={u.id} selected={sel} fullWidth
                          onClick={() => advance(() => setSelectedUnit(u), `✓ ${u.name}`, 6)}>
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={sel ? { background: "#7B2FBE", color: "white", boxShadow: "0 0 14px rgba(123,47,190,0.6)" } : { background: "rgba(123,47,190,0.08)", color: "#7B2FBE", boxShadow: "none" }}
                              className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0">
                              {i + 1}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-black text-base ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{u.name}</div>
                              <div className="text-[10px] font-black tracking-wider mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>MISSION {i + 1}</div>
                            </div>
                            <ChevronLeft size={15} style={{ color: sel ? "#7B2FBE" : "#d1d5db", flexShrink: 0 }} />
                          </div>
                        </NCard>
                      );
                    })}
                  </div>}
              </motion.div>
            )}

            {/* STEP 6 */}
            {step === 6 && (
              <motion.div key="s6" custom={dir} variants={pageVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                <StepTitle icon={Target} title="خصّص التحدي" sub={selectedUnit?.name} />

                <motion.div onClick={() => setFocusMode(v => !v)} whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl border-2 mb-4 cursor-pointer flex items-center justify-between gap-3"
                  style={focusMode ? {
                    borderColor: "#7B2FBE", background: "rgba(123,47,190,0.06)",
                    boxShadow: "0 0 0 3px rgba(123,47,190,0.12), 0 0 20px rgba(123,47,190,0.1)",
                  } : { borderColor: "rgba(0,0,0,0.08)", background: "white" }}>
                  <div className="flex items-center gap-3">
                    <motion.div animate={focusMode ? { background: "#7B2FBE", boxShadow: "0 0 12px rgba(123,47,190,0.5)" } : { background: "#f3f4f6", boxShadow: "none" }}
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Target size={15} className={focusMode ? "text-white" : "text-gray-500"} />
                    </motion.div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">وضع التركيز</p>
                      <p className="text-xs text-gray-400">اختر دروساً محددة</p>
                    </div>
                  </div>
                  <motion.div animate={{ background: focusMode ? "#7B2FBE" : "#e5e7eb" }}
                    className="w-12 h-6 rounded-full flex items-center px-1 flex-shrink-0"
                    style={{ boxShadow: focusMode ? "0 0 10px rgba(123,47,190,0.5)" : "none" }}>
                    <motion.div animate={{ x: focusMode ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {focusMode && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
                      {loading ? <Spinner /> : lessons.length === 0 ? <Empty icon={FileText} msg="لا توجد دروس" />
                        : <>
                          <motion.button whileTap={{ scale: 0.97 }}
                            onClick={() => setSelectedLessons(selectedLessons.length === lessons.length ? [] : lessons.map(l => l.id))}
                            className="w-full py-2.5 rounded-xl text-sm font-black"
                            style={{ border: "2px dashed rgba(123,47,190,0.3)", color: "#7B2FBE" }}>
                            {selectedLessons.length === lessons.length ? "إلغاء الكل" : "تحديد الكل"}
                          </motion.button>
                          {lessons.map(l => {
                            const sel = selectedLessons.includes(l.id);
                            return (
                              <motion.button key={l.id} whileTap={{ scale: 0.97 }}
                                onClick={() => setSelectedLessons(p => p.includes(l.id) ? p.filter(x => x !== l.id) : [...p, l.id])}
                                className="w-full p-3.5 rounded-xl border-2 text-right flex items-center gap-3"
                                style={sel ? { borderColor: "#7B2FBE", background: "rgba(123,47,190,0.06)", boxShadow: "0 0 0 2px rgba(123,47,190,0.1)" } : { borderColor: "rgba(0,0,0,0.08)", background: "white" }}>
                                <motion.div animate={{ background: sel ? "#7B2FBE" : "white", borderColor: sel ? "#7B2FBE" : "#d1d5db", boxShadow: sel ? "0 0 8px rgba(123,47,190,0.4)" : "none" }}
                                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0">
                                  {sel && <Check size={11} className="text-white" />}
                                </motion.div>
                                <span className={`font-bold text-sm ${sel ? "text-[#7B2FBE]" : "text-gray-700"}`}>{l.name}</span>
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
                    style={{ background: "rgba(123,47,190,0.05)", border: "2px solid rgba(123,47,190,0.12)" }}>
                    <Zap size={16} style={{ color: "#7B2FBE" }} />
                    <p className="text-sm font-black" style={{ color: "#7B2FBE" }}>أسئلة عشوائية من كامل الوحدة</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="flex-shrink-0 px-4 pb-6 pt-3 relative z-10 bg-white"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.05)" }}>

        {step === 0 ? (
          <motion.button onClick={() => canProceed() && (setDir(1), setStep(1))}
            disabled={!canProceed()}
            whileTap={canProceed() ? { scale: 0.95 } : {}}
            animate={canProceed() ? { boxShadow: ["0 6px 24px rgba(123,47,190,0.4)", "0 6px 36px rgba(123,47,190,0.7)", "0 6px 24px rgba(123,47,190,0.4)"] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2"
            style={canProceed() ? { background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", color: "white" } : { background: "#f1f5f9", color: "#94a3b8", cursor: "not-allowed" }}>
            <span>التالي</span><ChevronLeft size={20} />
          </motion.button>

        ) : step === 6 ? (
          <motion.button onClick={handleStart} disabled={loading || !canProceed()}
            whileTap={!loading ? { scale: 0.94 } : {}}
            animate={!loading && canProceed()
              ? { boxShadow: ["0 8px 28px rgba(123,47,190,0.5)", "0 8px 45px rgba(123,47,190,0.75)", "0 8px 28px rgba(123,47,190,0.5)"] }
              : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3"
            style={loading ? { background: "#f1f5f9", color: "#94a3b8" } : {
              background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", color: "white",
            }}>
            {loading
              ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Zap size={22} /><span>ابدأ التحدي!</span></>}
          </motion.button>

        ) : (
          <div className="flex items-center justify-center gap-2 py-1">
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                className="w-1.5 h-1.5 rounded-full bg-[#7B2FBE]" />
            ))}
            <p className="text-xs font-black text-gray-400 mx-2">اختر للمتابعة تلقائياً</p>
            {[0, 1, 2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 + 0.6 }}
                className="w-1.5 h-1.5 rounded-full bg-[#7B2FBE]" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
