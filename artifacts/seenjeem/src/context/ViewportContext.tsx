import { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "desktop" | "mobile";

interface ViewportContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const ViewportContext = createContext<ViewportContextType>({
  viewMode: "desktop",
  setViewMode: () => {},
});

export function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  return (
    <ViewportContext.Provider value={{ viewMode, setViewMode }}>
      {children}
    </ViewportContext.Provider>
  );
}

export const useViewport = () => useContext(ViewportContext);
