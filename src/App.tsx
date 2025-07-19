
import { useEffect } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
    // If user is authenticated and trying to access auth page, redirect to dashboard
    if (user && location.pathname === '/auth') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
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
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
