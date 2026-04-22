import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  ChevronRight, BookOpen, Layers, BookMarked, Target,
  ArrowLeft, Check, GraduationCap, User, Users,
} from "lucide-react";

const API = "/api";

type Stage = { id: number; name: string; order: number };
type Grade = { id: number; stageId: number; name: string; order: number };
type Subject = { id: number; gradeId: number | null; name: string };
type Unit = { id: number; name: string; subjectId: number; term: number };
type Lesson = { id: number; name: string; unitId: number };

const STEPS = ["الإعداد", "المرحلة", "الصف", "المادة", "الفصل", "الوحدة", "الدروس"];
const STEP_ICONS = [Users, GraduationCap, GraduationCap, BookOpen, BookMarked, Layers, Target];

// التعليقات الذكية حسب الجنس
const COMMENTS: Record<string, { male: string[]; female: string[] }> = {
  "5":  { male: ["يلا ركّز 👀", "قريبة منك يا بطل!"], female: ["يلا ركّزي 👀", "قريبة منك يا بطلة!"] },
  "10": { male: ["فكّر شوي 🤔", "مو صعبة ترى يابطل!"], female: ["فكري شوي 🤔", "مو صعبة ترى يابطلة!"] },
  "15": { male: ["شد حيلك 🔥", "ركز أكثر يا وحش!"], female: ["شدّي حيلك 🔥", "ركزي أكثر!"] },
  "20": { male: ["أسرع شوي 😏", "قاعد تفكر زيادة!"], female: ["أسرعي شوي 😏", "قاعدة تفكرين زيادة!"] },
};
export { COMMENTS };

