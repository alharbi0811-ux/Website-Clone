import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";

import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import StartGame from "@/pages/StartGame";
import ScorePage from "@/pages/ScorePage";
import QuestionPage from "@/pages/QuestionPage";
import LoginPage from "@/pages/LoginPage";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/start-game" component={StartGame} />
      <Route path="/score-page" component={ScorePage} />
      <Route path="/question" component={QuestionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <div dir="rtl" className="light w-full min-h-screen">
              <Router />
            </div>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
