import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Eye, Pause, Play, LogOut, Trophy, Zap, Shield, Sun, Moon, Check, X } from "lucide-react";
import confetti from "canvas-confetti";

/* ─── Types ─── */
type Question = { id: number; questionText: string; questionImage?: string; answerText: string; answerImage?: string };
type GameData  = { gameName: string; gender: "male" | "female"; team1Name: string; team2Name: string; questions: Question[] };
type Scores    = { team1: number; team2: number };
type Team      = "team1" | "team2";
type Particle  = { id: number; angle: number; dist: number; color: string };
type Theme     = "light" | "dark";

/* ─── Constants ─── */
const TIMED_COMMENTS: Record<number, { male: string[]; female: string[] }> = {
  5:  { male: ["يلا ركّز", "قريبة منك يا بطل!"],    female: ["يلا ركّزي", "قريبة منك يا بطلة!"] },
  10: { male: ["فكّر شوي", "مو صعبة ترى!"],          female: ["فكري شوي", "مو صعبة ترى!"] },
  15: { male: ["شد حيلك", "ركز أكثر يا وحش!"],       female: ["شدّي حيلك", "ركزي أكثر!"] },
  20: { male: ["أسرع شوي", "لا تضيع الوقت!"],         female: ["أسرعي شوي", "لا تضيعين الوقت!"] },
};
const BURST_COLORS = ["#7B2FBE","#a855f7","#fbbf24","#3b82f6","#10b981","#f472b6"];
const TIMER_MAX = 30;
const THEME_KEY = "rakez-theme";
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)] ?? "";

/* ─── Theme palettes ─── */
const TH = {
  light: {
    bg: "#ffffff",
    border: "rgba(0,0,0,0.06)",
    text: "#111827",
    textSub: "#6b7280",
    teamColBg: "rgba(123,47,190,0.015)",
    teamColBgActive: "rgba(123,47,190,0.09)",
    teamBorderActive: "rgba(123,47,190,0.45)",
    teamBorderIdle: "rgba(0,0,0,0.04)",
    answerBg: "rgba(123,47,190,0.06)",
    answerBorder: "rgba(123,47,190,0.22)",
    noOneBg: "#f1f5f9",
    noOneColor: "#64748b",
    progressBg: "rgba(123,47,190,0.1)",
    scanline: "none",
    scoreColor: "#7B2FBE",
    scoreColorActive: "#a855f7",
    victoryCard: "#ffffff",
    questionGlow: "none",
    particleColor: "rgba(123,47,190,0.12)",
  },
  dark: {
    bg: "#08001a",
    border: "rgba(168,85,247,0.12)",
    text: "#ede8ff",
    textSub: "rgba(255,255,255,0.45)",
    teamColBg: "rgba(168,85,247,0.04)",
    teamColBgActive: "rgba(168,85,247,0.13)",
    teamBorderActive: "rgba(168,85,247,0.6)",
    teamBorderIdle: "rgba(168,85,247,0.06)",
    answerBg: "rgba(168,85,247,0.12)",
    answerBorder: "rgba(168,85,247,0.4)",
    noOneBg: "rgba(255,255,255,0.08)",
    noOneColor: "rgba(255,255,255,0.5)",
    progressBg: "rgba(168,85,247,0.15)",
    scanline: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.018) 3px,rgba(255,255,255,0.018) 4px)",
    scoreColor: "#c084fc",
    scoreColorActive: "#e879f9",
    victoryCard: "#130026",
    questionGlow: "0 0 40px rgba(168,85,247,0.15)",
    particleColor: "rgba(168,85,247,0.22)",
  },
};

/* ═══════════════ EFFECT COMPONENTS ═══════════════ */

