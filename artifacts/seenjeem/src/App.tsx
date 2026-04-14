import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ViewportProvider, useViewport } from "@/context/ViewportContext";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import StartGame from "@/pages/StartGame";
import ScorePage from "@/pages/ScorePage";
import QuestionPage from "@/pages/QuestionPage";
import LoginPage from "@/pages/LoginPage";
import HistoryPage from "@/pages/HistoryPage";

import AdminLayout from "@/components/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCategoryForm from "@/pages/admin/AdminCategoryForm";
import AdminCategoryQuestions from "@/pages/admin/AdminCategoryQuestions";
import AdminQuestionForm from "@/pages/admin/AdminQuestionForm";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminAllQuestions from "@/pages/admin/AdminAllQuestions";

const queryClient = new QueryClient();

const IPHONE_W = 844;
const IPHONE_H = 390;

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

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { viewMode, scale } = useViewport();
  const isMobile = viewMode === "mobile";

  if (isMobile) {
    const offsetX = (window.innerWidth - IPHONE_W * scale) / 2;
    const offsetY = (window.innerHeight - IPHONE_H * scale) / 2;
    return (
      <>
        <div style={{ background: "#000", position: "fixed", inset: 0, zIndex: 0 }} />
        <div
          id="app-root"
          dir="rtl"
          className="light"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: `${IPHONE_W}px`,
            height: `${IPHONE_H}px`,
            overflow: "hidden",
            transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
            transformOrigin: "top left",
            zIndex: 1,
          }}
        >
          <Router />
        </div>
      </>
    );
  }

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
