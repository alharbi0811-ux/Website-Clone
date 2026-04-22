import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useLocation } from "wouter";
import { Eye, Pause, Play, LogOut, Trophy, Zap, Shield } from "lucide-react";
import confetti from "canvas-confetti";

/* ─────────────────────────── Types ─────────────────────────── */
type Question = { id: number; questionText: string; questionImage?: string; answerText: string; answerImage?: string };
type GameData = { gameName: string; gender: "male" | "female"; team1Name: string; team2Name: string; questions: Question[] };
type Scores   = { team1: number; team2: number };
type Team     = "team1" | "team2";
type Particle = { id: number; angle: number; dist: number; color: string };

/* ─────────────────────────── Constants ─────────────────────── */
const TIMED_COMMENTS: Record<number, { male: string[]; female: string[] }> = {
  5:  { male: ["يلا ركّز 👀", "قريبة منك يا بطل!"],  female: ["يلا ركّزي 👀", "قريبة منك يا بطلة!"] },
  10: { male: ["فكّر شوي 🤔", "مو صعبة ترى!"],       female: ["فكري شوي 🤔", "مو صعبة ترى!"] },
  15: { male: ["شد حيلك 🔥", "ركز أكثر يا وحش!"],    female: ["شدّي حيلك 🔥", "ركزي أكثر!"] },
  20: { male: ["أسرع شوي 😏", "لا تضيع الوقت!"],     female: ["أسرعي شوي 😏", "لا تضيعين الوقت!"] },
};
const BURST_COLORS = ["#7B2FBE", "#a855f7", "#fbbf24", "#3b82f6", "#10b981", "#f472b6"];
const TIMER_MAX = 30;
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? "";

/* ─────────────────── Ring Timer Component ───────────────────── */
function RingTimer({ timer, running, onToggle }: { timer: number; running: boolean; onToggle: () => void }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const prog = Math.min(timer / TIMER_MAX, 1);
  const offset = circ * (1 - prog);
  const danger = timer > 20;
  const warn   = timer > 10;
  const ringColor = danger ? "#ef4444" : warn ? "#f59e0b" : "#7B2FBE";
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      onClick={onToggle}
      className="relative cursor-pointer select-none"
      whileTap={{ scale: 0.93 }}
      animate={danger && running ? { scale: [1, 1.06, 1] } : { scale: 1 }}
      transition={danger && running ? { repeat: Infinity, duration: 0.7 } : {}}
    >
      <svg width={108} height={108} style={{ transform: "rotate(-90deg)" }}>
        {/* track */}
        <circle cx={54} cy={54} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={7} />
        {/* progress */}
        <motion.circle
          cx={54} cy={54} r={r} fill="none"
          stroke={ringColor} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-black leading-none" style={{ fontSize: 22, color: ringColor }}>{fmtTime(timer)}</span>
        <span style={{ fontSize: 13, color: "#9ca3af" }}>{running ? <Pause size={13}/> : <Play size={13}/>}</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────── Burst Particles ───────────────────────── */
function BurstParticles({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map(p => {
        const dx = Math.cos(p.angle) * p.dist;
        const dy = Math.sin(p.angle) * p.dist;
        return (
          <motion.div key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: dx, y: dy, scale: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute w-3 h-3 rounded-full pointer-events-none"
            style={{ background: p.color, zIndex: 20, top: "50%", left: "50%", marginTop: -6, marginLeft: -6 }}
          />
        );
      })}
    </AnimatePresence>
  );
}

/* ─────────────────── Screen Flash ──────────────────────────── */
function ScreenFlash({ color, active }: { color: string; active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0.45 }} animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-50"
          style={{ background: color }}
        />
      )}
    </AnimatePresence>
  );
}

