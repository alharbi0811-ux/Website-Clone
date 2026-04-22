import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { ChevronRight, BookOpen, Layers, BookMarked, Target, ArrowLeft, Check } from "lucide-react";

const API_BASE = "/api";

type Subject = { id: number; name: string };
type Unit = { id: number; name: string; subjectId: number; term: number };
type Lesson = { id: number; name: string; unitId: number };

const STEPS = ["المادة", "الإعداد", "الفصل", "الوحدة", "الدروس"];

export default function StudyModeSetup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);

  // Selections
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [gameName, setGameName] = useState("");
  const [team1Name, setTeam1Name] = useState("الفريق الأول");
  const [team2Name, setTeam2Name] = useState("الفريق الثاني");
  const [term, setTerm] = useState<1 | 2 | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/study/subjects`)
      .then((r) => r.json())
      .then(setSubjects)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSubject || !term) return;
    setLoading(true);
    fetch(`${API_BASE}/study/units?subjectId=${selectedSubject.id}&term=${term}`)
      .then((r) => r.json())
      .then((data) => { setUnits(data); setSelectedUnit(null); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedSubject, term]);

  useEffect(() => {
    if (!selectedUnit) return;
    setLoading(true);
    fetch(`${API_BASE}/study/lessons?unitId=${selectedUnit.id}`)
      .then((r) => r.json())
      .then((data) => { setLessons(data); setSelectedLessons([]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedUnit]);

  const canProceed = () => {
    if (step === 0) return !!selectedSubject;
    if (step === 1) return gameName.trim().length > 0 && team1Name.trim().length > 0 && team2Name.trim().length > 0;
    if (step === 2) return !!term;
    if (step === 3) return !!selectedUnit;
    if (step === 4) return !focusMode || selectedLessons.length > 0;
    return false;
  };

  const handleStart = async () => {
    if (!selectedSubject || !selectedUnit || !term) return;
    setLoading(true);
    try {
      const lessonParam = focusMode && selectedLessons.length > 0
        ? `&lessonIds=${selectedLessons.join(",")}`
        : "";
      const res = await fetch(`${API_BASE}/study/questions?unitId=${selectedUnit.id}${lessonParam}`);
      const questions = await res.json();

      const gameData = {
        gameName: gameName || `${selectedSubject.name} - ${selectedUnit.name}`,
        team1Name,
        team2Name,
        subject: selectedSubject,
        unit: selectedUnit,
        term,
        focusMode,
        selectedLessons,
        questions: questions.sort(() => Math.random() - 0.5),
      };
      localStorage.setItem("rakez-study-game", JSON.stringify(gameData));
      localStorage.setItem("rakez-study-scores", JSON.stringify({ team1: 0, team2: 0 }));
      localStorage.setItem("rakez-study-index", "0");
      navigate("/study-game");
    } catch (e) {
      alert("حدث خطأ في تحميل الأسئلة");
    } finally {
      setLoading(false);
    }
  };

  const toggleLesson = (id: number) => {
    setSelectedLessons((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-4 flex items-center gap-3 shadow-lg">
        <button
          onClick={() => (step === 0 ? navigate("/") : setStep((s) => s - 1))}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-white font-black text-lg">وضع الدراسة</h1>
          <p className="text-white/70 text-xs">الخطوة {step + 1} من {STEPS.length}: {STEPS[step]}</p>
        </div>
        <BookOpen size={22} className="text-white/60" />
      </div>

      {/* Step indicator */}
      <div className="px-4 py-3 border-b border-gray-100 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < step ? "bg-[#7B2FBE]" : i === step ? "bg-[#7B2FBE]/60" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      <div className="max-w-xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* STEP 0 – اختيار المادة */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-6">
                <BookOpen size={20} className="text-[#7B2FBE]" />
                <h2 className="text-xl font-black text-gray-900">اختر المادة</h2>
              </div>
              {subjects.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">لا توجد مواد بعد</p>
                  <p className="text-sm mt-1">أضف مواد من لوحة التحكم</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {subjects.map((s) => (
                    <motion.button
                      key={s.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedSubject(s)}
                      className={`p-5 rounded-2xl border-2 text-right transition-all font-bold text-gray-800 ${
                        selectedSubject?.id === s.id
                          ? "border-[#7B2FBE] bg-[#7B2FBE]/8 shadow-[0_0_0_3px_rgba(123,47,190,0.15)]"
                          : "border-gray-200 hover:border-[#7B2FBE]/40 bg-white"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#7B2FBE]/10 flex items-center justify-center mb-3">
                        <BookMarked size={20} className="text-[#7B2FBE]" />
                      </div>
                      <span className="text-base">{s.name}</span>
                      {selectedSubject?.id === s.id && (
                        <div className="mt-2 flex items-center gap-1 text-[#7B2FBE] text-xs font-bold">
                          <Check size={12} /> محدد
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 1 – إعداد اللعبة */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-6">
                <Target size={20} className="text-[#7B2FBE]" />
                <h2 className="text-xl font-black text-gray-900">إعداد اللعبة</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">اسم اللعبة</label>
                  <input
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder={`${selectedSubject?.name ?? "اللعبة"} - ${new Date().toLocaleDateString("ar")}`}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#7B2FBE] transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم الفريق الأول</label>
                    <input
                      value={team1Name}
                      onChange={(e) => setTeam1Name(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#7B2FBE] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم الفريق الثاني</label>
                    <input
                      value={team2Name}
                      onChange={(e) => setTeam2Name(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:border-[#7B2FBE] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2 – اختيار الفصل */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-6">
                <Layers size={20} className="text-[#7B2FBE]" />
                <h2 className="text-xl font-black text-gray-900">اختر الفصل الدراسي</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((t) => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setTerm(t as 1 | 2)}
                    className={`py-8 rounded-2xl border-2 font-black text-xl transition-all ${
                      term === t
                        ? "border-[#7B2FBE] bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30"
                        : "border-gray-200 text-gray-700 hover:border-[#7B2FBE]/40"
                    }`}
                  >
                    {t === 1 ? "الفصل الأول" : "الفصل الثاني"}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 3 – اختيار الوحدة */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-6">
                <Layers size={20} className="text-[#7B2FBE]" />
                <h2 className="text-xl font-black text-gray-900">اختر الوحدة</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-3 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" />
                </div>
              ) : units.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Layers size={40} className="mx-auto mb-3 opacity-40" />
                  <p className="font-medium">لا توجد وحدات لهذا الفصل</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {units.map((u) => (
                    <motion.button
                      key={u.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedUnit(u)}
                      className={`w-full p-4 rounded-xl border-2 text-right transition-all flex items-center gap-3 ${
                        selectedUnit?.id === u.id
                          ? "border-[#7B2FBE] bg-[#7B2FBE]/8"
                          : "border-gray-200 hover:border-[#7B2FBE]/40 bg-white"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedUnit?.id === u.id ? "bg-[#7B2FBE] text-white" : "bg-gray-100 text-gray-400"
                      }`}>
                        <Layers size={16} />
                      </div>
                      <span className={`font-bold ${selectedUnit?.id === u.id ? "text-[#7B2FBE]" : "text-gray-800"}`}>
                        {u.name}
                      </span>
                      {selectedUnit?.id === u.id && <Check size={16} className="text-[#7B2FBE] mr-auto" />}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4 – الدروس + التركيز */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-2 mb-4">
                <Target size={20} className="text-[#7B2FBE]" />
                <h2 className="text-xl font-black text-gray-900">وضع التركيز</h2>
              </div>

              {/* Focus toggle */}
              <div
                className={`p-4 rounded-2xl border-2 mb-5 cursor-pointer transition-all flex items-center justify-between ${
                  focusMode ? "border-[#7B2FBE] bg-[#7B2FBE]/8" : "border-gray-200"
                }`}
                onClick={() => setFocusMode((v) => !v)}
              >
                <div>
                  <p className="font-black text-gray-800">وضع التركيز</p>
                  <p className="text-xs text-gray-500 mt-0.5">اختر دروساً محددة للتركيز عليها</p>
                </div>
                <div className={`w-12 h-6 rounded-full transition-all flex items-center px-1 ${
                  focusMode ? "bg-[#7B2FBE] justify-end" : "bg-gray-200 justify-start"
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow" />
                </div>
              </div>

              {/* Lessons list */}
              <AnimatePresence>
                {focusMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="w-6 h-6 border-2 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" />
                      </div>
                    ) : lessons.length === 0 ? (
                      <p className="text-gray-400 text-center py-4 text-sm">لا توجد دروس لهذه الوحدة</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-gray-600 mb-3">اختر الدروس:</p>
                        {lessons.map((l) => (
                          <motion.button
                            key={l.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleLesson(l.id)}
                            className={`w-full p-3.5 rounded-xl border-2 text-right flex items-center gap-3 transition-all ${
                              selectedLessons.includes(l.id)
                                ? "border-[#7B2FBE] bg-[#7B2FBE]/8"
                                : "border-gray-200 hover:border-[#7B2FBE]/30"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              selectedLessons.includes(l.id) ? "border-[#7B2FBE] bg-[#7B2FBE]" : "border-gray-300"
                            }`}>
                              {selectedLessons.includes(l.id) && <Check size={12} className="text-white" />}
                            </div>
                            <span className={`font-medium text-sm ${selectedLessons.includes(l.id) ? "text-[#7B2FBE]" : "text-gray-700"}`}>
                              {l.name}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {!focusMode && (
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-sm text-[#7B2FBE] font-medium">
                    سيتم اختيار أسئلة عشوائية من كامل الوحدة
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action button */}
        <div className="mt-8">
          {step < 4 ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => canProceed() && setStep((s) => s + 1)}
              disabled={!canProceed()}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                canProceed()
                  ? "bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30 hover:bg-[#8B35D6]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              التالي
              <ChevronRight size={20} />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleStart}
              disabled={!canProceed() || loading}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all ${
                canProceed() && !loading
                  ? "bg-[#7B2FBE] text-white shadow-lg shadow-[#7B2FBE]/30 hover:bg-[#8B35D6]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  ابدأ اللعبة
                  <Target size={20} />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
