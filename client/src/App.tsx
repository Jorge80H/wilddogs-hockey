import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";

// Public Pages
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import Tournaments from "@/pages/Tournaments";
import Contact from "@/pages/Contact";

// Private Pages
import PlayerDashboard from "@/pages/PlayerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";

function Router() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  return (
    <Switch>
      {/* Public Routes - Always accessible */}
      <Route path="/" component={isLoading || !isAuthenticated ? Landing : (isAdmin ? AdminDashboard : PlayerDashboard)} />
      <Route path="/nosotros" component={About} />
      <Route path="/servicios" component={Services} />
      <Route path="/categorias" component={Categories} />
      <Route path="/categorias/:id" component={CategoryDetail} />
      <Route path="/torneos" component={Tournaments} />
      <Route path="/contacto" component={Contact} />

      {/* Private Routes - Require Authentication */}
      <Route path="/dashboard" component={PlayerDashboard} />
      <Route path="/admin" component={AdminDashboard} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
