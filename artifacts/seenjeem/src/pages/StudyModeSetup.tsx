import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ChevronLeft, BookOpen, Layers, BookMarked, Target, Check,
  GraduationCap, Users, Zap, Sword, Shield, ChevronRight,
  Star, Sprout, Flame, Sun, Moon, Calculator, FlaskConical,
  Globe, Palette, Activity, Monitor, Music, School,
  Package, FileText, TrendingUp, Award,
} from "lucide-react";

const API = "/api";

type Stage   = { id: number; name: string; order: number };
type Grade   = { id: number; stageId: number; name: string; order: number };
type Subject = { id: number; gradeId: number | null; name: string };
type Unit    = { id: number; name: string; subjectId: number; term: number };
type Lesson  = { id: number; name: string; unitId: number };

const STEP_LABELS = ["الفريق", "المرحلة", "الصف", "المادة", "الفصل", "الوحدة", "الدروس"];
const STEP_SUBTITLES = [
  "اختر لاعبيك وسمّ فريقيك",
  "اختر منطقة المعركة",
  "حدّد مستوى التحدي",
  "اختر ساحة القتال",
  "حدّد موسم المعركة",
  "اختر مهمتك",
  "خصّص التحدي",
];
const SUBJECT_ICONS = [Calculator, FlaskConical, Globe, BookOpen, Palette, Activity, Monitor, Music];
const STAGE_ICONS   = [Sprout, Flame, Zap, TrendingUp, Award];