/* ── Ambient Floating Particles ── */
const AMBIENT = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: `${8 + i * 9}%`, size: 2 + (i % 3),
  dur: 5 + i * 1.1, delay: i * 0.55,
}));
function AmbientParticles({ dark, active }: { dark: boolean; active: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {AMBIENT.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-full"
          style={{ left: p.x, bottom: -8, width: p.size, height: p.size, background: dark ? `rgba(168,85,247,${0.18 + (p.id % 3) * 0.08})` : `rgba(123,47,190,${0.09 + (p.id % 3) * 0.04})` }}
          animate={{ y: [0, -340], opacity: [0, active ? 0.9 : 0.5, 0.4, 0], x: [0, (p.id % 2 === 0 ? 18 : -18)] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ── Round Splash ── */
function RoundSplash({ show, round, total }: { show: boolean; round: number; total: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(20,0,45,0.9)", backdropFilter: "blur(10px)" }}>
          <div className="text-center">
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }} className="overflow-hidden">
              <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.55, repeat: Infinity }}
                className="font-black tracking-[0.45em] text-sm mb-2" style={{ color: "#a855f7" }}>ROUND</motion.p>
              <div className="flex items-center justify-center gap-4">
                <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  className="h-[3px] w-16 rounded-full" style={{ background: "linear-gradient(90deg,transparent,#a855f7)" }} />
                <motion.p initial={{ scale: 0.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 600, damping: 16, delay: 0.05 }}
                  className="font-black text-white"
                  style={{ fontSize: 96, lineHeight: 1, textShadow: "0 0 60px rgba(168,85,247,1),0 0 120px rgba(123,47,190,0.7)" }}>
                  {round}
                </motion.p>
                <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                  className="h-[3px] w-16 rounded-full" style={{ background: "linear-gradient(90deg,#a855f7,transparent)" }} />
              </div>
              <p className="font-black tracking-widest text-xs mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>OF {total}</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Correct Overlay ── */
function CorrectOverlay({ show, teamName }: { show: boolean; teamName: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(10,0,30,0.35)", backdropFilter: "blur(2px)" }}>
          <motion.div
            initial={{ scale: 0.2, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 1.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 700, damping: 22 }}
            className="relative text-center px-10 py-7 rounded-3xl"
            style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 0 80px rgba(123,47,190,0.8),0 0 160px rgba(123,47,190,0.4)" }}>

            {/* Shimmer */}
            <motion.div animate={{ x: ["-200%","200%"] }} transition={{ duration: 0.7, ease: "linear" }}
              className="absolute inset-0 rounded-3xl pointer-events-none overflow-hidden">
              <div className="w-1/2 h-full" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)" }} />
            </motion.div>

            <motion.div animate={{ rotate: [0,-8,8,-4,0], scale: [1,1.2,1] }} transition={{ duration: 0.5 }}>
              <Check size={52} className="text-white mx-auto mb-2" strokeWidth={3} />
            </motion.div>
            <p className="text-white font-black" style={{ fontSize: 34, textShadow: "0 0 20px rgba(255,255,255,0.5)" }}>صح!</p>
            {teamName && <p className="text-white/70 font-black text-sm mt-1 tracking-wide">{teamName}</p>}

            {/* Radiating rings */}
            {[0,1,2,3].map(i => (
              <motion.div key={i} className="absolute inset-0 rounded-3xl border-2"
                style={{ borderColor: i < 2 ? "rgba(168,85,247,0.7)" : "rgba(251,191,36,0.5)" }}
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }} />
            ))}
          </motion.div>

          {/* Gold sparkles */}
          {[0,1,2,3,4,5,6,7].map(i => {
            const a = (i / 8) * 2 * Math.PI;
            return (
              <motion.div key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{ background: i % 2 === 0 ? "#fbbf24" : "#a855f7", left: "50%", top: "50%" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(a) * (100 + i * 15), y: Math.sin(a) * (100 + i * 15), opacity: 0, scale: 0.3 }}
                transition={{ duration: 0.65, delay: 0.05, ease: "easeOut" }} />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Miss Overlay ── */
function MissOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          style={{ background: "rgba(80,0,0,0.2)", backdropFilter: "blur(1px)" }}>
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: [0,-12,12,-8,8,-4,4,0] }}
            exit={{ scale: 1.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 20 }}
            className="text-center px-10 py-7 rounded-3xl"
            style={{ background: "linear-gradient(135deg,#dc2626,#7f1d1d)", boxShadow: "0 0 70px rgba(220,38,38,0.7)" }}>
            <motion.div animate={{ rotate: [0,10,-10,0], scale: [1,1.15,1] }} transition={{ duration: 0.4 }}>
              <X size={52} className="text-white mx-auto mb-2" strokeWidth={3} />
            </motion.div>
            <p className="text-white font-black" style={{ fontSize: 32, textShadow: "0 0 20px rgba(255,255,255,0.4)" }}>لا أحد!</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Screen Flash ── */
function ScreenFlash({ color, active }: { color: string; active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0.5 }} animate={{ opacity: 0 }} transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-[49]" style={{ background: color }} />
      )}
    </AnimatePresence>
  );
}

