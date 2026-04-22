import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Eye, Pause, Play, LogOut, Trophy, ChevronRight } from "lucide-react";

type Question = {
  id: number;
  questionText: string;
  questionImage?: string;
  answerText: string;
  answerImage?: string;
};

type GameData = {
  gameName: string;
  gender: "male" | "female";
  team1Name: string;
  team2Name: string;
  questions: Question[];
};

type Scores = { team1: number; team2: number };

// التعليقات الذكية
const TIMED_COMMENTS: Record<number, { male: string[]; female: string[] }> = {
  5:  { male: ["يلا ركّز 👀", "قريبة منك يا بطل!"],    female: ["يلا ركّزي 👀", "قريبة منك يا بطلة!"] },
  10: { male: ["فكّر شوي 🤔", "مو صعبة ترى!"],         female: ["فكري شوي 🤔", "مو صعبة ترى!"] },
  15: { male: ["شد حيلك 🔥", "ركز أكثر يا وحش!"],      female: ["شدّي حيلك 🔥", "ركزي أكثر!"] },
  20: { male: ["أسرع شوي 😏", "قاعد تفكر زيادة!"],     female: ["أسرعي شوي 😏", "قاعدة تفكرين زيادة!"] },
};

const pick = (arr: string[]): string => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "");

