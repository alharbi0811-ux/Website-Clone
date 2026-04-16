import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ViewportProvider, useViewport } from "@/context/ViewportContext";
import { useEffect, useState } from "react";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import StartGame from "@/pages/StartGame";
import ScorePage from "@/pages/ScorePage";
import QuestionPage from "@/pages/QuestionPage";
import LoginPage from "@/pages/LoginPage";
import HistoryPage from "@/pages/HistoryPage";
import WinPage from "@/pages/WinPage";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCategoryForm from "@/pages/admin/AdminCategoryForm";
import AdminCategoryQuestions from "@/pages/admin/AdminCategoryQuestions";
import AdminQuestionForm from "@/pages/admin/AdminQuestionForm";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAllQuestions from "@/pages/admin/AdminAllQuestions";
import AdminQRTemplates from "@/pages/admin/AdminQRTemplates";

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;
  if (!user.isAdmin) return <Redirect to="/" />;
  return <AdminLayout>{children}</AdminLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/start-game" component={StartGame} />
      <Route path="/score-page" component={ScorePage} />
      <Route path="/question" component={QuestionPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/win-page" component={WinPage} />

      <Route path="/admin">
        <AdminGuard><AdminDashboard /></AdminGuard>
      </Route>
      <Route path="/admin/categories">
        <AdminGuard><AdminCategories /></AdminGuard>
      </Route>
      <Route path="/admin/questions">
        <AdminGuard><AdminAllQuestions /></AdminGuard>
      </Route>
      <Route path="/admin/categories/new">
        <AdminGuard><AdminCategoryForm /></AdminGuard>
      </Route>
      <Route path="/admin/categories/:id/edit">
        <AdminGuard><AdminCategoryForm /></AdminGuard>
      </Route>
      <Route path="/admin/categories/:id/questions">
        <AdminGuard><AdminCategoryQuestions /></AdminGuard>
      </Route>
      <Route path="/admin/questions/new">
        <AdminGuard><AdminQuestionForm /></AdminGuard>
      </Route>
      <Route path="/admin/questions/-1">
        <Redirect to="/admin/questions/new" />
      </Route>
      <Route path="/admin/questions/:id/edit">
        <AdminGuard><AdminQuestionForm /></AdminGuard>
      </Route>
      <Route path="/admin/users">
        <AdminGuard><AdminUsers /></AdminGuard>
      </Route>
      <Route path="/admin/qr-templates">
        <AdminGuard><AdminQRTemplates /></AdminGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

const ZOOM_KEY = "rakez-zoom-level";
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

function ZoomControls() {
  const { viewMode } = useViewport();
  const isMobile = viewMode === "mobile";

  const [zoom, setZoom] = useState<number>(() => {
    const saved = localStorage.getItem(ZOOM_KEY);
    return saved ? parseFloat(saved) : 1;
  });

  useEffect(() => {
    const app = document.getElementById("app-root");
    if (!app) return;
    if (isMobile) {
      app.style.transform = `scale(${zoom})`;
      app.style.transformOrigin = "top center";
    }
  }, [zoom, isMobile]);

  function change(delta: number) {
    setZoom(prev => {
      const next = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, parseFloat((prev + delta).toFixed(2))));
      localStorage.setItem(ZOOM_KEY, String(next));
      return next;
    });
  }

  function reset() {
    localStorage.setItem(ZOOM_KEY, "1");
    setZoom(1);
  }

  return (
    <div className="zoom-controls">
      <button onClick={() => change(-ZOOM_STEP)} title="تصغير">−</button>
      <span className="zoom-level">{Math.round(zoom * 100)}%</span>
      <button onClick={() => change(ZOOM_STEP)} title="تكبير">+</button>
      <button onClick={reset} title="إعادة الحجم" style={{ fontSize: 14 }}>↺</button>
    </div>
  );
}

function AppContent() {
  const { viewMode } = useViewport();
  const isMobile = viewMode === "mobile";

  useEffect(() => {
    if (isMobile) {
      document.body.classList.add("iphone-mode");
    } else {
      document.body.classList.remove("iphone-mode");
      const app = document.getElementById("app-root");
      if (app) {
        app.style.transform = "";
        app.style.transformOrigin = "";
      }
    }
    return () => {
      document.body.classList.remove("iphone-mode");
      const app = document.getElementById("app-root");
      if (app) {
        app.style.transform = "";
        app.style.transformOrigin = "";
      }
    };
  }, [isMobile]);

  return (
    <div id="app-root" dir="rtl" className="light w-full min-h-screen">
      <ZoomControls />
      <Router />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ViewportProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <AppContent />
            </WouterRouter>
            <Toaster />
          </ViewportProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