/* ─── Neon Glow Card ─── */
function NeonCard({
  selected, onClick, children, fullWidth = false, disabled = false,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
  fullWidth?: boolean; disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileTap={!disabled ? { scale: 0.94 } : {}}
      whileHover={!disabled && !selected ? { scale: 1.03, y: -3 } : {}}
      animate={selected ? { scale: [1, 1.05, 1] } : { scale: 1 }}
      transition={selected ? { duration: 0.3 } : { type: "spring", stiffness: 400, damping: 20 }}
      className={`relative rounded-2xl border-2 transition-colors overflow-hidden ${fullWidth ? "w-full" : ""} p-4`}
      style={selected ? {
        borderColor: "#7B2FBE",
        background: "linear-gradient(135deg, rgba(123,47,190,0.13) 0%, rgba(123,47,190,0.05) 100%)",
        boxShadow: "0 0 0 3px rgba(123,47,190,0.2), 0 0 24px rgba(123,47,190,0.3), inset 0 1px 0 rgba(255,255,255,0.8)",
      } : {
        borderColor: "rgba(0,0,0,0.08)",
        background: "white",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}
    >
      {selected && (
        <>
          {/* Corner glow */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(123,47,190,0.12) 0%, transparent 70%)" }}
          />
          {/* Check badge */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
            style={{ background: "#7B2FBE", boxShadow: "0 0 8px rgba(123,47,190,0.6)" }}
          >
            <Check size={11} className="text-white" />
          </motion.div>
        </>
      )}
      {children}
    </motion.button>
  );
}

/* ─── Step Progress Bar ─── */
function StepBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 py-3 px-4">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <motion.div
            animate={i < step
              ? { background: "#7B2FBE", width: 8, height: 8 }
              : i === step
              ? { background: "#a855f7", width: 10, height: 10, boxShadow: "0 0 8px rgba(168,85,247,0.8)" }
              : { background: "rgba(255,255,255,0.25)", width: 6, height: 6 }}
            className="rounded-full flex-shrink-0"
          />
          {i < total - 1 && (
            <motion.div
              animate={{ background: i < step ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)" }}
              className="w-3 h-px rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Spinner ─── */
const Spinner = () => (
  <div className="flex flex-col items-center py-16 gap-3">
    <div className="relative w-10 h-10">
      <div className="w-10 h-10 border-3 border-[#7B2FBE]/15 rounded-full absolute" />
      <div className="w-10 h-10 border-3 border-transparent border-t-[#7B2FBE] rounded-full animate-spin absolute" />
    </div>
    <p className="text-xs font-bold text-gray-400">جاري التحميل...</p>
  </div>
);

/* ─── Empty ─── */
const Empty = ({ icon: Icon, msg }: { icon: React.ElementType; msg: string }) => (
  <div className="flex flex-col items-center py-16 gap-3">
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{ background: "rgba(123,47,190,0.06)", border: "2px solid rgba(123,47,190,0.1)" }}>
      <Icon size={28} style={{ color: "rgba(123,47,190,0.3)" }} />
    </div>
    <p className="font-bold text-sm text-gray-400">{msg}</p>
    <p className="text-xs text-gray-300">أضف بيانات من لوحة التحكم</p>
  </div>
);

/* ─── Section Header ─── */
function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mb-6"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 4px 12px rgba(123,47,190,0.4)" }}
      >
        <Icon size={18} className="text-white" />
      </motion.div>
      <div>
        <h2 className="font-black text-gray-900 text-xl leading-tight">{title}</h2>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

/* ─── Game Input ─── */
function GInput({ value, onChange, placeholder, icon: Icon }: {
  value: string; onChange: (v: string) => void; placeholder: string; icon: React.ElementType;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      <div className="absolute right-3 z-10 flex-shrink-0 pointer-events-none"
        style={{ color: focused ? "#7B2FBE" : "#9ca3af" }}>
        <Icon size={15} />
      </div>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pr-9 pl-4 py-3.5 rounded-xl font-bold text-sm text-gray-800 bg-white focus:outline-none transition-all"
        style={{
          border: `2px solid ${focused ? "#7B2FBE" : "rgba(0,0,0,0.09)"}`,
          boxShadow: focused ? "0 0 0 3px rgba(123,47,190,0.12), 0 2px 8px rgba(123,47,190,0.08)" : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      />
    </div>
  );
}

/* ══════════════ MAIN ══════════════ */
export default function StudyModeSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [advancing, setAdvancing] = useState(false);

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

  const [term, setTerm]                     = useState<1 | 2 | null>(null);
  const [units, setUnits]                   = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit]     = useState<Unit | null>(null);
  const [lessons, setLessons]               = useState<Lesson[]>([]);
  const [focusMode, setFocusMode]           = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [loading, setLoading]               = useState(false);

  useEffect(() => {
    fetch(`${API}/study/stages`).then(r => r.json())
      .then(d => setStages(Array.isArray(d) ? d : [])).catch(() => {});
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

  /* Auto-advance: select + wait 380ms then go next */
  const autoAdvance = useCallback((setter: () => void, nextStep: number) => {
    setter();
    setAdvancing(true);
    setTimeout(() => { setStep(nextStep); setAdvancing(false); }, 380);
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
      const lessonParam = focusMode && selectedLessons.length > 0 ? `&lessonIds=${selectedLessons.join(",")}` : "";
      const gradeParam  = selectedGrade ? `&gradeId=${selectedGrade.id}` : "";
      const res = await fetch(`${API}/study/questions?unitId=${selectedUnit.id}${gradeParam}${lessonParam}`);
      const questions = await res.json();
      if (!Array.isArray(questions) || questions.length === 0) {
        alert("لا توجد أسئلة في هذه الوحدة."); setLoading(false); return;
      }
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

  const toggleLesson = (id: number) =>
    setSelectedLessons(p => p.includes(id) ? p.filter(l => l !== id) : [...p, id]);

  const slideVariants = {
    enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60, scale: 0.97 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60, scale: 0.97 }),
  };
  const [dir, setDir] = useState(1);
  const goTo = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl"
      style={{ fontFamily: "'Lalezar', 'Cairo', sans-serif" }}>

      {/* ── HUD Header ── */}
      <div className="flex-shrink-0 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#7B2FBE 0%,#3a1060 100%)", boxShadow: "0 6px 30px rgba(123,47,190,0.55)" }}>

        {/* Animated orbs */}
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #c084fc, transparent)", transform: "translate(30%, -30%)" }}
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-24 h-24 rounded-full pointer-events-none opacity-10"
          style={{ background: "radial-gradient(circle, #a855f7, transparent)", transform: "translate(-20%, 20%)" }}
        />

        <div className="relative px-4 pt-3 pb-1 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => step === 0 ? navigate("/") : goTo(step - 1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            <ChevronRight size={20} className="text-white" />
          </motion.button>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Sword size={13} className="text-white/70" />
              <span className="text-white font-black text-sm tracking-wide">وضع الدراسة</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={step}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="text-white/55 text-xs mt-0.5">
                {STEP_SUBTITLES[step]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Step badge */}
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ duration: 0.35, delay: 0.1 }}
            key={step}
            dir="ltr"
            className="flex-shrink-0 px-2.5 py-1 rounded-lg flex items-center gap-0.5"
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <span className="text-white font-black text-sm">{step + 1}</span>
            <span className="text-white/40 text-xs font-bold">/{STEP_LABELS.length}</span>
          </motion.div>
        </div>

        <StepBar step={step} total={STEP_LABELS.length} />

        {/* Progress fill bar */}
        <div className="h-[3px]" style={{ background: "rgba(255,255,255,0.08)" }}>
          <motion.div
            className="h-full"
            style={{ background: "linear-gradient(90deg, #c084fc, #7B2FBE)" }}
            animate={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* ── Flash on step change ── */}
      <AnimatePresence>
        {advancing && (
          <motion.div
            initial={{ opacity: 0.3 }} animate={{ opacity: 0 }} transition={{ duration: 0.4 }}
            className="fixed inset-0 z-30 pointer-events-none"
            style={{ background: "rgba(123,47,190,0.15)" }}
          />
        )}
      </AnimatePresence>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait" custom={dir}>
            
            {/* ══ STEP 0 ══ */}
            {step === 0 && (
              <motion.div key="s0" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5"
              >
                <SectionHeader icon={Users} title="إعداد الفريقين" sub="اختر لاعبيك وسمّ الفريقين" />

                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">جنس اللاعبين</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["male",   "ذكر",  "Blue Team",  Shield],
                      ["female", "أنثى", "Pink Team",  Star  ],
                    ] as const).map(([g, label, tag, Ic]) => (
                      <NeonCard key={g} selected={gender === g} onClick={() => setGender(g)}>
                        <div className="text-center py-2">
                          <motion.div
                            animate={gender === g ? { background: "#7B2FBE", boxShadow: "0 0 14px rgba(123,47,190,0.5)" } : { background: "#f3f4f6", boxShadow: "none" }}
                            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                          >
                            <Ic size={20} className={gender === g ? "text-white" : "text-gray-400"} />
                          </motion.div>
                          <div className={`font-black text-lg ${gender === g ? "text-[#7B2FBE]" : "text-gray-800"}`}>{label}</div>
                          <div className="text-[10px] font-bold mt-0.5" style={{ color: gender === g ? "#a855f7" : "#9ca3af" }}>{tag}</div>
                        </div>
                      </NeonCard>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">أسماء الفريقين</p>
                  <div className="space-y-2.5">
                    <GInput value={team1Name} onChange={setTeam1Name} placeholder="الفريق الأول" icon={Shield} />
                    <GInput value={team2Name} onChange={setTeam2Name} placeholder="الفريق الثاني" icon={Sword} />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">
                    اسم الجلسة <span className="normal-case font-normal">(اختياري)</span>
                  </p>
                  <GInput value={gameName} onChange={setGameName} placeholder="مثال: مراجعة اختبار العلوم" icon={Zap} />
                </div>
              </motion.div>
            )}

            {/* ══ STEP 1 — STAGE ══ */}
            {step === 1 && (
              <motion.div key="s1" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader icon={GraduationCap} title="اختر المرحلة" sub="ما هي منطقة معركتك؟" />
                {stages.length === 0 ? <Empty icon={School} msg="لا توجد مراحل دراسية" />
                  : (
                    <div className="grid grid-cols-1 gap-3">
                      {stages.map((s, i) => {
                        const SI = STAGE_ICONS[i] ?? BookOpen;
                        const sel = selectedStage?.id === s.id;
                        return (
                          <NeonCard key={s.id} selected={sel} fullWidth
                            onClick={() => autoAdvance(() => setSelectedStage(s), 2)}>
                            <div className="flex items-center gap-4 py-1">
                              <motion.div
                                animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 16px rgba(123,47,190,0.55)" } : { background: "#f3f4f6", boxShadow: "none" }}
                                className="w-13 h-13 rounded-xl flex items-center justify-center flex-shrink-0 w-12 h-12"
                              >
                                <SI size={22} className={sel ? "text-white" : "text-gray-500"} />
                              </motion.div>
                              <div className="flex-1 text-right">
                                <div className={`font-black text-xl leading-tight ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{s.name}</div>
                                <div className="text-xs font-bold mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>Zone {i + 1}</div>
                              </div>
                              <ChevronLeft size={16} style={{ color: sel ? "#7B2FBE" : "#d1d5db", flexShrink: 0 }} />
                            </div>
                          </NeonCard>
                        );
                      })}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 2 — GRADE ══ */}
            {step === 2 && (
              <motion.div key="s2" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader icon={Star} title="اختر الصف" sub={selectedStage?.name} />
                {loading ? <Spinner /> : grades.length === 0 ? <Empty icon={GraduationCap} msg="لا توجد صفوف لهذه المرحلة" />
                  : (
                    <div className="grid grid-cols-2 gap-3">
                      {grades.map(g => {
                        const sel = selectedGrade?.id === g.id;
                        return (
                          <NeonCard key={g.id} selected={sel}
                            onClick={() => autoAdvance(() => setSelectedGrade(g), 3)}>
                            <div className="text-center py-2">
                              <motion.div
                                animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 14px rgba(123,47,190,0.5)" } : { background: "#f3f4f6", boxShadow: "none" }}
                                className="w-11 h-11 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-base"
                                style={{ color: sel ? "white" : "#6b7280" }}
                              >
                                {g.order}
                              </motion.div>
                              <div className={`font-black text-base leading-tight ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{g.name}</div>
                              <div className="text-[10px] font-bold mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>Level {g.order}</div>
                            </div>
                          </NeonCard>
                        );
                      })}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 3 — SUBJECT ══ */}
            {step === 3 && (
              <motion.div key="s3" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader icon={BookOpen} title="اختر المادة" sub={selectedGrade?.name} />
                {loading ? <Spinner /> : subjects.length === 0 ? <Empty icon={BookOpen} msg="لا توجد مواد لهذا الصف" />
                  : (
                    <div className="grid grid-cols-2 gap-3">
                      {subjects.map((s, i) => {
                        const SubIcon = SUBJECT_ICONS[i % SUBJECT_ICONS.length];
                        const sel = selectedSubject?.id === s.id;
                        return (
                          <NeonCard key={s.id} selected={sel}
                            onClick={() => autoAdvance(() => setSelectedSubject(s), 4)}>
                            <div className="text-center py-2">
                              <motion.div
                                animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 14px rgba(123,47,190,0.5)" } : { background: "#f3f4f6", boxShadow: "none" }}
                                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2"
                              >
                                <SubIcon size={22} className={sel ? "text-white" : "text-gray-500"} />
                              </motion.div>
                              <div className={`font-black text-sm leading-tight ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{s.name}</div>
                            </div>
                          </NeonCard>
                        );
                      })}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 4 — TERM ══ */}
            {step === 4 && (
              <motion.div key="s4" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader icon={BookMarked} title="اختر الفصل" sub={selectedSubject?.name} />
                <div className="grid grid-cols-2 gap-4">
                  {([1, 2] as const).map(t => {
                    const sel = term === t;
                    return (
                      <NeonCard key={t} selected={sel}
                        onClick={() => autoAdvance(() => setTerm(t), 5)}>
                        <div className="text-center py-3">
                          <motion.div
                            animate={sel ? { background: "#7B2FBE", boxShadow: "0 0 16px rgba(123,47,190,0.5)" } : { background: "#f3f4f6", boxShadow: "none" }}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                          >
                            {t === 1
                              ? <Sun size={26} className={sel ? "text-white" : "text-gray-500"} />
                              : <Moon size={26} className={sel ? "text-white" : "text-gray-500"} />}
                          </motion.div>
                          <div className={`font-black text-lg ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>
                            {t === 1 ? "الفصل الأول" : "الفصل الثاني"}
                          </div>
                          <div className="text-[11px] font-bold mt-0.5" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>Season {t}</div>
                        </div>
                      </NeonCard>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ══ STEP 5 — UNIT ══ */}
            {step === 5 && (
              <motion.div key="s5" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader icon={Layers} title="اختر الوحدة" sub={`${selectedSubject?.name} • ف${term}`} />
                {loading ? <Spinner /> : units.length === 0 ? <Empty icon={Package} msg="لا توجد وحدات لهذا الفصل" />
                  : (
                    <div className="space-y-2.5">
                      {units.map((u, i) => {
                        const sel = selectedUnit?.id === u.id;
                        return (
                          <NeonCard key={u.id} selected={sel} fullWidth
                            onClick={() => autoAdvance(() => setSelectedUnit(u), 6)}>
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={sel ? { background: "#7B2FBE", color: "white", boxShadow: "0 0 12px rgba(123,47,190,0.5)" } : { background: "rgba(123,47,190,0.08)", color: "#7B2FBE", boxShadow: "none" }}
                                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-base"
                              >
                                {i + 1}
                              </motion.div>
                              <div className="flex-1 min-w-0 text-right">
                                <div className={`font-black text-base leading-tight ${sel ? "text-[#7B2FBE]" : "text-gray-900"}`}>{u.name}</div>
                                <div className="text-[11px] font-bold" style={{ color: sel ? "#a855f7" : "#9ca3af" }}>Mission {i + 1}</div>
                              </div>
                              <ChevronLeft size={15} style={{ color: sel ? "#7B2FBE" : "#d1d5db", flexShrink: 0 }} />
                            </div>
                          </NeonCard>
                        );
                      })}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 6 — LESSONS ══ */}
            {step === 6 && (
              <motion.div key="s6" custom={dir}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <SectionHeader icon={Target} title="خصّص التحدي" sub={selectedUnit?.name} />

                {/* Focus toggle */}
                <motion.div
                  onClick={() => setFocusMode(v => !v)}
                  whileTap={{ scale: 0.98 }}
                  className="p-4 rounded-2xl border-2 mb-4 cursor-pointer flex items-center justify-between gap-3"
                  style={focusMode ? {
                    borderColor: "#7B2FBE",
                    background: "rgba(123,47,190,0.06)",
                    boxShadow: "0 0 0 3px rgba(123,47,190,0.1), 0 0 16px rgba(123,47,190,0.1)",
                  } : { borderColor: "rgba(0,0,0,0.08)", background: "white" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: focusMode ? "rgba(123,47,190,0.15)" : "#f3f4f6" }}>
                      <Target size={14} style={{ color: focusMode ? "#7B2FBE" : "#9ca3af" }} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm">وضع التركيز</p>
                      <p className="text-xs text-gray-400">اختر دروساً محددة فقط</p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ background: focusMode ? "#7B2FBE" : "#e5e7eb" }}
                    className="w-12 h-6 rounded-full flex items-center px-1 flex-shrink-0"
                    style={{ boxShadow: focusMode ? "0 0 8px rgba(123,47,190,0.4)" : "none" }}
                  >
                    <motion.div animate={{ x: focusMode ? 24 : 0 }} className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {focusMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2"
                    >
                      {loading ? <Spinner /> : lessons.length === 0
                        ? <Empty icon={FileText} msg="لا توجد دروس لهذه الوحدة" />
                        : (
                          <>
                            <motion.button
                              whileTap={{ scale: 0.97 }}
                              onClick={() => setSelectedLessons(selectedLessons.length === lessons.length ? [] : lessons.map(l => l.id))}
                              className="w-full py-2.5 rounded-xl text-sm font-black transition-all"
                              style={{ border: "2px dashed rgba(123,47,190,0.3)", color: "#7B2FBE" }}>
                              {selectedLessons.length === lessons.length ? "إلغاء الكل" : "تحديد الكل"}
                            </motion.button>
                            {lessons.map(l => {
                              const sel = selectedLessons.includes(l.id);
                              return (
                                <motion.button key={l.id} whileTap={{ scale: 0.97 }}
                                  onClick={() => toggleLesson(l.id)}
                                  className="w-full p-3.5 rounded-xl border-2 text-right flex items-center gap-3 transition-all"
                                  style={sel ? {
                                    borderColor: "#7B2FBE", background: "rgba(123,47,190,0.06)",
                                    boxShadow: "0 0 0 2px rgba(123,47,190,0.1)",
                                  } : { borderColor: "rgba(0,0,0,0.08)", background: "white" }}>
                                  <motion.div
                                    animate={{ background: sel ? "#7B2FBE" : "white", borderColor: sel ? "#7B2FBE" : "#d1d5db", boxShadow: sel ? "0 0 8px rgba(123,47,190,0.4)" : "none" }}
                                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0"
                                  >
                                    {sel && <Check size={11} className="text-white" />}
                                  </motion.div>
                                  <span className={`font-bold text-sm ${sel ? "text-[#7B2FBE]" : "text-gray-700"}`}>{l.name}</span>
                                </motion.button>
                              );
                            })}
                          </>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!focusMode && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: "rgba(123,47,190,0.05)", border: "2px solid rgba(123,47,190,0.12)" }}>
                    <Zap size={16} style={{ color: "#7B2FBE", flexShrink: 0 }} />
                    <p className="text-sm font-black" style={{ color: "#7B2FBE" }}>أسئلة عشوائية من كامل الوحدة</p>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── Action Footer ── */}
      <div className="flex-shrink-0 px-4 pb-safe pb-5 pt-3 bg-white"
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
        {step === 0 ? (
          <motion.button
            onClick={() => canProceed() && goTo(1)}
            disabled={!canProceed()}
            whileTap={canProceed() ? { scale: 0.96 } : {}}
            whileHover={canProceed() ? { scale: 1.02 } : {}}
            animate={canProceed() ? { boxShadow: ["0 6px 24px rgba(123,47,190,0.4)", "0 6px 32px rgba(123,47,190,0.65)", "0 6px 24px rgba(123,47,190,0.4)"] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-colors"
            style={canProceed() ? {
              background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
              color: "white",
            } : {
              background: "#f1f5f9",
              color: "#94a3b8",
              cursor: "not-allowed",
            }}
          >
            <span>التالي</span>
            <ChevronLeft size={20} />
          </motion.button>
        ) : step === 6 ? (
          <motion.button
            onClick={handleStart}
            disabled={loading || !canProceed()}
            whileTap={!loading ? { scale: 0.95 } : {}}
            animate={!loading && canProceed() ? { boxShadow: ["0 8px 28px rgba(123,47,190,0.45)", "0 8px 40px rgba(123,47,190,0.7)", "0 8px 28px rgba(123,47,190,0.45)"] } : {}}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-colors"
            style={loading ? { background: "#f1f5f9", color: "#94a3b8" } : {
              background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
              color: "white",
            }}
          >
            {loading
              ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Zap size={22} /><span>ابدأ التحدي!</span></>}
          </motion.button>
        ) : (
          /* For steps 1-5: show a ghost "back" button — selection auto-advances */
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-1 h-1 rounded-full bg-[#7B2FBE]/30" />
            <p className="text-xs font-bold text-gray-400">اختر من الخيارات أعلاه للمتابعة تلقائياً</p>
            <div className="w-1 h-1 rounded-full bg-[#7B2FBE]/30" />
          </div>
        )}
      </div>
    </div>
  );
}
