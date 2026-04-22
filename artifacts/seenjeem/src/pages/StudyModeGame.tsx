import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Eye, Pause, Play, LogOut, Trophy, Zap, Star } from "lucide-react";
import confetti from "canvas-confetti";

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
type Team = "team1" | "team2";

const TIMED_COMMENTS: Record<number, { male: string[]; female: string[] }> = {
  5:  { male: ["يلا ركّز 👀", "قريبة منك يا بطل!"],   female: ["يلا ركّزي 👀", "قريبة منك يا بطلة!"] },
  10: { male: ["فكّر شوي 🤔", "مو صعبة ترى!"],        female: ["فكري شوي 🤔", "مو صعبة ترى!"] },
  15: { male: ["شد حيلك 🔥", "ركز أكثر يا وحش!"],     female: ["شدّي حيلك 🔥", "ركزي أكثر!"] },
  20: { male: ["أسرع شوي 😏", "قاعد تفكر زيادة!"],    female: ["أسرعي شوي 😏", "قاعدة تفكرين زيادة!"] },
};

const pick = (arr: string[]): string =>
  arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "";

/* ── XP popup particle ── */
type XpParticle = { id: number; team: Team };

/* ── Shake animation ── */
const shakeAnim = {
  x: [0, -8, 8, -6, 6, -3, 3, 0],
  transition: { duration: 0.5 },
};

