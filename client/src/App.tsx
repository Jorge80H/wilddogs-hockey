import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { lazy, Suspense } from "react";

// Landing carga eager (página más visitada)
import Landing from "@/pages/Landing";
import NotFound from "@/pages/not-found";

// Todas las demás páginas cargan lazy (code splitting)
const About          = lazy(() => import("@/pages/About"));
const Services       = lazy(() => import("@/pages/Services"));
const Categories     = lazy(() => import("@/pages/Categories"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const Tournaments    = lazy(() => import("@/pages/Tournaments"));
const Contact        = lazy(() => import("@/pages/Contact"));
const Login          = lazy(() => import("@/pages/Login"));
const LeadLanding    = lazy(() => import("@/pages/LeadLanding"));
const PlayerDashboard = lazy(() => import("@/pages/PlayerDashboard"));
const AdminDashboard  = lazy(() => import("@/pages/AdminDashboard"));

// Spinner mínimo para el Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);



function Router() {
  // Use the centralized useAuth hook that queries InstantDB
  const { isLoading, user, isAdmin, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando...</div>
      </div>
    );
  }

  // Determine which dashboard to show based on role
  const getDashboard = () => {
    if (!isAuthenticated) return Landing;
    return isAdmin ? AdminDashboard : PlayerDashboard;
  };

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public Routes - Always accessible */}
        <Route path="/" component={getDashboard()} />
        <Route path="/nosotros" component={About} />
        <Route path="/servicios" component={Services} />
        <Route path="/categorias" component={Categories} />
        <Route path="/categorias/:id" component={CategoryDetail} />
        <Route path="/torneos" component={Tournaments} />
        <Route path="/contacto" component={Contact} />
        <Route path="/login" component={Login} />
        <Route path="/unete" component={LeadLanding} />

        {/* Private Routes - Require Authentication */}
        <Route path="/dashboard" component={isAuthenticated ? PlayerDashboard : Login} />
        <Route path="/admin" component={isAdmin ? AdminDashboard : Login} />

        {/* 404 */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
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
