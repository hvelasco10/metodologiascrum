import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import ScrumBoard from "./pages/ScrumBoard";
import SprintsPage from "./pages/SprintsPage";
import BacklogPage from "./pages/BacklogPage";
import TeamPage from "./pages/TeamPage";
import ReportsPage from "./pages/ReportsPage";
import Auth from "./pages/Auth";
import Setup from "./pages/Setup";
import UsersAdmin from "./pages/UsersAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/setup" element={<Setup />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<ProtectedRoute section="dashboard"><Dashboard /></ProtectedRoute>} />
                      <Route path="/board" element={<ProtectedRoute section="board"><ScrumBoard /></ProtectedRoute>} />
                      <Route path="/sprints" element={<ProtectedRoute section="sprints"><SprintsPage /></ProtectedRoute>} />
                      <Route path="/backlog" element={<ProtectedRoute section="backlog"><BacklogPage /></ProtectedRoute>} />
                      <Route path="/team" element={<ProtectedRoute section="team"><TeamPage /></ProtectedRoute>} />
                      <Route path="/reports" element={<ProtectedRoute section="reports"><ReportsPage /></ProtectedRoute>} />
                      <Route path="/users" element={<ProtectedRoute section="admin"><UsersAdmin /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