export default function StudyModeGame() {
  const [, navigate] = useLocation();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 });
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [comment, setComment] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);

  /* gaming state */
  const [lastScorer, setLastScorer] = useState<Team | null>(null);
  const [xpParticles, setXpParticles] = useState<XpParticle[]>([]);
  const [nooneShake, setNooneShake] = useState(false);
  const xpCounter = useRef(0);

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

  useEffect(() => {
    if (!gameData) return;
    setTimer(0);
    setRunning(true);
    setShowAnswer(false);
    setComment(null);
    setLastScorer(null);
    return () => { commentTimeouts.current.forEach(clearTimeout); commentTimeouts.current = []; };
  }, [currentIndex, gameData]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    if (!gameData || !running) return;
    const gender = gameData.gender;
    for (const t of [5, 10, 15, 20]) {
      if (timer === t && TIMED_COMMENTS[t]) {
        const g = gender === "female" ? "female" : "male";
        const msgs = TIMED_COMMENTS[t][g];
        if (msgs?.length) {
          setComment(pick(msgs));
          const timeout = window.setTimeout(() => setComment(null), 2500);
          commentTimeouts.current.push(timeout);
        }
      }
    }
  }, [timer, running, gameData]);

  useEffect(() => {
    localStorage.setItem("rakez-study-scores", JSON.stringify(scores));
    localStorage.setItem("rakez-study-index", String(currentIndex));
  }, [scores, currentIndex]);

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ["#7B2FBE", "#a855f7", "#fbbf24", "#3b82f6", "#10b981"] });
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.3 }, angle: 60, colors: ["#7B2FBE", "#fbbf24"] }), 300);
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.3 }, angle: 120, colors: ["#3b82f6", "#10b981"] }), 500);
  }, []);

  const spawnXp = (team: Team) => {
    const id = ++xpCounter.current;
    setXpParticles(prev => [...prev, { id, team }]);
    setTimeout(() => setXpParticles(prev => prev.filter(p => p.id !== id)), 1200);
  };

  const currentQ = gameData?.questions[currentIndex];
  const total = gameData?.questions.length ?? 0;
  const isLast = currentIndex >= total - 1;
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleReveal = () => {
    setRunning(false);
    setShowAnswer(true);
    setComment(null);
  };

  const handleScore = (team: Team | "none") => {
    if (team !== "none") {
      setScores(prev => {
        const next = { ...prev, [team]: prev[team] + 1 };
        localStorage.setItem("rakez-study-scores", JSON.stringify(next));
        return next;
      });
      setLastScorer(team);
      spawnXp(team);
      setTimeout(() => setLastScorer(null), 1200);
    } else {
      setNooneShake(true);
      setTimeout(() => setNooneShake(false), 600);
    }
    if (isLast) {
      setShowEndModal(true);
      setTimeout(fireConfetti, 200);
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
    setLastScorer(null);
  };

  if (!gameData || !currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white" dir="rtl">
        <div className="w-8 h-8 border-4 border-[#7B2FBE]/20 border-t-[#7B2FBE] rounded-full animate-spin" />
      </div>
    );
  }

  const winnerTeam = scores.team1 > scores.team2 ? gameData.team1Name
    : scores.team2 > scores.team1 ? gameData.team2Name : null;

  const timerColor = timer > 20 ? "#ef4444" : timer > 10 ? "#f59e0b" : "#7B2FBE";
  const timerBg   = timer > 20 ? "rgba(239,68,68,0.1)" : timer > 10 ? "rgba(245,158,11,0.1)" : "rgba(123,47,190,0.08)";

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl" style={{ fontFamily: "'Lalezar', sans-serif" }}>

      {/* ══ TOP BAR ══ */}
      <div
        className="px-4 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #5a1f8e 100%)", boxShadow: "0 4px 24px rgba(123,47,190,0.35)" }}
      >
        <button onClick={handleExit}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}
        >
          <LogOut size={16} />
        </button>

        <div className="text-center flex-1 px-2">
          <p className="text-white font-black text-sm truncate">{gameData.gameName}</p>
        </div>

        {/* Question counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          <div className="w-5 h-5 rounded-full bg-white font-black text-xs flex items-center justify-center"
            style={{ color: "#7B2FBE" }}>
            {currentIndex + 1}
          </div>
          <span className="text-white font-bold text-xs">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 flex-shrink-0" style={{ background: "rgba(123,47,190,0.1)" }}>
        <motion.div
          className="h-full"
          style={{ background: "linear-gradient(90deg, #7B2FBE, #a855f7)" }}
          animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Smart comment toast */}
      <AnimatePresence>
        {comment && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-40 text-white px-5 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap"
            style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 0 20px rgba(123,47,190,0.5)" }}
          >
            {comment}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ MAIN 3-COLUMN ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Team 1 (Right) ── */}
        <motion.div
          className="w-[18%] min-w-[70px] flex flex-col items-center justify-center py-6 px-2 relative overflow-hidden"
          animate={lastScorer === "team1"
            ? { boxShadow: ["0 0 0px rgba(123,47,190,0)", "0 0 32px rgba(123,47,190,0.6)", "0 0 16px rgba(123,47,190,0.3)"] }
            : { boxShadow: "0 0 0px rgba(123,47,190,0)" }}
          transition={{ duration: 0.6 }}
          style={{ borderLeft: lastScorer === "team1" ? "2px solid rgba(123,47,190,0.5)" : "1px solid rgba(0,0,0,0.06)", background: lastScorer === "team1" ? "rgba(123,47,190,0.06)" : "rgba(123,47,190,0.02)" }}
        >
          {/* XP particles */}
          <AnimatePresence>
            {xpParticles.filter(p => p.team === "team1").map(p => (
              <motion.div key={p.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute font-black text-sm pointer-events-none"
                style={{ color: "#7B2FBE", zIndex: 10 }}
              >
                +1 ⚡
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Score */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={scores.team1}
              initial={{ scale: 1.6, color: "#a855f7" }}
              animate={{ scale: 1, color: "#7B2FBE" }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="font-black leading-none"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              {scores.team1}
            </motion.div>
          </AnimatePresence>

          <div className="font-bold text-gray-600 mt-3 text-center break-all"
            style={{ fontSize: "clamp(14px, 2.5vw, 28px)", lineHeight: 1.2 }}>
            {gameData.team1Name}
          </div>

          {lastScorer === "team1" && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-1 text-xs font-black"
              style={{ color: "#7B2FBE" }}>
              <Star size={12} fill="#7B2FBE" /> إجابة صح!
            </motion.div>
          )}
        </motion.div>

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-4 overflow-y-auto">

          {/* Timer */}
          <motion.div
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl cursor-pointer select-none font-black"
            style={{ background: timerBg, color: timerColor, border: `1.5px solid ${timerColor}30`, fontSize: "clamp(18px, 2.5vw, 26px)" }}
            whileTap={{ scale: 0.95 }}
            animate={timer > 20 ? { scale: [1, 1.05, 1] } : {}}
            transition={timer > 20 ? { repeat: Infinity, duration: 0.8 } : {}}
          >
            {running ? <Pause size={18} /> : <Play size={18} />}
            {formatTime(timer)}
          </motion.div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              className="w-full max-w-2xl text-center"
            >
              <p className="text-gray-900 font-black leading-relaxed"
                style={{ fontSize: "clamp(28px, 4.5vw, 70px)" }}>
                {currentQ.questionText}
              </p>
              {currentQ.questionImage && (
                <img src={currentQ.questionImage} alt=""
                  className="w-full rounded-2xl object-contain max-h-52 mt-4 mx-auto"
                  style={{ border: "2px solid rgba(123,47,190,0.15)" }} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer area */}
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.button key="reveal"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}
                  onClick={handleReveal}
                  className="w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)",
                    boxShadow: "0 4px 20px rgba(123,47,190,0.4)",
                    fontSize: "clamp(16px, 2vw, 20px)",
                  }}
                >
                  <Eye size={20} /> إظهار الإجابة
                </motion.button>
              ) : (
                <motion.div key="answer"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Answer card */}
                  <div className="rounded-2xl p-5 text-center"
                    style={{ background: "rgba(123,47,190,0.06)", border: "2px solid rgba(123,47,190,0.2)" }}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#7B2FBE" }}>✅ الإجابة</p>
                    <p className="font-black text-gray-900" style={{ fontSize: "clamp(18px, 2.5vw, 26px)" }}>
                      {currentQ.answerText}
                    </p>
                    {currentQ.answerImage && (
                      <img src={currentQ.answerImage} alt=""
                        className="w-full rounded-xl object-contain max-h-40 mt-3"
                        style={{ border: "1px solid rgba(123,47,190,0.15)" }} />
                    )}
                  </div>

                  {/* Who scored */}
                  <p className="text-center font-bold text-gray-500" style={{ fontSize: "clamp(13px, 1.5vw, 16px)" }}>
                    منو جاوب؟ 🎯
                  </p>

                  <motion.div
                    animate={nooneShake ? shakeAnim : {}}
                    className="grid grid-cols-3 gap-2"
                  >
                    <motion.button whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.04 }}
                      onClick={() => handleScore("team1")}
                      className="py-3 rounded-xl text-white font-black transition-all"
                      style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 2px 12px rgba(123,47,190,0.3)", fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                      {gameData.team1Name}
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.94 }}
                      onClick={() => handleScore("none")}
                      className="py-3 rounded-xl font-black transition-all"
                      style={{ background: "#f1f5f9", color: "#64748b", fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                      لا أحد
                    </motion.button>

                    <motion.button whileTap={{ scale: 0.94 }} whileHover={{ scale: 1.04 }}
                      onClick={() => handleScore("team2")}
                      className="py-3 rounded-xl text-white font-black transition-all"
                      style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 2px 12px rgba(123,47,190,0.3)", fontSize: "clamp(12px, 1.5vw, 16px)" }}>
                      {gameData.team2Name}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Team 2 (Left) ── */}
        <motion.div
          className="w-[18%] min-w-[70px] flex flex-col items-center justify-center py-6 px-2 relative overflow-hidden"
          animate={lastScorer === "team2"
            ? { boxShadow: ["0 0 0px rgba(123,47,190,0)", "0 0 32px rgba(123,47,190,0.6)", "0 0 16px rgba(123,47,190,0.3)"] }
            : { boxShadow: "0 0 0px rgba(123,47,190,0)" }}
          transition={{ duration: 0.6 }}
          style={{ borderRight: lastScorer === "team2" ? "2px solid rgba(123,47,190,0.5)" : "1px solid rgba(0,0,0,0.06)", background: lastScorer === "team2" ? "rgba(123,47,190,0.06)" : "rgba(123,47,190,0.02)" }}
        >
          <AnimatePresence>
            {xpParticles.filter(p => p.team === "team2").map(p => (
              <motion.div key={p.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.4 }}
                exit={{ opacity: 0 }}
                className="absolute font-black text-sm pointer-events-none"
                style={{ color: "#7B2FBE", zIndex: 10 }}
              >
                +1 ⚡
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <motion.div
              key={scores.team2}
              initial={{ scale: 1.6, color: "#a855f7" }}
              animate={{ scale: 1, color: "#7B2FBE" }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="font-black leading-none"
              style={{ fontSize: "clamp(40px, 5vw, 72px)" }}
            >
              {scores.team2}
            </motion.div>
          </AnimatePresence>

          <div className="font-bold text-gray-600 mt-3 text-center break-all"
            style={{ fontSize: "clamp(14px, 2.5vw, 28px)", lineHeight: 1.2 }}>
            {gameData.team2Name}
          </div>

          {lastScorer === "team2" && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-1 text-xs font-black"
              style={{ color: "#7B2FBE" }}>
              <Star size={12} fill="#7B2FBE" /> إجابة صح!
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ══ END GAME MODAL ══ */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full"
              style={{ boxShadow: "0 20px 60px rgba(123,47,190,0.4)" }}
            >
              {/* Header */}
              <div className="p-8 text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, #7B2FBE 0%, #5a1f8e 100%)" }}>
                <motion.div
                  animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <Trophy size={60} className="mx-auto mb-3" style={{ color: "#fbbf24", filter: "drop-shadow(0 0 12px rgba(251,191,36,0.6))" }} />
                </motion.div>
                <h2 className="text-2xl font-black text-white mb-1">
                  {winnerTeam ? `🏆 فاز ${winnerTeam}!` : "🤝 تعادل!"}
                </h2>
                <p className="text-white/60 text-sm">{gameData.gameName}</p>
              </div>

              {/* Scores */}
              <div className="p-6">
                <div className="flex items-stretch gap-4 mb-6">
                  {/* Team 1 */}
                  <motion.div
                    className="flex-1 rounded-2xl p-4 text-center"
                    style={{
                      background: winnerTeam === gameData.team1Name ? "rgba(123,47,190,0.1)" : "#f8fafc",
                      border: winnerTeam === gameData.team1Name ? "2px solid #7B2FBE" : "2px solid transparent",
                      boxShadow: winnerTeam === gameData.team1Name ? "0 0 20px rgba(123,47,190,0.2)" : "none",
                    }}
                    animate={winnerTeam === gameData.team1Name ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ repeat: 2, duration: 0.5 }}
                  >
                    {winnerTeam === gameData.team1Name && (
                      <Zap size={16} className="mx-auto mb-1" style={{ color: "#7B2FBE" }} />
                    )}
                    <p className="font-black" style={{ fontSize: 44, color: "#7B2FBE" }}>{scores.team1}</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">{gameData.team1Name}</p>
                  </motion.div>

                  <div className="flex items-center font-black text-gray-300 text-xl">VS</div>

                  {/* Team 2 */}
                  <motion.div
                    className="flex-1 rounded-2xl p-4 text-center"
                    style={{
                      background: winnerTeam === gameData.team2Name ? "rgba(123,47,190,0.1)" : "#f8fafc",
                      border: winnerTeam === gameData.team2Name ? "2px solid #7B2FBE" : "2px solid transparent",
                      boxShadow: winnerTeam === gameData.team2Name ? "0 0 20px rgba(123,47,190,0.2)" : "none",
                    }}
                    animate={winnerTeam === gameData.team2Name ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ repeat: 2, duration: 0.5 }}
                  >
                    {winnerTeam === gameData.team2Name && (
                      <Zap size={16} className="mx-auto mb-1" style={{ color: "#7B2FBE" }} />
                    )}
                    <p className="font-black" style={{ fontSize: 44, color: "#7B2FBE" }}>{scores.team2}</p>
                    <p className="text-sm font-bold text-gray-500 mt-1">{gameData.team2Name}</p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handleRestart}
                    className="py-3 rounded-xl font-black text-sm transition-all hover:opacity-90"
                    style={{ border: "2px solid #7B2FBE", color: "#7B2FBE" }}>
                    إعادة اللعبة 🔄
                  </button>
                  <button onClick={handleExit}
                    className="py-3 rounded-xl text-white font-black text-sm transition-all hover:opacity-90"
                    style={{ background: "linear-gradient(135deg, #7B2FBE, #5a1f8e)", boxShadow: "0 4px 16px rgba(123,47,190,0.4)" }}>
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
