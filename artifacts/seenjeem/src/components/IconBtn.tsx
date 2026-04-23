import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IconBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  tooltipPos?: "top" | "bottom";
  disabled?: boolean;
}

export function IconBtn({
  icon, label, onClick, className = "", style, tooltipPos = "bottom", disabled,
}: IconBtnProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [pendingTap, setPendingTap] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouch = useRef(false);

  const clear = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const dismiss = useCallback(() => {
    clear();
    setShowTooltip(false);
    setPendingTap(false);
  }, []);

  useEffect(() => () => clear(), []);

  const handleTouchStart = () => { isTouch.current = true; };

  const handleClick = useCallback(() => {
    if (disabled) return;
    if (isTouch.current) {
      if (!pendingTap) {
        setShowTooltip(true);
        setPendingTap(true);
        clear();
        timerRef.current = setTimeout(dismiss, 1600);
      } else {
        dismiss();
        onClick();
      }
    } else {
      onClick();
    }
  }, [disabled, pendingTap, onClick, dismiss]);

  const handleMouseEnter = () => { if (!isTouch.current) setShowTooltip(true); };
  const handleMouseLeave = () => { if (!isTouch.current) setShowTooltip(false); };

  const posStyle: React.CSSProperties =
    tooltipPos === "top"
      ? { bottom: "calc(100% + 8px)", top: "auto" }
      : { top: "calc(100% + 8px)", bottom: "auto" };

  return (
    <div className="relative flex items-center justify-center" style={{ isolation: "isolate" }}>
      <button
        aria-label={label}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        className={`w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 ${className}`}
        style={style}
      >
        {icon}
      </button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: tooltipPos === "top" ? 4 : -4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPos === "top" ? 4 : -4, scale: 0.92 }}
            transition={{ duration: 0.13 }}
            className="absolute z-50 pointer-events-none whitespace-nowrap"
            style={{
              ...posStyle,
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(10,5,25,0.88)",
              color: "#fff",
              fontSize: "11px",
              fontWeight: 700,
              padding: "5px 11px",
              borderRadius: "9px",
              boxShadow: "0 4px 18px rgba(0,0,0,0.35)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
