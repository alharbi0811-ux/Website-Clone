import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Play, Pause, Eye, ChevronRight, LogOut, Trophy } from "lucide-react";

type Question = {
  id: number;
  questionText: string;
  questionImage?: string;
  answerText: string;
  answerImage?: string;
};

type GameData = {
  gameName: string;
  team1Name: string;
  team2Name: string;
  questions: Question[];
};

type Scores = { team1: number; team2: number };

export default function StudyModeGame() {
  const [, navigate] = useLocation();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 });
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("rakez-study-game");
    const scoresStored = localStorage.getItem("rakez-study-scores");
    const indexStored = localStorage.getItem("rakez-study-index");
    if (!stored) { navigate("/study-setup"); return; }
    setGameData(JSON.parse(stored));
    if (scoresStored) setScores(JSON.parse(scoresStored));
    if (indexStored) setCurrentIndex(Number(indexStored));
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    localStorage.setItem("rakez-study-scores", JSON.stringify(scores));
    localStorage.setItem("rakez-study-index", String(currentIndex));
  }, [scores, currentIndex]);

  const currentQuestion = gameData?.questions[currentIndex];
  const total = gameData?.questions.length ?? 0;
  const isLast = currentIndex >= total - 1;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleRevealAnswer = () => {
    setRunning(false);
    setShowAnswer(true);
  };

  const handleTeamScore = (team: "team1" | "team2" | "none") => {
    if (team !== "none") {
      setScores((prev) => {
        const next = { ...prev, [team]: prev[team] + 1 };
        localStorage.setItem("rakez-study-scores", JSON.stringify(next));
        return next;
      });
    }
    if (isLast) {
      setShowEndModal(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setTimer(0);
      setRunning(false);
      setShowAnswer(false);
    }
  };

  const handleExit = () => {
    ["rakez-study-game", "rakez-study-scores", "rakez-study-index"].forEach((k) =>
      localStorage.removeItem(k)
    );
    navigate("/");
  };

  if (!gameData || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
        <div className="w-8 h-8 border-3 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Top bar */}
      <div className="shrink-0 bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-3 flex items-center justify-between shadow-lg">
        <button
          onClick={handleExit}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <LogOut size={16} />
        </button>
        <div className="text-center">
          <p className="text-white font-black text-sm">{gameData.gameName}</p>
          <p className="text-white/70 text-xs">{currentIndex + 1} / {total}</p>
        </div>
        <div className="flex gap-3 text-sm font-black">
          <span className="text-white/80">{gameData.team1Name}: <span className="text-white">{scores.team1}</span></span>
          <span className="text-white/40">|</span>
          <span className="text-white/80">{gameData.team2Name}: <span className="text-white">{scores.team2}</span></span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100">
        <motion.div
          className="h-full bg-[#7B2FBE]"
          animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        {/* Timer */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning((r) => !r)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${
              running ? "bg-[#7B2FBE] text-white" : "bg-white border-2 border-[#7B2FBE] text-[#7B2FBE]"
            }`}
          >
            {running ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <div
            className={`text-3xl font-black tracking-widest tabular-nums transition-colors ${
              timer > 30 ? "text-red-500" : timer > 15 ? "text-orange-500" : "text-[#7B2FBE]"
            }`}
          >
            {formatTime(timer)}
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            className="w-full max-w-lg"
          >
            <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 shadow-xl shadow-purple-100/40">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#7B2FBE] text-white font-black text-sm flex items-center justify-center">
                  {currentIndex + 1}
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">سؤال</span>
              </div>
              <p className="text-xl font-black text-gray-900 leading-relaxed mb-4">{currentQuestion.questionText}</p>
              {currentQuestion.questionImage && (
                <img
                  src={currentQuestion.questionImage}
                  alt=""
                  className="w-full rounded-xl object-contain max-h-48 border border-gray-100"
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Reveal Answer button */}
        <AnimatePresence>
          {!showAnswer ? (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleRevealAnswer}
              className="w-full max-w-lg py-4 rounded-2xl bg-[#7B2FBE] text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#7B2FBE]/30 hover:bg-[#8B35D6] transition-colors"
            >
              <Eye size={20} />
              إظهار الإجابة
            </motion.button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-lg space-y-3"
            >
              {/* Answer card */}
              <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-[#7B2FBE]/20 rounded-3xl p-5">
                <p className="text-xs font-bold text-[#7B2FBE] uppercase tracking-wider mb-2">الإجابة</p>
                <p className="text-lg font-black text-gray-900 leading-relaxed">{currentQuestion.answerText}</p>
                {currentQuestion.answerImage && (
                  <img
                    src={currentQuestion.answerImage}
                    alt=""
                    className="w-full rounded-xl object-contain max-h-40 mt-3 border border-purple-100"
                  />
                )}
              </div>

              {/* Who answered? */}
              <p className="text-center text-sm font-bold text-gray-500">منو جاوب؟</p>
              <div className="grid grid-cols-3 gap-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTeamScore("team1")}
                  className="py-3 rounded-xl bg-[#7B2FBE] text-white font-black text-sm hover:bg-[#8B35D6] transition-colors"
                >
                  {gameData.team1Name}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTeamScore("none")}
                  className="py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-sm hover:bg-gray-200 transition-colors"
                >
                  لا أحد
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTeamScore("team2")}
                  className="py-3 rounded-xl bg-[#7B2FBE] text-white font-black text-sm hover:bg-[#8B35D6] transition-colors"
                >
                  {gameData.team2Name}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* End Game Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
            >
              <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] p-8 text-center">
                <Trophy size={56} className="text-yellow-300 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-white mb-1">
                  {scores.team1 > scores.team2
                    ? `فاز ${gameData.team1Name}!`
                    : scores.team2 > scores.team1
                    ? `فاز ${gameData.team2Name}!`
                    : "تعادل!"}
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-around mb-6">
                  <div className="text-center">
                    <p className="text-3xl font-black text-[#7B2FBE]">{scores.team1}</p>
                    <p className="text-sm text-gray-500 font-bold">{gameData.team1Name}</p>
                  </div>
                  <div className="text-gray-300 font-black text-xl">VS</div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-[#7B2FBE]">{scores.team2}</p>
                    <p className="text-sm text-gray-500 font-bold">{gameData.team2Name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setScores({ team1: 0, team2: 0 });
                      setCurrentIndex(0);
                      setTimer(0);
                      setRunning(false);
                      setShowAnswer(false);
                      setShowEndModal(false);
                      const gd = JSON.parse(localStorage.getItem("rakez-study-game") || "{}");
                      gd.questions = gd.questions?.sort(() => Math.random() - 0.5);
                      localStorage.setItem("rakez-study-game", JSON.stringify(gd));
                      localStorage.setItem("rakez-study-scores", JSON.stringify({ team1: 0, team2: 0 }));
                      localStorage.setItem("rakez-study-index", "0");
                    }}
                    className="py-3 rounded-xl border-2 border-[#7B2FBE] text-[#7B2FBE] font-black text-sm hover:bg-purple-50 transition-colors"
                  >
                    إعادة اللعبة
                  </button>
                  <button
                    onClick={handleExit}
                    className="py-3 rounded-xl bg-[#7B2FBE] text-white font-black text-sm hover:bg-[#8B35D6] transition-colors"
                  >
                    الخروج
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