/* ─────────────────── Round Splash ──────────────────────────── */
function RoundSplash({ show, round, total }: { show: boolean; round: number; total: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(30,0,60,0.82)", backdropFilter: "blur(6px)" }}
        >
          <div className="text-center">
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ scaleX: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-[#a855f7] font-black tracking-[0.4em] text-sm mb-2"
              >
                ROUND
              </motion.p>
              <div className="flex items-center justify-center gap-3">
                <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  className="h-[3px] w-12 rounded-full" style={{ background: "linear-gradient(90deg,transparent,#a855f7)" }} />
                <motion.p
                  initial={{ scale: 0.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 18, delay: 0.05 }}
                  className="font-black text-white"
                  style={{ fontSize: 80, lineHeight: 1, textShadow: "0 0 40px rgba(168,85,247,0.8), 0 0 80px rgba(123,47,190,0.5)" }}
                >
                  {round}
                </motion.p>
                <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  className="h-[3px] w-12 rounded-full" style={{ background: "linear-gradient(90deg,#a855f7,transparent)" }} />
              </div>
              <p className="text-white/30 font-black tracking-widest text-xs mt-2">OF {total}</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────── Main Component ────────────────────────── */
export default function StudyModeGame() {
  const [, navigate] = useLocation();
  const [gameData, setGameData]     = useState<GameData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores]         = useState<Scores>({ team1: 0, team2: 0 });
  const [timer, setTimer]           = useState(0);
  const [running, setRunning]       = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [comment, setComment]       = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [roundSplash, setRoundSplash]   = useState(true);

  /* gaming states */
  const [lastScorer, setLastScorer]           = useState<Team | null>(null);
  const [correctFlash, setCorrectFlash]       = useState(false);
  const [missFlash, setMissFlash]             = useState(false);
  const [team1Particles, setTeam1Particles]   = useState<Particle[]>([]);
  const [team2Particles, setTeam2Particles]   = useState<Particle[]>([]);
  const [t1ShakeKey, setT1ShakeKey]           = useState(0);
  const [t2ShakeKey, setT2ShakeKey]           = useState(0);
  const [xpFloat, setXpFloat]                 = useState<{ id: number; team: Team }[]>([]);
  const xpRef = useRef(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commentTimeouts = useRef<number[]>([]);

  /* ── Init ── */
  useEffect(() => {
    const stored = localStorage.getItem("rakez-study-game");
    if (!stored) { navigate("/study-setup"); return; }
    setGameData(JSON.parse(stored));
    const s = localStorage.getItem("rakez-study-scores");
    const i = localStorage.getItem("rakez-study-index");
    if (s) setScores(JSON.parse(s));
    if (i) setCurrentIndex(Number(i));
  }, []);

  /* ── Reset per question + Round splash ── */
  useEffect(() => {
    if (!gameData) return;
    setTimer(0); setRunning(false); setShowAnswer(false); setComment(null); setLastScorer(null);
    setRoundSplash(true);
    const t = setTimeout(() => { setRoundSplash(false); setRunning(true); }, 850);
    return () => { clearTimeout(t); commentTimeouts.current.forEach(clearTimeout); commentTimeouts.current = []; };
  }, [currentIndex, gameData]);

  /* ── Timer ── */
  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  /* ── Smart comments ── */
  useEffect(() => {
    if (!gameData || !running) return;
    const g = gameData.gender === "female" ? "female" : "male";
    for (const t of [5, 10, 15, 20]) {
      if (timer === t && TIMED_COMMENTS[t]) {
        const msgs = TIMED_COMMENTS[t][g];
        if (msgs?.length) {
          setComment(pick(msgs));
          commentTimeouts.current.push(window.setTimeout(() => setComment(null), 2500));
        }
      }
    }
  }, [timer, running, gameData]);

  /* ── Persist ── */
  useEffect(() => {
    localStorage.setItem("rakez-study-scores", JSON.stringify(scores));
    localStorage.setItem("rakez-study-index", String(currentIndex));
  }, [scores, currentIndex]);

  /* ── Confetti ── */
  const fireConfetti = useCallback(() => {
    const fire = (opts: confetti.Options) => confetti({ ...opts, colors: ["#7B2FBE", "#a855f7", "#fbbf24", "#3b82f6", "#10b981"] });
    fire({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => fire({ particleCount: 60, angle: 60,  spread: 55, origin: { x: 0, y: 0.7 } }), 250);
    setTimeout(() => fire({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } }), 400);
    setTimeout(() => fire({ particleCount: 40, spread: 100, origin: { y: 0.4 } }), 700);
  }, []);

  /* ── Burst helper ── */
  const spawnBurst = (team: Team) => {
    const count = 10;
    const ps: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / count) * 2 * Math.PI,
      dist: 50 + Math.random() * 40,
      color: BURST_COLORS[i % BURST_COLORS.length],
    }));
    if (team === "team1") {
      setTeam1Particles(ps);
      setTimeout(() => setTeam1Particles([]), 800);
    } else {
      setTeam2Particles(ps);
      setTimeout(() => setTeam2Particles([]), 800);
    }
  };

  const spawnXp = (team: Team) => {
    const id = ++xpRef.current;
    setXpFloat(prev => [...prev, { id, team }]);
    setTimeout(() => setXpFloat(prev => prev.filter(x => x.id !== id)), 1000);
  };

  /* ── Handlers ── */
  const currentQ = gameData?.questions[currentIndex];
  const total    = gameData?.questions.length ?? 0;
  const isLast   = currentIndex >= total - 1;

  const handleReveal = () => { setRunning(false); setShowAnswer(true); setComment(null); };

  const handleScore = (team: Team | "none") => {
    if (team !== "none") {
      setScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
      setLastScorer(team);
      spawnBurst(team);
      spawnXp(team);
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 60);
      if (team === "team1") setT1ShakeKey(k => k + 1);
      else setT2ShakeKey(k => k + 1);
      setTimeout(() => setLastScorer(null), 1400);
    } else {
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 60);
    }
    if (isLast) { setShowEndModal(true); setTimeout(fireConfetti, 200); }
    else setCurrentIndex(i => i + 1);
  };

  const handleExit = () => {
    ["rakez-study-game","rakez-study-scores","rakez-study-index"].forEach(k => localStorage.removeItem(k));
    navigate("/");
  };

  const handleRestart = () => {
    const gd = JSON.parse(localStorage.getItem("rakez-study-game") || "{}");
    gd.questions = (gd.questions || []).sort(() => Math.random() - 0.5);
    localStorage.setItem("rakez-study-game", JSON.stringify(gd));
    setScores({ team1: 0, team2: 0 }); setCurrentIndex(0);
    setShowEndModal(false); setShowAnswer(false); setLastScorer(null);
  };

  if (!gameData || !currentQ) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-[#7B2FBE]/20 border-t-[#7B2FBE] rounded-full animate-spin" />
    </div>
  );

  const winnerTeam = scores.team1 > scores.team2 ? gameData.team1Name
    : scores.team2 > scores.team1 ? gameData.team2Name : null;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden" dir="rtl"
      style={{ fontFamily: "'Lalezar', 'Cairo', sans-serif" }}>

      {/* Round splash */}
      <RoundSplash show={roundSplash} round={currentIndex + 1} total={total} />

      {/* Screen flashes */}
      <ScreenFlash color="rgba(123,47,190,0.25)" active={correctFlash} />
      <ScreenFlash color="rgba(239,68,68,0.2)"   active={missFlash}    />

      {/* ══ TOP HUD BAR ══ */}
      <div className="flex-shrink-0 px-3 py-2.5 flex items-center justify-between"
        style={{ background: "linear-gradient(135deg,#7B2FBE 0%,#4a1a7e 100%)", boxShadow: "0 2px 20px rgba(123,47,190,0.5)" }}>

        <button onClick={handleExit}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.12)" }}>
          <LogOut size={15} />
        </button>

        {/* Game name */}
        <div className="flex-1 text-center px-2">
          <p className="text-white font-black text-xs truncate">{gameData.gameName}</p>
        </div>

        {/* Round badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.15)" }}>
          <Shield size={12} className="text-white/80" />
          <span className="text-white font-black text-xs">{currentIndex + 1} / {total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] flex-shrink-0" style={{ background: "rgba(123,47,190,0.12)" }}>
        <motion.div className="h-full"
          style={{ background: "linear-gradient(90deg,#7B2FBE,#c084fc)" }}
          animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Smart comment */}
      <AnimatePresence>
        {comment && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1,  y: 0,   scale: 1   }}
            exit={  { opacity: 0,  y: -16, scale: 0.9  }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 text-white px-5 py-2 rounded-2xl font-black text-sm whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 0 20px rgba(123,47,190,0.55)" }}
          >
            {comment}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ 3-COLUMN ARENA ══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── TEAM 1 (Right) ── */}
        <motion.div
          key={`t1-${t1ShakeKey}`}
          animate={t1ShakeKey > 0 ? { x: [0,-8,8,-5,5,-2,2,0] } : {}}
          transition={{ duration: 0.45 }}
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{
            width: "18%", minWidth: 64,
            borderLeft: lastScorer === "team1" ? "2px solid rgba(123,47,190,0.5)" : "1px solid rgba(0,0,0,0.05)",
            background: lastScorer === "team1"
              ? "linear-gradient(180deg, rgba(123,47,190,0.1) 0%, rgba(123,47,190,0.04) 100%)"
              : "rgba(123,47,190,0.015)",
            transition: "background 0.4s, border-color 0.4s",
          }}
        >
          {/* Burst */}
          <BurstParticles particles={team1Particles} />

          {/* XP float */}
          <AnimatePresence>
            {xpFloat.filter(x => x.team === "team1").map(x => (
              <motion.div key={x.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -70, scale: 1.5 }}
                className="absolute font-black pointer-events-none z-20"
                style={{ color: "#7B2FBE", fontSize: 18 }}
              >+1 ⚡</motion.div>
            ))}
          </AnimatePresence>

          {/* Correct badge */}
          <AnimatePresence>
            {lastScorer === "team1" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 text-xs font-black px-2 py-1 rounded-xl"
                style={{ background: "rgba(123,47,190,0.15)", color: "#7B2FBE" }}
              >✅ صح!</motion.div>
            )}
          </AnimatePresence>

          {/* Score */}
          <AnimatePresence mode="popLayout">
            <motion.div key={scores.team1}
              initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="font-black leading-none"
              style={{ fontSize: "clamp(44px,5.5vw,80px)", color: lastScorer === "team1" ? "#a855f7" : "#7B2FBE",
                       filter: lastScorer === "team1" ? "drop-shadow(0 0 10px rgba(168,85,247,0.7))" : "none",
                       transition: "color 0.4s, filter 0.4s" }}
            >{scores.team1}</motion.div>
          </AnimatePresence>

          <div className="mt-2 font-bold text-gray-600 text-center break-all px-1"
            style={{ fontSize: "clamp(13px,2vw,24px)", lineHeight: 1.2 }}>
            {gameData.team1Name}
          </div>
        </motion.div>

        {/* ── CENTER ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 py-4 gap-4 overflow-y-auto">

          {/* Ring Timer */}
          <RingTimer timer={timer} running={running} onToggle={() => setRunning(r => !r)} />

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1,  y: 0,  scale: 1   }}
              exit={  { opacity: 0,  y:-24,  scale: 0.95}}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl text-center"
            >
              <p className="font-black text-gray-900 leading-relaxed"
                style={{ fontSize: "clamp(26px,4vw,64px)" }}>
                {currentQ.questionText}
              </p>
              {currentQ.questionImage && (
                <img src={currentQ.questionImage} alt=""
                  className="w-full rounded-2xl object-contain max-h-52 mt-4 mx-auto"
                  style={{ border: "2px solid rgba(123,47,190,0.15)" }} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer zone */}
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.button key="reveal"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
                  onClick={handleReveal}
                  className="w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                    boxShadow: "0 6px 24px rgba(123,47,190,0.45)",
                    fontSize: "clamp(15px,1.8vw,20px)",
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
                  <motion.div
                    initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="rounded-2xl p-5 text-center"
                    style={{ background: "rgba(123,47,190,0.06)", border: "2px solid rgba(123,47,190,0.22)",
                             boxShadow: "0 0 20px rgba(123,47,190,0.12)" }}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#7B2FBE" }}>
                      ✅ الإجابة
                    </p>
                    <p className="font-black text-gray-900" style={{ fontSize: "clamp(17px,2.2vw,26px)" }}>
                      {currentQ.answerText}
                    </p>
                    {currentQ.answerImage && (
                      <img src={currentQ.answerImage} alt=""
                        className="w-full rounded-xl object-contain max-h-40 mt-3"
                        style={{ border: "1px solid rgba(123,47,190,0.15)" }} />
                    )}
                  </motion.div>

                  {/* Who scored */}
                  <p className="text-center font-bold text-gray-500" style={{ fontSize: "clamp(12px,1.4vw,15px)" }}>
                    منو جاوب؟ 🎯
                  </p>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Team 1 button */}
                    <motion.button whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.05 }}
                      onClick={() => handleScore("team1")}
                      className="py-3 rounded-xl text-white font-black"
                      style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                               boxShadow: "0 3px 14px rgba(123,47,190,0.4)", fontSize: "clamp(11px,1.4vw,15px)" }}>
                      {gameData.team1Name}
                    </motion.button>

                    {/* No one */}
                    <motion.button whileTap={{ scale: 0.93 }}
                      onClick={() => handleScore("none")}
                      className="py-3 rounded-xl font-black"
                      style={{ background: "#f1f5f9", color: "#64748b", fontSize: "clamp(11px,1.4vw,15px)" }}>
                      لا أحد
                    </motion.button>

                    {/* Team 2 button */}
                    <motion.button whileTap={{ scale: 0.93 }} whileHover={{ scale: 1.05 }}
                      onClick={() => handleScore("team2")}
                      className="py-3 rounded-xl text-white font-black"
                      style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                               boxShadow: "0 3px 14px rgba(123,47,190,0.4)", fontSize: "clamp(11px,1.4vw,15px)" }}>
                      {gameData.team2Name}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── TEAM 2 (Left) ── */}
        <motion.div
          key={`t2-${t2ShakeKey}`}
          animate={t2ShakeKey > 0 ? { x: [0,8,-8,5,-5,2,-2,0] } : {}}
          transition={{ duration: 0.45 }}
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{
            width: "18%", minWidth: 64,
            borderRight: lastScorer === "team2" ? "2px solid rgba(123,47,190,0.5)" : "1px solid rgba(0,0,0,0.05)",
            background: lastScorer === "team2"
              ? "linear-gradient(180deg, rgba(123,47,190,0.1) 0%, rgba(123,47,190,0.04) 100%)"
              : "rgba(123,47,190,0.015)",
            transition: "background 0.4s, border-color 0.4s",
          }}
        >
          <BurstParticles particles={team2Particles} />

          <AnimatePresence>
            {xpFloat.filter(x => x.team === "team2").map(x => (
              <motion.div key={x.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -70, scale: 1.5 }}
                className="absolute font-black pointer-events-none z-20"
                style={{ color: "#7B2FBE", fontSize: 18 }}
              >+1 ⚡</motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {lastScorer === "team2" && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="absolute top-4 text-xs font-black px-2 py-1 rounded-xl"
                style={{ background: "rgba(123,47,190,0.15)", color: "#7B2FBE" }}
              >✅ صح!</motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <motion.div key={scores.team2}
              initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="font-black leading-none"
              style={{ fontSize: "clamp(44px,5.5vw,80px)", color: lastScorer === "team2" ? "#a855f7" : "#7B2FBE",
                       filter: lastScorer === "team2" ? "drop-shadow(0 0 10px rgba(168,85,247,0.7))" : "none",
                       transition: "color 0.4s, filter 0.4s" }}
            >{scores.team2}</motion.div>
          </AnimatePresence>

          <div className="mt-2 font-bold text-gray-600 text-center break-all px-1"
            style={{ fontSize: "clamp(13px,2vw,24px)", lineHeight: 1.2 }}>
            {gameData.team2Name}
          </div>
        </motion.div>
      </div>

      {/* ══ VICTORY MODAL ══ */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>

            <motion.div
              initial={{ scale: 0.6, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="bg-white rounded-3xl overflow-hidden max-w-md w-full"
              style={{ boxShadow: "0 24px 80px rgba(123,47,190,0.5)" }}
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-6 text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#7B2FBE 0%,#4a1a7e 100%)" }}>
                {/* glow orb */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20 -translate-y-1/2"
                  style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

                <motion.div
                  animate={{ rotate: [0,-12,12,-6,6,0], scale: [1,1.15,1] }}
                  transition={{ duration: 0.9, delay: 0.3 }}>
                  <Trophy size={64} className="mx-auto mb-3"
                    style={{ color: "#fbbf24", filter: "drop-shadow(0 0 16px rgba(251,191,36,0.7))" }} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-2xl font-black text-white mb-1">
                  {winnerTeam ? `🏆 فاز ${winnerTeam}!` : "🤝 تعادل!"}
                </motion.h2>
                <p className="text-white/60 text-sm">{gameData.gameName}</p>
              </div>

              {/* Score cards */}
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-stretch gap-3 mb-5">
                  {[
                    { name: gameData.team1Name, score: scores.team1, isWinner: winnerTeam === gameData.team1Name },
                    { name: gameData.team2Name, score: scores.team2, isWinner: winnerTeam === gameData.team2Name },
                  ].map((team, idx) => (
                    <motion.div key={idx} className="flex-1 rounded-2xl p-4 text-center"
                      style={{
                        background: team.isWinner ? "rgba(123,47,190,0.1)" : "#f8fafc",
                        border: team.isWinner ? "2px solid #7B2FBE" : "2px solid #e2e8f0",
                        boxShadow: team.isWinner ? "0 0 20px rgba(123,47,190,0.25)" : "none",
                      }}
                      animate={team.isWinner ? { scale: [1, 1.04, 1] } : {}}
                      transition={{ delay: 0.7, duration: 0.4, repeat: 2 }}
                    >
                      {team.isWinner && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }}>
                          <Zap size={18} className="mx-auto mb-1" style={{ color: "#7B2FBE" }} />
                        </motion.div>
                      )}
                      <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                        className="font-black" style={{ fontSize: 48, color: "#7B2FBE" }}>
                        {team.score}
                      </motion.p>
                      <p className="text-sm font-bold text-gray-500 mt-0.5">{team.name}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pb-6">
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
                    onClick={handleRestart}
                    className="py-3.5 rounded-xl font-black text-sm transition-all"
                    style={{ border: "2px solid #7B2FBE", color: "#7B2FBE" }}>
                    🔄 إعادة التحدي
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}
                    onClick={handleExit}
                    className="py-3.5 rounded-xl text-white font-black text-sm"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 4px 18px rgba(123,47,190,0.45)" }}>
                    الخروج
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
