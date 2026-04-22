import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ChevronLeft, BookOpen, Layers, BookMarked, Target,
  Check, GraduationCap, Users, Zap, Sword, Shield,
  ChevronRight, Star, Sprout, Flame, Sun, Moon,
  Calculator, FlaskConical, Globe, Palette, Activity,
  Monitor, Music, TrendingUp, School, Package, FileText,
  Award, Hash
} from "lucide-react";

const API = "/api";

type Stage   = { id: number; name: string; order: number };
type Grade   = { id: number; stageId: number; name: string; order: number };
type Subject = { id: number; gradeId: number | null; name: string };
type Unit    = { id: number; name: string; subjectId: number; term: number };
type Lesson  = { id: number; name: string; unitId: number };

const STEP_LABELS = ["الفريق", "المرحلة", "الصف", "المادة", "الفصل", "الوحدة", "الدروس"];

const SUBJECT_ICONS_CMP = [Calculator, FlaskConical, Globe, BookOpen, Palette, Activity, Monitor, Music];
const STAGE_ICONS_CMP   = [Sprout, Flame, Zap];

/* ── Gaming card button ── */
function GCard({
  selected, onClick, children, fullWidth = false, tall = false,
}: {
  selected: boolean; onClick: () => void; children: React.ReactNode;
  fullWidth?: boolean; tall?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={!selected ? { y: -2 } : {}}
      className={`relative rounded-2xl border-2 transition-all text-right overflow-hidden ${fullWidth ? "w-full" : ""} ${tall ? "py-7" : "p-4"}`}
      style={selected ? {
        borderColor: "#7B2FBE",
        background: "linear-gradient(135deg, rgba(123,47,190,0.12) 0%, rgba(123,47,190,0.04) 100%)",
        boxShadow: "0 0 0 3px rgba(123,47,190,0.18), 0 4px 20px rgba(123,47,190,0.2)",
      } : {
        borderColor: "rgba(0,0,0,0.1)",
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {selected && (
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute top-2 left-2 w-5 h-5 rounded-full flex items-center justify-center"
          style={{ background: "#7B2FBE" }}
        >
          <Check size={11} className="text-white" />
        </motion.div>
      )}
      {children}
    </motion.button>
  );
}

/* ── Step nodes progress ── */
function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1 py-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1">
          <motion.div
            animate={i < step ? { background: "#7B2FBE", scale: 1 }
              : i === step ? { background: "#7B2FBE", scale: 1.2 }
              : { background: "#e5e7eb", scale: 1 }}
            className="w-2 h-2 rounded-full"
            style={{ boxShadow: i === step ? "0 0 6px rgba(123,47,190,0.6)" : "none" }}
          />
          {i < total - 1 && (
            <motion.div
              animate={{ background: i < step ? "#7B2FBE" : "#e5e7eb" }}
              className="w-4 h-0.5 rounded-full"
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Loading spinner ── */
const Spinner = () => (
  <div className="flex justify-center py-14">
    <div className="w-8 h-8 border-3 border-[#7B2FBE]/20 border-t-[#7B2FBE] rounded-full animate-spin" />
  </div>
);

/* ── Empty state ── */
const Empty = ({ icon: Icon, msg }: { icon: React.ElementType; msg: string }) => (
  <div className="flex flex-col items-center py-14 text-gray-400 gap-2">
    <div className="opacity-30"><Icon size={44} /></div>
    <p className="font-bold text-sm">{msg}</p>
    <p className="text-xs">أضف بيانات من لوحة التحكم</p>
  </div>
);

/* ── Game input ── */
function GInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl font-black text-gray-800 text-sm focus:outline-none transition-all"
      style={{
        border: "2px solid rgba(123,47,190,0.2)",
        background: "white",
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.03)",
      }}
      onFocus={e => { e.target.style.borderColor = "#7B2FBE"; e.target.style.boxShadow = "0 0 0 3px rgba(123,47,190,0.12)"; }}
      onBlur={e => { e.target.style.borderColor = "rgba(123,47,190,0.2)"; e.target.style.boxShadow = "inset 0 2px 6px rgba(0,0,0,0.03)"; }}
    />
  );
}

/* ════════════════════ MAIN ════════════════════ */
export default function StudyModeSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

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

  const canProceed = () => {
    if (step === 0) return !!gender && team1Name.trim().length > 0 && team2Name.trim().length > 0;
    if (step === 1) return !!selectedStage;
    if (step === 2) return !!selectedGrade;
    if (step === 3) return !!selectedSubject;
    if (step === 4) return !!term;
    if (step === 5) return !!selectedUnit;
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

  /* ════ RENDER ════ */
  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl"
      style={{ fontFamily: "'Lalezar', 'Cairo', sans-serif" }}>

      {/* ── HUD Header ── */}
      <div className="flex-shrink-0"
        style={{ background: "linear-gradient(135deg,#7B2FBE 0%,#4a1a7e 100%)", boxShadow: "0 4px 24px rgba(123,47,190,0.45)" }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => step === 0 ? navigate("/") : setStep(s => s - 1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            <ChevronRight size={20} />
          </motion.button>

          <div className="text-center flex-1 px-2">
            <div className="flex items-center justify-center gap-2">
              <Sword size={15} className="text-white/80" />
              <span className="text-white font-black text-base">وضع الدراسة</span>
            </div>
            <p className="text-white/60 text-xs mt-0.5">{STEP_LABELS[step]} • الخطوة {step + 1} من {STEP_LABELS.length}</p>
          </div>

          <div className="w-10 flex-shrink-0 flex items-center justify-end">
            <span className="text-white/70 font-black text-sm">{step + 1}<span className="text-white/30">/{STEP_LABELS.length}</span></span>
          </div>
        </div>

        {/* Step dots */}
        <StepProgress step={step} total={STEP_LABELS.length} />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">

            {/* ══ STEP 0 — TEAM SETUP ══ */}
            {step === 0 && (
              <motion.div key="s0"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                className="space-y-6"
              >
                {/* Section label */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <Users size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">إعداد الفريقين</h2>
                    <p className="text-xs text-gray-400">اختر جنس اللاعبين وسمّ الفريقين</p>
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">اختر الجنس</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["male", "ذكر", "Blue Team", Shield], ["female", "أنثى", "Pink Team", Star]] as const).map(([g, label, tag, Ic]) => (
                      <GCard key={g} selected={gender === g} onClick={() => setGender(g as "male"|"female")} tall>
                        <div className="text-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${gender === g ? "bg-[#7B2FBE]" : "bg-gray-100"}`}>
                            <Ic size={22} className={gender === g ? "text-white" : "text-gray-400"} />
                          </div>
                          <div className={`font-black text-lg ${gender === g ? "text-[#7B2FBE]" : "text-gray-800"}`}>{label}</div>
                          <div className="text-[10px] font-bold text-gray-400 mt-0.5">{tag}</div>
                        </div>
                      </GCard>
                    ))}
                  </div>
                </div>

                {/* Team names */}
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">أسماء الفريقين</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(123,47,190,0.12)" }}>
                        <Shield size={14} style={{ color: "#7B2FBE" }} />
                      </div>
                      <GInput value={team1Name} onChange={setTeam1Name} placeholder="الفريق الأول" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(123,47,190,0.12)" }}>
                        <Sword size={14} style={{ color: "#7B2FBE" }} />
                      </div>
                      <GInput value={team2Name} onChange={setTeam2Name} placeholder="الفريق الثاني" />
                    </div>
                  </div>
                </div>

                {/* Game name */}
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">اسم الجلسة <span className="normal-case font-normal">(اختياري)</span></p>
                  <GInput value={gameName} onChange={setGameName} placeholder="مثال: مراجعة اختبار العلوم" />
                </div>
              </motion.div>
            )}

            {/* ══ STEP 1 — STAGE ══ */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <GraduationCap size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">اختر المرحلة</h2>
                    <p className="text-xs text-gray-400">ما هي مرحلتك الدراسية؟</p>
                  </div>
                </div>
                {stages.length === 0 ? <Empty icon={School} msg="لا توجد مراحل دراسية" />
                  : (
                    <div className="grid grid-cols-1 gap-3">
                      {stages.map((s, i) => {
                        const StageIcon = STAGE_ICONS_CMP[i] ?? BookOpen;
                        return (
                        <GCard key={s.id} selected={selectedStage?.id === s.id} onClick={() => setSelectedStage(s)} fullWidth tall>
                          <div className="flex items-center gap-4 px-2">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedStage?.id === s.id ? "bg-[#7B2FBE]" : "bg-gray-100"}`}>
                              <StageIcon size={22} className={selectedStage?.id === s.id ? "text-white" : "text-gray-500"} /></div>
                            <div>
                              <div className={`font-black text-xl ${selectedStage?.id === s.id ? "text-[#7B2FBE]" : "text-gray-900"}`}>{s.name}</div>
                              <div className="text-xs text-gray-400 mt-0.5">Zone {i + 1}</div>
                            </div>
                          </div>
                        </GCard>
                      );})}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 2 — GRADE ══ */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <Star size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">اختر الصف</h2>
                    <p className="text-xs text-gray-400">{selectedStage?.name}</p>
                  </div>
                </div>
                {loading ? <Spinner /> : grades.length === 0 ? <Empty icon={GraduationCap} msg="لا توجد صفوف لهذه المرحلة" />
                  : (
                    <div className="grid grid-cols-2 gap-3">
                      {grades.map((g, i) => (
                        <GCard key={g.id} selected={selectedGrade?.id === g.id} onClick={() => setSelectedGrade(g)} tall>
                          <div className="text-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 font-black text-base ${selectedGrade?.id === g.id ? "bg-[#7B2FBE] text-white" : "bg-gray-100 text-gray-500"}`}>
                              {g.order}
                            </div>
                            <div className={`font-black text-base ${selectedGrade?.id === g.id ? "text-[#7B2FBE]" : "text-gray-900"}`}>{g.name}</div>
                            <div className="text-[10px] text-gray-400 mt-0.5">Level {g.order}</div>
                          </div>
                        </GCard>
                      ))}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 3 — SUBJECT ══ */}
            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <BookOpen size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">اختر المادة</h2>
                    <p className="text-xs text-gray-400">{selectedGrade?.name}</p>
                  </div>
                </div>
                {loading ? <Spinner /> : subjects.length === 0 ? <Empty icon={BookOpen} msg="لا توجد مواد لهذا الصف" />
                  : (
                    <div className="grid grid-cols-2 gap-3">
                      {subjects.map((s, i) => {
                        const SubIcon = SUBJECT_ICONS_CMP[i % SUBJECT_ICONS_CMP.length];
                        return (
                        <GCard key={s.id} selected={selectedSubject?.id === s.id} onClick={() => setSelectedSubject(s)}>
                          <div className="text-center py-2">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2 ${selectedSubject?.id === s.id ? "bg-[#7B2FBE]" : "bg-gray-100"}`}>
                              <SubIcon size={20} className={selectedSubject?.id === s.id ? "text-white" : "text-gray-500"} />
                            </div>
                            <div className={`font-black text-sm leading-tight ${selectedSubject?.id === s.id ? "text-[#7B2FBE]" : "text-gray-900"}`}>{s.name}</div>
                          </div>
                        </GCard>
                      );})}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 4 — TERM ══ */}
            {step === 4 && (
              <motion.div key="s4"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <BookMarked size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">اختر الفصل</h2>
                    <p className="text-xs text-gray-400">{selectedSubject?.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {([1, 2] as const).map(t => (
                    <GCard key={t} selected={term === t} onClick={() => setTerm(t)} tall>
                      <div className="text-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 ${term === t ? "bg-[#7B2FBE]" : "bg-gray-100"}`}>
                          {t === 1
                            ? <Sun size={24} className={term === t ? "text-white" : "text-gray-500"} />
                            : <Moon size={24} className={term === t ? "text-white" : "text-gray-500"} />}
                        </div>
                        <div className={`font-black text-lg ${term === t ? "text-[#7B2FBE]" : "text-gray-900"}`}>
                          {t === 1 ? "الفصل الأول" : "الفصل الثاني"}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">Season {t}</div>
                      </div>
                    </GCard>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ══ STEP 5 — UNIT ══ */}
            {step === 5 && (
              <motion.div key="s5"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <Layers size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">اختر الوحدة</h2>
                    <p className="text-xs text-gray-400">{selectedSubject?.name} • ف{term}</p>
                  </div>
                </div>
                {loading ? <Spinner /> : units.length === 0 ? <Empty icon={Package} msg="لا توجد وحدات لهذا الفصل" />
                  : (
                    <div className="space-y-2.5">
                      {units.map((u, i) => (
                        <GCard key={u.id} selected={selectedUnit?.id === u.id} onClick={() => setSelectedUnit(u)} fullWidth>
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg"
                              style={selectedUnit?.id === u.id
                                ? { background: "#7B2FBE", color: "white" }
                                : { background: "rgba(123,47,190,0.08)", color: "#7B2FBE" }}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-black text-base ${selectedUnit?.id === u.id ? "text-[#7B2FBE]" : "text-gray-900"}`}>{u.name}</div>
                              <div className="text-[11px] text-gray-400">Mission {i + 1}</div>
                            </div>
                            <ChevronLeft size={16} style={{ color: selectedUnit?.id === u.id ? "#7B2FBE" : "#d1d5db" }} />
                          </div>
                        </GCard>
                      ))}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ══ STEP 6 — LESSONS ══ */}
            {step === 6 && (
              <motion.div key="s6"
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                    <Target size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="font-black text-gray-900 text-xl">اختر التحدي</h2>
                    <p className="text-xs text-gray-400">{selectedUnit?.name}</p>
                  </div>
                </div>

                {/* Focus toggle */}
                <motion.div
                  onClick={() => setFocusMode(v => !v)}
                  className="p-4 rounded-2xl border-2 mb-5 cursor-pointer flex items-center justify-between gap-3"
                  style={focusMode ? {
                    borderColor: "#7B2FBE",
                    background: "rgba(123,47,190,0.06)",
                    boxShadow: "0 0 0 3px rgba(123,47,190,0.1)",
                  } : { borderColor: "rgba(0,0,0,0.08)", background: "white" }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Target size={15} style={{ color: "#7B2FBE" }} />
                      <p className="font-black text-gray-900">وضع التركيز</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">اختر دروساً محددة فقط</p>
                  </div>
                  <motion.div
                    animate={{ background: focusMode ? "#7B2FBE" : "#e5e7eb" }}
                    className="w-12 h-6 rounded-full flex items-center px-1 flex-shrink-0"
                  >
                    <motion.div
                      animate={{ x: focusMode ? 24 : 0 }}
                      className="w-4 h-4 rounded-full bg-white shadow-sm"
                    />
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
                            <motion.button onClick={() => setSelectedLessons(selectedLessons.length === lessons.length ? [] : lessons.map(l => l.id))}
                              className="w-full py-2.5 rounded-xl text-sm font-black transition-all"
                              style={{ border: "2px dashed rgba(123,47,190,0.3)", color: "#7B2FBE" }}
                              whileTap={{ scale: 0.97 }}>
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
                                    boxShadow: "0 0 0 2px rgba(123,47,190,0.12)",
                                  } : { borderColor: "rgba(0,0,0,0.08)", background: "white" }}>
                                  <motion.div
                                    animate={{ background: sel ? "#7B2FBE" : "white", borderColor: sel ? "#7B2FBE" : "#d1d5db" }}
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
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="rounded-2xl p-4 flex items-center gap-3"
                    style={{ background: "rgba(123,47,190,0.06)", border: "2px solid rgba(123,47,190,0.15)" }}>
                    <Zap size={18} style={{ color: "#7B2FBE", flexShrink: 0 }} />
                    <p className="text-sm font-black" style={{ color: "#7B2FBE" }}>أسئلة عشوائية من كامل الوحدة</p>
                  </motion.div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* ── Action Button ── */}
      <div className="flex-shrink-0 px-4 pb-6 pt-3"
        style={{ background: "linear-gradient(to top, white 80%, transparent)" }}>
        {step < 6 ? (
          <motion.button
            onClick={() => canProceed() && setStep(s => s + 1)}
            disabled={!canProceed()}
            whileTap={canProceed() ? { scale: 0.96 } : {}}
            whileHover={canProceed() ? { scale: 1.02 } : {}}
            className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all"
            style={canProceed() ? {
              background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
              color: "white",
              boxShadow: "0 6px 24px rgba(123,47,190,0.45)",
            } : {
              background: "#f1f5f9",
              color: "#94a3b8",
              cursor: "not-allowed",
            }}
          >
            <span>التالي</span>
            <ChevronLeft size={20} />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleStart}
            disabled={loading || !canProceed()}
            whileTap={!loading ? { scale: 0.96 } : {}}
            whileHover={!loading ? { scale: 1.02 } : {}}
            className="w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all"
            style={{
              background: loading ? "#f1f5f9"
                : "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
              color: loading ? "#94a3b8" : "white",
              boxShadow: loading ? "none" : "0 8px 32px rgba(123,47,190,0.5)",
            }}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Zap size={22} />
                <span>ابدأ التحدي!</span>
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  );
}
