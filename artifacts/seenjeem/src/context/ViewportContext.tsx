import { createContext, useContext, ReactNode } from "react";

interface ViewportContextType {
  viewMode: "desktop";
}

const ViewportContext = createContext<ViewportContextType>({ viewMode: "desktop" });

export function ViewportProvider({ children }: { children: ReactNode }) {
  return (
    <ViewportContext.Provider value={{ viewMode: "desktop" }}>
      {children}
    </ViewportContext.Provider>
  );
}

export const useViewport = () => useContext(ViewportContext);
