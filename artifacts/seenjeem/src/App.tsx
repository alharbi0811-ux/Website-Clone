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
    const root = document.getElementById("root");
    if (!root) return;

    if (isMobile) {
      if (document.getElementById("iphone-wrapper-outer")) return;

      const wrapper = document.createElement("div");
      wrapper.id = "iphone-wrapper-outer";
      wrapper.style.cssText =
        "position:fixed;top:0;left:0;width:100vw;height:100vh;" +
        "display:flex;justify-content:center;align-items:center;" +
        "background:#0f0f0f;z-index:9999;";

      const frame = document.createElement("div");
      frame.style.cssText =
        "width:393px;height:852px;background:#1a1a1a;" +
        "border-radius:54px;padding:14px;flex-shrink:0;position:relative;" +
        "box-shadow:0 0 0 1px #444,0 0 0 3px #222,0 40px 100px rgba(0,0,0,0.95)," +
        "inset 0 0 0 1px #333;";

      const dynamicIsland = document.createElement("div");
      dynamicIsland.style.cssText =
        "position:absolute;top:16px;left:50%;transform:translateX(-50%);" +
        "width:126px;height:37px;background:#000;border-radius:20px;z-index:10001;";

      const screen = document.createElement("div");
      screen.id = "iphone-screen-inner";
      screen.style.cssText =
        "width:100%;height:100%;background:white;" +
        "border-radius:42px;overflow-y:auto;overflow-x:hidden;" +
        "position:relative;will-change:transform;";

      screen.appendChild(root);
      frame.appendChild(dynamicIsland);
      frame.appendChild(screen);
      wrapper.appendChild(frame);
      document.body.appendChild(wrapper);
      document.body.style.overflow = "hidden";

      return () => {
        const w = document.getElementById("iphone-wrapper-outer");
        if (w) {
          document.body.insertBefore(root, w);
          w.remove();
        }
        document.body.style.overflow = "";
      };
    } else {
      const w = document.getElementById("iphone-wrapper-outer");
      if (w) {
        document.body.insertBefore(root, w);
        w.remove();
      }
      document.body.style.overflow = "";
    }
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