/* ── Danger Border ── */
function DangerBorder({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-20 rounded-none"
          style={{ boxShadow: "inset 0 0 0 4px rgba(239,68,68,0.0)" }}>
          <motion.div className="absolute inset-0 pointer-events-none"
            animate={{ boxShadow: ["inset 0 0 0px rgba(239,68,68,0)","inset 0 0 40px rgba(239,68,68,0.45)","inset 0 0 0px rgba(239,68,68,0)"] }}
            transition={{ duration: 0.65, repeat: Infinity }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Burst Particles ── */
function BurstParticles({ particles }: { particles: Particle[] }) {
  return (
    <AnimatePresence>
      {particles.map(p => (
        <motion.div key={p.id}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{ opacity: 0, x: Math.cos(p.angle) * p.dist, y: Math.sin(p.angle) * p.dist, scale: 0.3 }}
          exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute w-3 h-3 rounded-full pointer-events-none"
          style={{ background: p.color, zIndex: 20, top: "50%", left: "50%", marginTop: -6, marginLeft: -6 }} />
      ))}
    </AnimatePresence>
  );
}

/* ── Ring Timer ── */
function RingTimer({ timer, running, onToggle, dark }: { timer: number; running: boolean; onToggle: () => void; dark: boolean }) {
  const r = 44, circ = 2 * Math.PI * r;
  const prog = Math.min(timer / TIMER_MAX, 1);
  const offset = circ * (1 - prog);
  const danger = timer > 20, warn = timer > 10;
  const ringColor = danger ? "#ef4444" : warn ? "#f59e0b" : "#7B2FBE";
  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
  return (
    <motion.div onClick={onToggle} className="relative cursor-pointer select-none"
      whileTap={{ scale: 0.93 }}
      animate={danger && running ? { scale: [1, 1.09, 1] } : { scale: 1 }}
      transition={danger && running ? { repeat: Infinity, duration: 0.6 } : {}}>
      {danger && running && (
        <motion.div className="absolute inset-0 rounded-full pointer-events-none"
          animate={{ boxShadow: ["0 0 0px rgba(239,68,68,0)","0 0 30px rgba(239,68,68,0.7)","0 0 0px rgba(239,68,68,0)"] }}
          transition={{ duration: 0.6, repeat: Infinity }} />
      )}
      {/* Outer pulse ring when danger */}
      {danger && running && (
        <motion.div className="absolute rounded-full border-2 border-red-500"
          style={{ inset: -8 }}
          animate={{ opacity: [0.7, 0], scale: [1, 1.3] }}
          transition={{ duration: 0.7, repeat: Infinity }} />
      )}
      <svg width={108} height={108} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={54} cy={54} r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} strokeWidth={7} />
        <motion.circle cx={54} cy={54} r={r} fill="none" stroke={ringColor} strokeWidth={7} strokeLinecap="round"
          strokeDasharray={circ} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.4, ease: "easeOut" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-black leading-none" style={{ fontSize: 22, color: ringColor,
          textShadow: danger ? `0 0 16px ${ringColor}` : "none" }}>{fmtTime(timer)}</span>
        <span style={{ fontSize: 13, color: dark ? "rgba(255,255,255,0.4)" : "#9ca3af" }}>
          {running ? <Pause size={13}/> : <Play size={13}/>}
        </span>
      </div>
    </motion.div>
  );
}

