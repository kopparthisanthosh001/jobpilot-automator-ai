
import { useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfileSetup from "./pages/dashboard/ProfileSetup";
import AppliedJobs from "./pages/dashboard/AppliedJobs";
import AllMatches from "./pages/dashboard/AllMatches";
import TriggerScraping from "./pages/dashboard/TriggerScraping";
import ATSOptimizer from "./pages/dashboard/ATSOptimizer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthWrapper = () => {
  const user = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log("AuthWrapper - Current user:", user);
    console.log("AuthWrapper - Current path:", location.pathname);
    
    // Only redirect authenticated users from landing page to dashboard
    // Don't redirect from auth page to allow explicit login/signup
    if (user && location.pathname === '/') {
      console.log("Redirecting authenticated user from landing to dashboard");
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="profile-setup" element={<ProfileSetup />} />
          <Route path="applied" element={<AppliedJobs />} />
          <Route path="matches" element={<AllMatches />} />
          <Route path="scrape" element={<TriggerScraping />} />
          <Route path="ats-optimizer" element={<ATSOptimizer />} />
          <Route path="resume-analysis" element={<ATSOptimizer />} />
          <Route path="analytics" element={<ATSOptimizer />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

const App = () => {
  console.log("App component rendering");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthWrapper />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
