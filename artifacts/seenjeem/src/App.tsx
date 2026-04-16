import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ViewportProvider, useViewport } from "@/context/ViewportContext";
import { useEffect } from "react";

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

function AppContent() {
  const { viewMode } = useViewport();
  const isMobile = viewMode === "mobile";

  useEffect(() => {
    const BASE_W = 390;
    const BASE_H = 844;

    function applyIphoneScale() {
      const app = document.getElementById("app-root");
      if (!app) return;
      const scaleX = window.innerWidth / BASE_W;
      const scaleY = window.innerHeight / BASE_H;
      const scale = Math.min(scaleX, scaleY);
      app.style.transform = `scale(${scale})`;
      app.style.transformOrigin = "top center";
      app.style.width = `${100 / scale}%`;
      app.style.height = `${100 / scale}%`;
    }

    function resetIphoneScale() {
      const app = document.getElementById("app-root");
      if (!app) return;
      app.style.transform = "";
      app.style.transformOrigin = "";
      app.style.width = "";
      app.style.height = "";
    }

    function onResize() {
      if (document.body.classList.contains("iphone-mode")) {
        applyIphoneScale();
      }
    }

    if (isMobile) {
      document.documentElement.classList.add("iphone-mode");
      document.body.classList.add("iphone-mode");
      applyIphoneScale();
      window.addEventListener("resize", onResize);
    } else {
      document.documentElement.classList.remove("iphone-mode");
      document.body.classList.remove("iphone-mode");
      resetIphoneScale();
    }

    return () => {
      document.documentElement.classList.remove("iphone-mode");
      document.body.classList.remove("iphone-mode");
      resetIphoneScale();
      window.removeEventListener("resize", onResize);
    };
  }, [isMobile]);

  return (
    <div id="app-root" dir="rtl" className="light w-full min-h-screen">
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