/* ══════════════ MAIN ══════════════ */
export default function StudyModeGame() {
  const [, navigate]  = useLocation();
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || "light");
  const [gameData, setGameData]     = useState<GameData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores]         = useState<Scores>({ team1: 0, team2: 0 });
  const [timer, setTimer]           = useState(0);
  const [running, setRunning]       = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [comment, setComment]       = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [roundSplash, setRoundSplash]   = useState(true);

  /* Effect states */
  const [lastScorer, setLastScorer]         = useState<Team | null>(null);
  const [correctFlash, setCorrectFlash]     = useState(false);
  const [missFlash, setMissFlash]           = useState(false);
  const [showCorrect, setShowCorrect]       = useState(false);
  const [correctTeamName, setCorrectTeamName] = useState("");
  const [showMiss, setShowMiss]             = useState(false);
  const [team1Particles, setTeam1Particles] = useState<Particle[]>([]);
  const [team2Particles, setTeam2Particles] = useState<Particle[]>([]);
  const [t1ShakeKey, setT1ShakeKey]         = useState(0);
  const [t2ShakeKey, setT2ShakeKey]         = useState(0);
  const [xpFloat, setXpFloat]               = useState<{ id: number; team: Team }[]>([]);
  const xpRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const commentTimeouts = useRef<number[]>([]);

  const isDark = theme === "dark";
  const t = TH[theme];
  const danger = timer > 20 && running;

  const toggleTheme = () => {
    const next: Theme = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
  };

  useEffect(() => {
    const stored = localStorage.getItem("rakez-study-game");
    if (!stored) { navigate("/study-setup"); return; }
    setGameData(JSON.parse(stored));
    const s = localStorage.getItem("rakez-study-scores");
    const i = localStorage.getItem("rakez-study-index");
    if (s) setScores(JSON.parse(s));
    if (i) setCurrentIndex(Number(i));
  }, []);

  useEffect(() => {
    if (!gameData) return;
    setTimer(0); setRunning(false); setShowAnswer(false); setComment(null); setLastScorer(null);
    setRoundSplash(true);
    const tmr = setTimeout(() => { setRoundSplash(false); setRunning(true); }, 850);
    return () => { clearTimeout(tmr); commentTimeouts.current.forEach(clearTimeout); commentTimeouts.current = []; };
  }, [currentIndex, gameData]);

  useEffect(() => {
    if (running) intervalRef.current = setInterval(() => setTimer(v => v + 1), 1000);
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => {
    if (!gameData || !running) return;
    const g = gameData.gender === "female" ? "female" : "male";
    for (const sec of [5, 10, 15, 20]) {
      if (timer === sec && TIMED_COMMENTS[sec]) {
        const msgs = TIMED_COMMENTS[sec][g];
        if (msgs?.length) {
          setComment(pick(msgs));
          commentTimeouts.current.push(window.setTimeout(() => setComment(null), 2500));
        }
      }
    }
  }, [timer, running, gameData]);

  useEffect(() => {
    localStorage.setItem("rakez-study-scores", JSON.stringify(scores));
    localStorage.setItem("rakez-study-index", String(currentIndex));
  }, [scores, currentIndex]);

  const fireConfetti = useCallback(() => {
    const fire = (opts: confetti.Options) => confetti({ ...opts, colors: ["#7B2FBE","#a855f7","#fbbf24","#3b82f6","#10b981","#f472b6"] });
    fire({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => fire({ particleCount: 70, angle: 60,  spread: 60, origin: { x: 0, y: 0.7 } }), 250);
    setTimeout(() => fire({ particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.7 } }), 400);
    setTimeout(() => fire({ particleCount: 50, spread: 110, origin: { y: 0.4 } }), 700);
  }, []);

  const spawnBurst = (team: Team) => {
    const ps: Particle[] = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i, angle: (i / 12) * 2 * Math.PI,
      dist: 55 + Math.random() * 45, color: BURST_COLORS[i % BURST_COLORS.length],
    }));
    if (team === "team1") { setTeam1Particles(ps); setTimeout(() => setTeam1Particles([]), 800); }
    else { setTeam2Particles(ps); setTimeout(() => setTeam2Particles([]), 800); }
  };

  const spawnXp = (team: Team) => {
    const id = ++xpRef.current;
    setXpFloat(prev => [...prev, { id, team }]);
    setTimeout(() => setXpFloat(prev => prev.filter(x => x.id !== id)), 1000);
  };

  const currentQ = gameData?.questions[currentIndex];
  const total    = gameData?.questions.length ?? 0;
  const isLast   = currentIndex >= total - 1;

  const handleReveal = () => { setRunning(false); setShowAnswer(true); setComment(null); };

  const handleScore = (team: Team | "none") => {
    if (team !== "none") {
      setScores(prev => ({ ...prev, [team]: prev[team] + 1 }));
      setLastScorer(team);
      spawnBurst(team); spawnXp(team);
      setCorrectFlash(true);
      setTimeout(() => setCorrectFlash(false), 60);
      const name = gameData ? (team === "team1" ? gameData.team1Name : gameData.team2Name) : "";
      setCorrectTeamName(name);
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 900);
      if (team === "team1") setT1ShakeKey(k => k + 1); else setT2ShakeKey(k => k + 1);
      setTimeout(() => setLastScorer(null), 1600);
    } else {
      setMissFlash(true);
      setTimeout(() => setMissFlash(false), 60);
      setShowMiss(true);
      setTimeout(() => setShowMiss(false), 700);
    }
    if (isLast) { setShowEndModal(true); setTimeout(fireConfetti, 400); }
    else setTimeout(() => setCurrentIndex(i => i + 1), team !== "none" ? 950 : 750);
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
    <div className="min-h-screen flex items-center justify-center" style={{ background: t.bg }}>
      <div className="w-10 h-10 border-4 border-[#7B2FBE]/20 border-t-[#7B2FBE] rounded-full animate-spin" />
    </div>
  );

  const winnerTeam = scores.team1 > scores.team2 ? gameData.team1Name
    : scores.team2 > scores.team1 ? gameData.team2Name : null;

  return (
    <motion.div className="min-h-screen flex flex-col overflow-hidden" dir="rtl"
      animate={{ background: t.bg }}
      transition={{ duration: 0.4 }}
      style={{ fontFamily: "'Lalezar','Cairo',sans-serif", backgroundImage: t.scanline }}>

      {/* Dark mode grid */}
      {isDark && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.022]"
          style={{ backgroundImage: "linear-gradient(rgba(168,85,247,1) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,1) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      )}

      {/* All overlays */}
      <RoundSplash show={roundSplash} round={currentIndex + 1} total={total} />
      <CorrectOverlay show={showCorrect} teamName={correctTeamName} />
      <MissOverlay show={showMiss} />
      <DangerBorder active={danger} />
      <ScreenFlash color="rgba(123,47,190,0.22)" active={correctFlash} />
      <ScreenFlash color="rgba(239,68,68,0.18)"  active={missFlash} />

      {/* ── HUD ── */}
      <div className="flex-shrink-0 px-3 py-2.5 flex items-center justify-between relative z-10"
        style={{ background: "linear-gradient(135deg,#6d28d9,#3a1060)", boxShadow: isDark ? "0 2px 30px rgba(109,40,217,0.85)" : "0 2px 20px rgba(123,47,190,0.5)" }}>
        <motion.div animate={{ x: ["-100%","200%"] }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/3 h-full pointer-events-none opacity-10"
          style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent)" }} />

        <button onClick={handleExit}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white z-10"
          style={{ background: "rgba(255,255,255,0.12)" }}>
          <LogOut size={15} />
        </button>

        <div className="flex-1 text-center px-2 z-10">
          <p className="text-white font-black text-xs truncate">{gameData.gameName}</p>
        </div>

        <div className="flex items-center gap-2 z-10">
          <motion.button whileTap={{ scale: 0.85 }} onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.12)" }}>
            {isDark ? <Sun size={14} className="text-yellow-300" /> : <Moon size={14} className="text-white" />}
          </motion.button>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }} dir="ltr">
            <Shield size={12} className="text-white/80" />
            <span className="text-white font-black text-xs">{currentIndex + 1}/{total}</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-[3px] flex-shrink-0 relative z-10" style={{ background: t.progressBg }}>
        <motion.div className="h-full"
          style={{ background: danger ? "linear-gradient(90deg,#ef4444,#f97316)" : isDark ? "linear-gradient(90deg,#a855f7,#e879f9)" : "linear-gradient(90deg,#7B2FBE,#c084fc)" }}
          animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          transition={{ duration: 0.5 }} />
      </div>

      {/* Comment */}
      <AnimatePresence>
        {comment && (
          <motion.div initial={{ opacity: 0, y: -16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.9 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 text-white px-5 py-2 rounded-2xl font-black text-sm whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 0 24px rgba(123,47,190,0.6)" }}>
            {comment}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 3-COLUMN ARENA ── */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* Team 1 */}
        <motion.div key={`t1-${t1ShakeKey}`}
          animate={t1ShakeKey > 0 ? { x: [0,-10,10,-7,7,-3,3,0] } : {}}
          transition={{ duration: 0.45 }}
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{
            width: "18%", minWidth: 64,
            borderLeft: lastScorer === "team1" ? `2px solid ${t.teamBorderActive}` : `1px solid ${t.teamBorderIdle}`,
            background: lastScorer === "team1" ? t.teamColBgActive : t.teamColBg,
            transition: "background 0.4s, border-color 0.4s",
          }}>
          <AmbientParticles dark={isDark} active={lastScorer === "team1"} />
          <BurstParticles particles={team1Particles} />

          {/* XP float */}
          <AnimatePresence>
            {xpFloat.filter(x => x.team === "team1").map(x => (
              <motion.div key={x.id} initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -80, scale: 1.6 }}
                transition={{ duration: 0.9 }}
                className="absolute font-black pointer-events-none z-20 flex items-center gap-1"
                style={{ color: isDark ? "#fbbf24" : "#7B2FBE", fontSize: 20, filter: `drop-shadow(0 0 6px ${isDark ? "rgba(251,191,36,0.8)" : "rgba(123,47,190,0.5)"})` }}>
                +1 <Zap size={16} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Score */}
          <AnimatePresence mode="popLayout">
            <motion.div key={scores.team1} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="font-black leading-none"
              style={{
                fontSize: "clamp(44px,5.5vw,80px)",
                color: lastScorer === "team1" ? t.scoreColorActive : t.scoreColor,
                filter: lastScorer === "team1" ? `drop-shadow(0 0 14px ${isDark ? "rgba(232,121,249,0.9)" : "rgba(168,85,247,0.75)"})` : "none",
                transition: "color 0.4s, filter 0.4s",
              }}>
              {scores.team1}
            </motion.div>
          </AnimatePresence>

          <div className="mt-2 font-bold text-center break-all px-1"
            style={{ fontSize: "clamp(13px,2vw,24px)", lineHeight: 1.2, color: t.textSub }}>
            {gameData.team1Name}
          </div>
        </motion.div>

        {/* Center */}
        <div className="flex-1 flex flex-col items-center justify-center px-3 py-4 gap-4 overflow-y-auto relative">

          {/* Dark mode neon orb behind timer */}
          {isDark && (
            <motion.div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full pointer-events-none"
              animate={{ opacity: [0.04, 0.08, 0.04], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ background: "radial-gradient(circle,#7B2FBE,transparent 70%)" }} />
          )}

          <RingTimer timer={timer} running={running} onToggle={() => setRunning(r => !r)} dark={isDark} />

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.92 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl text-center relative">

              {/* Neon border for dark mode */}
              {isDark && (
                <motion.div className="absolute -inset-3 rounded-2xl pointer-events-none"
                  animate={{ boxShadow: ["0 0 0px rgba(168,85,247,0)","0 0 30px rgba(168,85,247,0.18)","0 0 0px rgba(168,85,247,0)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }} />
              )}

              <p className="font-black leading-relaxed relative z-10"
                style={{
                  fontSize: "clamp(26px,4vw,64px)", color: t.text,
                  textShadow: isDark ? "0 0 40px rgba(168,85,247,0.3)" : "none",
                }}>
                {currentQ.questionText}
              </p>
              {currentQ.questionImage && (
                <motion.img src={currentQ.questionImage} alt=""
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full rounded-2xl object-contain max-h-52 mt-4 mx-auto"
                  style={{ border: `2px solid ${isDark ? "rgba(168,85,247,0.25)" : "rgba(123,47,190,0.15)"}`,
                    boxShadow: isDark ? "0 0 20px rgba(168,85,247,0.15)" : "none" }} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Answer zone */}
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {!showAnswer ? (
                <motion.button key="reveal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, boxShadow: ["0 6px 24px rgba(123,47,190,0.4)","0 6px 38px rgba(123,47,190,0.68)","0 6px 24px rgba(123,47,190,0.4)"] }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ opacity: { duration: 0.3 }, y: { duration: 0.3 }, boxShadow: { duration: 2, repeat: Infinity } }}
                  whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.03 }}
                  onClick={handleReveal}
                  className="w-full py-4 rounded-2xl text-white font-black flex items-center justify-center gap-2"
                  style={{
                    background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                    fontSize: "clamp(15px,1.8vw,20px)",
                  }}>
                  <Eye size={20} /> إظهار الإجابة
                </motion.button>
              ) : (
                <motion.div key="answer" initial={{ opacity: 0, y: 14, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="space-y-3">

                  {/* Answer card */}
                  <motion.div
                    initial={{ scale: 0.88 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 450, damping: 18 }}
                    className="rounded-2xl p-5 text-center relative overflow-hidden"
                    style={{
                      background: t.answerBg,
                      border: `2px solid ${t.answerBorder}`,
                      boxShadow: isDark ? "0 0 40px rgba(168,85,247,0.2)" : "0 0 20px rgba(123,47,190,0.1)",
                    }}>
                    {/* Shimmer on reveal */}
                    <motion.div initial={{ x: "-100%" }} animate={{ x: "200%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent)", width: "50%" }} />

                    <p className="text-xs font-black tracking-widest mb-2" style={{ color: isDark ? "#a855f7" : "#7B2FBE" }}>
                      — الإجابة —
                    </p>
                    <p className="font-black" style={{ fontSize: "clamp(17px,2.2vw,26px)", color: t.text,
                      textShadow: isDark ? "0 0 20px rgba(168,85,247,0.3)" : "none" }}>
                      {currentQ.answerText}
                    </p>
                    {currentQ.answerImage && (
                      <img src={currentQ.answerImage} alt=""
                        className="w-full rounded-xl object-contain max-h-40 mt-3"
                        style={{ border: `1px solid ${t.answerBorder}` }} />
                    )}
                  </motion.div>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                    className="text-center font-bold" style={{ fontSize: "clamp(12px,1.4vw,15px)", color: t.textSub }}>
                    منو جاوب؟
                  </motion.p>

                  <motion.div className="grid grid-cols-3 gap-2"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <motion.button whileTap={{ scale: 0.91 }} whileHover={{ scale: 1.06 }}
                      onClick={() => handleScore("team1")}
                      className="py-3 rounded-xl text-white font-black relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                               boxShadow: isDark ? "0 3px 20px rgba(123,47,190,0.65)" : "0 3px 14px rgba(123,47,190,0.4)",
                               fontSize: "clamp(11px,1.4vw,15px)" }}>
                      {gameData.team1Name}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.91 }} onClick={() => handleScore("none")}
                      className="py-3 rounded-xl font-black"
                      style={{ background: t.noOneBg, color: t.noOneColor, fontSize: "clamp(11px,1.4vw,15px)" }}>
                      لا أحد
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.91 }} whileHover={{ scale: 1.06 }}
                      onClick={() => handleScore("team2")}
                      className="py-3 rounded-xl text-white font-black"
                      style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)",
                               boxShadow: isDark ? "0 3px 20px rgba(123,47,190,0.65)" : "0 3px 14px rgba(123,47,190,0.4)",
                               fontSize: "clamp(11px,1.4vw,15px)" }}>
                      {gameData.team2Name}
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Team 2 */}
        <motion.div key={`t2-${t2ShakeKey}`}
          animate={t2ShakeKey > 0 ? { x: [0,10,-10,7,-7,3,-3,0] } : {}}
          transition={{ duration: 0.45 }}
          className="relative flex flex-col items-center justify-center overflow-hidden"
          style={{
            width: "18%", minWidth: 64,
            borderRight: lastScorer === "team2" ? `2px solid ${t.teamBorderActive}` : `1px solid ${t.teamBorderIdle}`,
            background: lastScorer === "team2" ? t.teamColBgActive : t.teamColBg,
            transition: "background 0.4s, border-color 0.4s",
          }}>
          <AmbientParticles dark={isDark} active={lastScorer === "team2"} />
          <BurstParticles particles={team2Particles} />

          <AnimatePresence>
            {xpFloat.filter(x => x.team === "team2").map(x => (
              <motion.div key={x.id} initial={{ opacity: 1, y: 0, scale: 1 }} animate={{ opacity: 0, y: -80, scale: 1.6 }}
                transition={{ duration: 0.9 }}
                className="absolute font-black pointer-events-none z-20 flex items-center gap-1"
                style={{ color: isDark ? "#fbbf24" : "#7B2FBE", fontSize: 20, filter: `drop-shadow(0 0 6px ${isDark ? "rgba(251,191,36,0.8)" : "rgba(123,47,190,0.5)"})` }}>
                +1 <Zap size={16} />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            <motion.div key={scores.team2} initial={{ scale: 2.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 600, damping: 18 }}
              className="font-black leading-none"
              style={{
                fontSize: "clamp(44px,5.5vw,80px)",
                color: lastScorer === "team2" ? t.scoreColorActive : t.scoreColor,
                filter: lastScorer === "team2" ? `drop-shadow(0 0 14px ${isDark ? "rgba(232,121,249,0.9)" : "rgba(168,85,247,0.75)"})` : "none",
                transition: "color 0.4s, filter 0.4s",
              }}>
              {scores.team2}
            </motion.div>
          </AnimatePresence>

          <div className="mt-2 font-bold text-center break-all px-1"
            style={{ fontSize: "clamp(13px,2vw,24px)", lineHeight: 1.2, color: t.textSub }}>
            {gameData.team2Name}
          </div>
        </motion.div>
      </div>

      {/* ── VICTORY MODAL ── */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}>
            <motion.div
              initial={{ scale: 0.5, y: 60, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              className="rounded-3xl overflow-hidden max-w-md w-full"
              style={{ background: t.victoryCard, boxShadow: isDark ? "0 24px 80px rgba(168,85,247,0.55)" : "0 24px 80px rgba(123,47,190,0.45)" }}>

              <div className="px-8 pt-8 pb-6 text-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)" }}>
                <motion.div animate={{ x: ["-100%","200%"] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-1/2 h-full opacity-10"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)" }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 -translate-y-1/2 rounded-full opacity-15"
                  style={{ background: "radial-gradient(circle,#fff,transparent 70%)" }} />

                <motion.div animate={{ rotate: [0,-15,15,-8,8,0], scale: [1,1.18,1] }} transition={{ duration: 1, delay: 0.3 }}>
                  <Trophy size={68} className="mx-auto mb-3"
                    style={{ color: "#fbbf24", filter: "drop-shadow(0 0 24px rgba(251,191,36,0.9))" }} />
                </motion.div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="text-2xl font-black text-white mb-1">
                  {winnerTeam ? `فاز ${winnerTeam}!` : "تعادل!"}
                </motion.h2>
                <p className="text-white/55 text-sm">{gameData.gameName}</p>
              </div>

              <div className="px-6 pt-5 pb-2">
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { name: gameData.team1Name, score: scores.team1, win: scores.team1 > scores.team2 },
                    { name: gameData.team2Name, score: scores.team2, win: scores.team2 > scores.team1 },
                  ].map((team, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.1 }}
                      className="rounded-2xl p-4 text-center"
                      style={team.win ? {
                        background: "linear-gradient(135deg,rgba(123,47,190,0.15),rgba(123,47,190,0.05))",
                        border: "2px solid rgba(123,47,190,0.35)",
                        boxShadow: "0 0 24px rgba(123,47,190,0.2)",
                      } : {
                        background: isDark ? "rgba(255,255,255,0.04)" : "#f8f7ff",
                        border: `2px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      }}>
                      {team.win && (
                        <motion.p animate={{ opacity: [0.6,1,0.6] }} transition={{ duration: 1.2, repeat: Infinity }}
                          className="text-[10px] font-black tracking-widest mb-1" style={{ color: "#a855f7" }}>
                          WINNER
                        </motion.p>
                      )}
                      <p className="font-black text-3xl" style={{ color: isDark ? "#f0e8ff" : "#7B2FBE" }}>{team.score}</p>
                      <p className="font-bold text-xs mt-1" style={{ color: t.textSub }}>{team.name}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-2 pb-4">
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleRestart}
                    className="w-full py-3.5 rounded-xl text-white font-black flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#7B2FBE,#4a1a7e)", boxShadow: "0 4px 20px rgba(123,47,190,0.45)" }}>
                    <Zap size={17} /> العب مجدداً
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.96 }} onClick={handleExit}
                    className="w-full py-3 rounded-xl font-black text-sm"
                    style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#f1f5f9", color: t.textSub }}>
                    خروج
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
