
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/Admin";
import Login from "./pages/Login";
import AgentAppointment from "./pages/AgentAppointment";
import { getCurrentMember } from "./lib/auth";

const queryClient = new QueryClient();

// Enhanced authentication guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const member = getCurrentMember();
  const location = useLocation();
  
  if (!member) {
    // Redirect to login while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Auth guard for the login page to prevent authenticated users from accessing it
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const member = getCurrentMember();
  const location = useLocation();
  
  if (member) {
    // Redirect to the page they came from or default to admin
    return <Navigate to={(location.state?.from?.pathname) || "/admin"} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AuthRoute>
                  <Login />
                </AuthRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/agent-appointment" 
              element={<AgentAppointment />} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
