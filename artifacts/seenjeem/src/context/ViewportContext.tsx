import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";

type ViewMode = "desktop" | "mobile";

interface ViewportContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  scale: number;
}

const ViewportContext = createContext<ViewportContextType>({
  viewMode: "desktop",
  setViewMode: () => {},
  scale: 1,
});

const IPHONE_W = 844;
const IPHONE_H = 390;

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem("rakez-view-mode") as ViewMode) || "desktop";
  });
  const [scale, setScale] = useState(1);

  const setViewMode = (mode: ViewMode) => {
    localStorage.setItem("rakez-view-mode", mode);
    setViewModeState(mode);
  };

  useEffect(() => {
    if (viewMode !== "mobile") {
      setScale(1);
      return;
    }

    const calcScale = () => {
      const s = Math.min(window.innerWidth / IPHONE_W, window.innerHeight / IPHONE_H);
      setScale(s);
    };

    calcScale();
    window.addEventListener("resize", calcScale);
    return () => window.removeEventListener("resize", calcScale);
  }, [viewMode]);

  return (
    <ViewportContext.Provider value={{ viewMode, setViewMode, scale }}>
      {children}
    </ViewportContext.Provider>
  );
}

export const useViewport = () => useContext(ViewportContext);