export default function StudyModeGame() {
  const [, navigate] = useLocation();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 });
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(true); // auto-start
  const [showAnswer, setShowAnswer] = useState(false);
  const [comment, setComment] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commentTimeouts = useRef<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("rakez-study-game");
    const scoresStored = localStorage.getItem("rakez-study-scores");
    const indexStored = localStorage.getItem("rakez-study-index");
    if (!stored) { navigate("/study-setup"); return; }
    setGameData(JSON.parse(stored));
    if (scoresStored) setScores(JSON.parse(scoresStored));
    if (indexStored) setCurrentIndex(Number(indexStored));
  }, []);

  // Auto-start timer when question changes
  useEffect(() => {
    if (!gameData) return;
    setTimer(0);
    setRunning(true);
    setShowAnswer(false);
    setComment(null);
    return () => { commentTimeouts.current.forEach(clearTimeout); commentTimeouts.current = []; };
  }, [currentIndex, gameData]);

  // Timer tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Smart comments at specific times
  useEffect(() => {
    if (!gameData || !running) return;
    const gender = gameData.gender;
    const thresholds = [5, 10, 15, 20];
    for (const t of thresholds) {
      if (timer === t && TIMED_COMMENTS[t]) {
        const g = (gender === "male" || gender === "female") ? gender : "male";
        const msgs = TIMED_COMMENTS[t][g];
        if (msgs && msgs.length > 0) {
          setComment(pick(msgs));
          const timeout = window.setTimeout(() => setComment(null), 2500);
          commentTimeouts.current.push(timeout);
        }
      }
    }
  }, [timer, running, gameData]);

  // Persist state
  useEffect(() => {
    localStorage.setItem("rakez-study-scores", JSON.stringify(scores));
    localStorage.setItem("rakez-study-index", String(currentIndex));
  }, [scores, currentIndex]);

  const currentQ = gameData?.questions[currentIndex];
  const total = gameData?.questions.length ?? 0;
  const isLast = currentIndex >= total - 1;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleReveal = () => {
    setRunning(false);
    setShowAnswer(true);
    setComment(null);
  };

  const handleScore = (team: "team1" | "team2" | "none") => {
    if (team !== "none") {
      setScores(prev => {
        const next = { ...prev, [team]: prev[team] + 1 };
        localStorage.setItem("rakez-study-scores", JSON.stringify(next));
        return next;
      });
    }
    if (isLast) {
      setShowEndModal(true);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  const handleExit = () => {
    ["rakez-study-game", "rakez-study-scores", "rakez-study-index"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  const handleRestart = () => {
    const gd = JSON.parse(localStorage.getItem("rakez-study-game") || "{}");
    gd.questions = (gd.questions || []).sort(() => Math.random() - 0.5);
    localStorage.setItem("rakez-study-game", JSON.stringify(gd));
    setScores({ team1: 0, team2: 0 });
    setCurrentIndex(0);
    setShowEndModal(false);
    setShowAnswer(false);
  };

  if (!gameData || !currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
        <div className="w-8 h-8 border-3 border-[#7B2FBE]/30 border-t-[#7B2FBE] rounded-full animate-spin" />
      </div>
    );
  }

  const winnerTeam = scores.team1 > scores.team2 ? gameData.team1Name
    : scores.team2 > scores.team1 ? gameData.team2Name : null;

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      {/* Top bar */}
      <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] px-4 py-3 flex items-center justify-between flex-shrink-0 shadow-lg">
        <button onClick={handleExit}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors flex-shrink-0"
        >
          <LogOut size={16} />
        </button>
        <div className="text-center flex-1">
          <p className="text-white font-black text-sm truncate px-2">{gameData.gameName}</p>
          <p className="text-white/70 text-xs">{currentIndex + 1} / {total}</p>
        </div>
        <div className="w-9 flex-shrink-0" />
      </div>
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 flex-shrink-0">
        <motion.div className="h-full bg-[#7B2FBE]"
          animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {/* Smart comment toast */}
      <AnimatePresence>
        {comment && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 bg-[#7B2FBE] text-white px-5 py-2.5 rounded-2xl font-black text-sm shadow-lg shadow-[#7B2FBE]/40 whitespace-nowrap"
          >
            {comment}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Team 1 – Right column */}
        <div
          className="w-[18%] min-w-[70px] flex flex-col items-center justify-center py-6 px-2 border-l border-gray-100"
          style={{ background: "rgba(123,47,190,0.03)" }}
        >
          <div className="text-5xl font-black text-[#7B2FBE] leading-none">{scores.team1}</div>
          <div className="text-[11px] font-bold text-gray-500 mt-2 text-center leading-tight">{gameData.team1Name}</div>
        </div>

        {/* Center – Question + answer */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-5 overflow-y-auto">

          {/* Timer – above question */}
          <div
            onClick={() => setRunning(r => !r)}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl cursor-pointer transition-all font-black text-lg select-none ${
              timer > 20 ? "bg-red-100 text-red-500" : timer > 10 ? "bg-yellow-100 text-yellow-600" : "bg-purple-100 text-[#7B2FBE]"
            }`}
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            {formatTime(timer)}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={currentIndex}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              className="w-full max-w-lg"
            >
              {/* Question – no card frame */}
              <div className="px-2 py-2 text-center">
                <div className="flex items-center justify-center gap-2 mb-4 text-[48px]">
                  <div className="w-7 h-7 rounded-full bg-[#7B2FBE] text-white font-black flex items-center justify-center flex-shrink-0 text-[48px]">
                    {currentIndex + 1}
                  </div>
                  <span className="font-bold text-gray-400 uppercase tracking-wider text-[48px]">سؤال</span>
                </div>
                <p className="text-gray-900 text-[70px] font-black text-center">{currentQ.questionText}</p>
                {currentQ.questionImage && (
                  <img src={currentQ.questionImage} alt="" className="w-full rounded-xl object-contain max-h-48 mt-4 border border-gray-100" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Answer area */}
          <AnimatePresence>
            {!showAnswer ? (
              <motion.button key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileTap={{ scale: 0.96 }} onClick={handleReveal}
                className="w-full max-w-lg py-4 rounded-2xl bg-[#7B2FBE] text-white font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-[#7B2FBE]/30 hover:bg-[#8B35D6] transition-colors"
              >
                <Eye size={20} /> إظهار الإجابة
              </motion.button>
            ) : (
              <motion.div key="answer" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-3">
                {/* Answer card */}
                <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-[#7B2FBE]/20 rounded-3xl p-5">
                  <p className="text-xs font-bold text-[#7B2FBE] uppercase tracking-wider mb-2">✅ الإجابة</p>
                  <p className="text-lg font-black text-gray-900 leading-relaxed">{currentQ.answerText}</p>
                  {currentQ.answerImage && (
                    <img src={currentQ.answerImage} alt="" className="w-full rounded-xl object-contain max-h-40 mt-3 border border-purple-100" />
                  )}
                </div>
                {/* Who scored */}
                <p className="text-center text-sm font-bold text-gray-500">منو جاوب؟ 🎯</p>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleScore("team1")}
                    className="py-3 rounded-xl bg-[#7B2FBE] text-white font-black text-sm hover:bg-[#8B35D6] transition-colors">
                    {gameData.team1Name}
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleScore("none")}
                    className="py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-sm hover:bg-gray-200 transition-colors">
                    لا أحد
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleScore("team2")}
                    className="py-3 rounded-xl bg-[#7B2FBE] text-white font-black text-sm hover:bg-[#8B35D6] transition-colors">
                    {gameData.team2Name}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Team 2 – Left column */}
        <div
          className="w-[18%] min-w-[70px] flex flex-col items-center justify-center py-6 px-2 border-r border-gray-100"
          style={{ background: "rgba(123,47,190,0.03)" }}
        >
          <div className="text-5xl font-black text-[#7B2FBE] leading-none">{scores.team2}</div>
          <div className="text-[11px] font-bold text-gray-500 mt-2 text-center leading-tight">{gameData.team2Name}</div>
        </div>
      </div>
      {/* End Game Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          >
            <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
            >
              <div className="bg-gradient-to-l from-[#7B2FBE] to-[#5a1f8e] p-8 text-center">
                <Trophy size={56} className="text-yellow-300 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-white mb-1">
                  {winnerTeam ? `🏆 فاز ${winnerTeam}!` : "🤝 تعادل!"}
                </h2>
                <p className="text-white/70 text-sm">{gameData.gameName}</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-around mb-6">
                  <div className="text-center">
                    <p className="text-4xl font-black text-[#7B2FBE]">{scores.team1}</p>
                    <p className="text-sm text-gray-500 font-bold mt-1">{gameData.team1Name}</p>
                  </div>
                  <div className="text-gray-300 font-black text-2xl">VS</div>
                  <div className="text-center">
                    <p className="text-4xl font-black text-[#7B2FBE]">{scores.team2}</p>
                    <p className="text-sm text-gray-500 font-bold mt-1">{gameData.team2Name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleRestart}
                    className="py-3 rounded-xl border-2 border-[#7B2FBE] text-[#7B2FBE] font-black text-sm hover:bg-purple-50 transition-colors">
                    إعادة اللعبة 🔄
                  </button>
                  <button onClick={handleExit}
                    className="py-3 rounded-xl bg-[#7B2FBE] text-white font-black text-sm hover:bg-[#8B35D6] transition-colors">
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
