import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { db } from "@/lib/instant";
import NotFound from "@/pages/not-found";

// Public Pages
import Landing from "@/pages/Landing";
import About from "@/pages/About";
import Services from "@/pages/Services";
import Categories from "@/pages/Categories";
import CategoryDetail from "@/pages/CategoryDetail";
import Tournaments from "@/pages/Tournaments";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";

// Private Pages
import PlayerDashboard from "@/pages/PlayerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminFinance from "@/pages/AdminFinance";
import AdminDocuments from "@/pages/AdminDocuments";

function Router() {
  const { isLoading, user } = db.useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes - Always accessible */}
      <Route path="/" component={user ? (user.email?.includes('admin') ? AdminDashboard : PlayerDashboard) : Landing} />
      <Route path="/nosotros" component={About} />
      <Route path="/servicios" component={Services} />
      <Route path="/categorias" component={Categories} />
      <Route path="/categorias/:id" component={CategoryDetail} />
      <Route path="/torneos" component={Tournaments} />
      <Route path="/contacto" component={Contact} />
      <Route path="/login" component={Login} />

      {/* Private Routes - Require Authentication */}
      <Route path="/dashboard" component={user ? PlayerDashboard : Login} />
      <Route path="/admin" component={user ? AdminDashboard : Login} />
      <Route path="/admin/finance" component={user ? AdminFinance : Login} />
      <Route path="/admin/documents" component={user ? AdminDocuments : Login} />

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