export default function StudyModeSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  // Step 0
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");

  // Step 1-3
  const [stages, setStages] = useState<Stage[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Step 4-6
  const [term, setTerm] = useState<1 | 2 | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Load stages
  useEffect(() => {
    fetch(`${API}/study/stages`).then(r => r.json())
      .then(d => setStages(Array.isArray(d) ? d : [])).catch(() => setStages([]));
  }, []);

  // Load grades when stage selected
  useEffect(() => {
    if (!selectedStage) return;
    setLoading(true);
    fetch(`${API}/study/grades?stageId=${selectedStage.id}`).then(r => r.json())
      .then(d => { setGrades(Array.isArray(d) ? d : []); setSelectedGrade(null); setSelectedSubject(null); })
      .catch(() => setGrades([])).finally(() => setLoading(false));
  }, [selectedStage]);

  // Load subjects when grade selected
  useEffect(() => {
    if (!selectedGrade) return;
    setLoading(true);
    fetch(`${API}/study/subjects?gradeId=${selectedGrade.id}`).then(r => r.json())
      .then(d => { setSubjects(Array.isArray(d) ? d : []); setSelectedSubject(null); })
      .catch(() => setSubjects([])).finally(() => setLoading(false));
  }, [selectedGrade]);

  // Load units when subject + term selected
  useEffect(() => {
    if (!selectedSubject || !term) return;
    setLoading(true);
    fetch(`${API}/study/units?subjectId=${selectedSubject.id}&term=${term}`).then(r => r.json())
      .then(d => { setUnits(Array.isArray(d) ? d : []); setSelectedUnit(null); })
      .catch(() => setUnits([])).finally(() => setLoading(false));
  }, [selectedSubject, term]);

  // Load lessons when unit selected
  useEffect(() => {
    if (!selectedUnit) return;
    setLoading(true);
    fetch(`${API}/study/lessons?unitId=${selectedUnit.id}`).then(r => r.json())
      .then(d => { setLessons(Array.isArray(d) ? d : []); setSelectedLessons([]); })
      .catch(() => setLessons([])).finally(() => setLoading(false));
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
      const lessonParam = focusMode && selectedLessons.length > 0
        ? `&lessonIds=${selectedLessons.join(",")}`
        : "";
      const res = await fetch(`${API}/study/questions?unitId=${selectedUnit.id}${lessonParam}`);
      const questions = await res.json();
      if (!Array.isArray(questions) || questions.length === 0) {
        alert("لا توجد أسئلة في هذه الوحدة. يرجى إضافة أسئلة من لوحة التحكم.");
        setLoading(false);
        return;
      }
      const gameData = {
        gameName: gameName.trim() || `${selectedSubject.name} - ${selectedUnit.name}`,
        gender,
        team1Name,
        team2Name,
        subject: selectedSubject,
        unit: selectedUnit,
        grade: selectedGrade,
        stage: selectedStage,
        term,
        questions: [...questions].sort(() => Math.random() - 0.5),
      };
      localStorage.setItem("rakez-study-game", JSON.stringify(gameData));
      localStorage.setItem("rakez-study-scores", JSON.stringify({ team1: 0, team2: 0 }));
      localStorage.setItem("rakez-study-index", "0");
      navigate("/study-game");
    } catch {
      alert("حدث خطأ في تحميل الأسئلة. تأكد من الاتصال.");
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (id: number) =>
    setSelectedLessons(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  const selectAllLessons = () =>
    setSelectedLessons(selectedLessons.length === lessons.length ? [] : lessons.map(l => l.id));

  const Icon = STEP_ICONS[step];

  const cardBtn = (selected: boolean, onClick: () => void, children: React.ReactNode) => (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center gap-3 ${
        selected ? "border-[#7B2FBE] bg-[#7B2FBE]/8 shadow-[0_0_0_3px_rgba(123,47,190,0.12)]"
                 : "border-gray-200 hover:border-[#7B2FBE]/40 bg-white"
      }`}
    >
      {children}
      {selected && <Check size={16} className="text-[#7B2FBE] mr-auto flex-shrink-0" />}
    </motion.button>
  );

  const emptyState = (icon: React.ReactNode, msg: string, sub?: string) => (
    <div className="flex flex-col items-center py-14 text-gray-400">
      <div className="mb-3 opacity-40">{icon}</div>
      <p className="font-bold text-sm">{msg}</p>
      {sub && <p className="text-xs mt-1 text-gray-400">{sub}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-4 flex items-center gap-3 shadow-lg flex-shrink-0">
        <button
          onClick={() => step === 0 ? navigate("/") : setStep(s => s - 1)}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-black text-lg">وضع الدراسة 🔥</h1>
          <p className="text-white/70 text-xs">{STEPS[step]} • الخطوة {step + 1} من {STEPS.length}</p>
        </div>
        <Icon size={20} className="text-white/50 flex-shrink-0" />
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-gray-100 flex-shrink-0">
        <motion.div
          className="h-full bg-gradient-to-l from-[#7B2FBE] to-[#9b59f5]"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">

            {/* ── STEP 0: الإعداد ── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Users size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">إعداد اللعبة</h2>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-3">الجنس</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([["male", "ذكر", "👦"], ["female", "أنثى", "👧"]] as const).map(([g, label, emoji]) => (
                      <motion.button
                        key={g} whileTap={{ scale: 0.96 }}
                        onClick={() => setGender(g)}
                        className={`py-5 rounded-2xl border-2 font-black text-lg transition-all ${
                          gender === g ? "border-[#7B2FBE] bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30"
                                      : "border-gray-200 text-gray-700 hover:border-[#7B2FBE]/40"
                        }`}
                      >
                        <div className="text-3xl mb-1">{emoji}</div>
                        {label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Team names */}
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-3">أسماء الفرق</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { val: team1Name, set: setTeam1Name, label: "الفريق الأول" },
                      { val: team2Name, set: setTeam2Name, label: "الفريق الثاني" },
                    ].map(({ val, set, label }) => (
                      <input
                        key={label}
                        value={val}
                        onChange={e => set(e.target.value)}
                        placeholder={label}
                        className="border-2 border-gray-200 rounded-xl px-3 py-3 text-gray-800 font-bold text-sm focus:outline-none focus:border-[#7B2FBE] transition-colors"
                      />
                    ))}
                  </div>
                </div>

                {/* Game name (optional) */}
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-2">اسم الجلسة <span className="text-gray-400 font-normal">(اختياري)</span></p>
                  <input
                    value={gameName}
                    onChange={e => setGameName(e.target.value)}
                    placeholder="مثال: مراجعة اختبار العلوم"
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium text-sm focus:outline-none focus:border-[#7B2FBE] transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* ── STEP 1: المرحلة ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-6">
                  <GraduationCap size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">اختر المرحلة الدراسية</h2>
                </div>
                {stages.length === 0
                  ? emptyState(<GraduationCap size={40} />, "لا توجد مراحل دراسية", "أضف مراحل من لوحة التحكم")
                  : (
                    <div className="grid grid-cols-1 gap-3">
                      {stages.map(s => (
                        <motion.button
                          key={s.id} whileTap={{ scale: 0.97 }}
                          onClick={() => setSelectedStage(s)}
                          className={`py-6 rounded-2xl border-2 font-black text-xl transition-all ${
                            selectedStage?.id === s.id
                              ? "border-[#7B2FBE] bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30"
                              : "border-gray-200 text-gray-800 hover:border-[#7B2FBE]/40"
                          }`}
                        >
                          {s.name}
                        </motion.button>
                      ))}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ── STEP 2: الصف ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-6">
                  <GraduationCap size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">اختر الصف</h2>
                </div>
                {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" /></div>
                  : grades.length === 0
                  ? emptyState(<GraduationCap size={40} />, "لا توجد صفوف لهذه المرحلة", "أضف صفوفاً من لوحة التحكم")
                  : (
                    <div className="grid grid-cols-2 gap-3">
                      {grades.map(g => (
                        <motion.button
                          key={g.id} whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedGrade(g)}
                          className={`py-5 rounded-2xl border-2 font-black text-lg transition-all ${
                            selectedGrade?.id === g.id
                              ? "border-[#7B2FBE] bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30"
                              : "border-gray-200 text-gray-800 hover:border-[#7B2FBE]/40"
                          }`}
                        >
                          {g.name}
                        </motion.button>
                      ))}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ── STEP 3: المادة ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">اختر المادة</h2>
                </div>
                {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" /></div>
                  : subjects.length === 0
                  ? emptyState(<BookOpen size={40} />, "لا توجد مواد لهذا الصف", "أضف مواد من لوحة التحكم")
                  : (
                    <div className="grid grid-cols-2 gap-3">
                      {subjects.map(s => (
                        <motion.button
                          key={s.id} whileTap={{ scale: 0.96 }}
                          onClick={() => setSelectedSubject(s)}
                          className={`p-5 rounded-2xl border-2 text-right transition-all font-bold ${
                            selectedSubject?.id === s.id
                              ? "border-[#7B2FBE] bg-[#7B2FBE]/8 shadow-[0_0_0_3px_rgba(123,47,190,0.12)]"
                              : "border-gray-200 hover:border-[#7B2FBE]/40 bg-white"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#7B2FBE]/10 flex items-center justify-center mb-3">
                            <BookOpen size={20} className="text-[#7B2FBE]" />
                          </div>
                          <span className={`text-base ${selectedSubject?.id === s.id ? "text-[#7B2FBE]" : "text-gray-800"}`}>{s.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ── STEP 4: الفصل ── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-6">
                  <BookMarked size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">اختر الفصل الدراسي</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {([1, 2] as const).map(t => (
                    <motion.button key={t} whileTap={{ scale: 0.96 }}
                      onClick={() => setTerm(t)}
                      className={`py-8 rounded-2xl border-2 font-black text-xl transition-all ${
                        term === t ? "border-[#7B2FBE] bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30"
                                  : "border-gray-200 text-gray-700 hover:border-[#7B2FBE]/40"
                      }`}
                    >
                      {t === 1 ? "الفصل الأول" : "الفصل الثاني"}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: الوحدة ── */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-6">
                  <Layers size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">اختر الوحدة</h2>
                </div>
                {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" /></div>
                  : units.length === 0
                  ? emptyState(<Layers size={40} />, "لا توجد وحدات لهذا الفصل", "أضف وحدات من لوحة التحكم")
                  : (
                    <div className="space-y-3">
                      {units.map(u => cardBtn(selectedUnit?.id === u.id, () => setSelectedUnit(u),
                        <>
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedUnit?.id === u.id ? "bg-[#7B2FBE] text-white" : "bg-gray-100 text-gray-400"}`}>
                            <Layers size={16} />
                          </div>
                          <span className={`font-bold ${selectedUnit?.id === u.id ? "text-[#7B2FBE]" : "text-gray-800"}`}>{u.name}</span>
                        </>
                      ))}
                    </div>
                  )}
              </motion.div>
            )}

            {/* ── STEP 6: الدروس + التركيز ── */}
            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-4">
                  <Target size={20} className="text-[#7B2FBE]" />
                  <h2 className="text-xl font-black text-gray-900">وضع التركيز</h2>
                </div>

                {/* Focus toggle */}
                <div
                  className={`p-4 rounded-2xl border-2 mb-5 cursor-pointer transition-all flex items-center justify-between ${focusMode ? "border-[#7B2FBE] bg-[#7B2FBE]/5" : "border-gray-200"}`}
                  onClick={() => setFocusMode(v => !v)}
                >
                  <div>
                    <p className="font-black text-gray-800">وضع التركيز 🎯</p>
                    <p className="text-xs text-gray-500 mt-0.5">اختر دروساً محددة فقط</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${focusMode ? "bg-[#7B2FBE] justify-end" : "bg-gray-200 justify-start"}`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow" />
                  </div>
                </div>

                <AnimatePresence>
                  {focusMode && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      {loading ? <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" /></div>
                        : lessons.length === 0
                        ? <p className="text-gray-400 text-center py-4 text-sm">لا توجد دروس لهذه الوحدة</p>
                        : (
                          <div className="space-y-2">
                            {/* Select all */}
                            <button onClick={selectAllLessons}
                              className="w-full py-2.5 rounded-xl border-2 border-dashed border-[#7B2FBE]/30 text-[#7B2FBE] text-sm font-bold hover:bg-[#7B2FBE]/5 transition-colors">
                              {selectedLessons.length === lessons.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
                            </button>
                            {lessons.map(l => (
                              <motion.button key={l.id} whileTap={{ scale: 0.98 }}
                                onClick={() => toggleLesson(l.id)}
                                className={`w-full p-3.5 rounded-xl border-2 text-right flex items-center gap-3 transition-all ${selectedLessons.includes(l.id) ? "border-[#7B2FBE] bg-[#7B2FBE]/5" : "border-gray-200 hover:border-[#7B2FBE]/30"}`}
                              >
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${selectedLessons.includes(l.id) ? "border-[#7B2FBE] bg-[#7B2FBE]" : "border-gray-300"}`}>
                                  {selectedLessons.includes(l.id) && <Check size={12} className="text-white" />}
                                </div>
                                <span className={`font-medium text-sm ${selectedLessons.includes(l.id) ? "text-[#7B2FBE]" : "text-gray-700"}`}>{l.name}</span>
                              </motion.button>
                            ))}
                          </div>
                        )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!focusMode && (
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-sm text-[#7B2FBE] font-medium">⚡ أسئلة عشوائية من كامل الوحدة</p>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>

          {/* Action */}
          <div className="mt-8 pb-6">
            {step < 6 ? (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => canProceed() && setStep(s => s + 1)}
                disabled={!canProceed()}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${canProceed() ? "bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30 hover:bg-[#8B35D6]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                التالي <ChevronRight size={20} />
              </motion.button>
            ) : (
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                disabled={!canProceed() || loading}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${canProceed() && !loading ? "bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30 hover:bg-[#8B35D6]" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
              >
                {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                         : <> ابدأ التحدي 🔥 <Target size={20} /> </>}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
