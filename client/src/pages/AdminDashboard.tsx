import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, DollarSign, Calendar, FileText, Trophy, Newspaper, LogOut } from "lucide-react";
import { Link } from "wouter";
import { db } from "@/lib/instant";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isLoading, error } = db.useAuth();

  // Check if user is admin (simple check: email contains 'admin')
  const isAdmin = user?.email?.includes('admin') || false;

  // Query stats
  const { data: playersData } = db.useQuery({ playerProfiles: {} });
  const { data: paymentsData } = db.useQuery({ payments: {} });
  const { data: matchesData } = db.useQuery({
    matches: {
      $: {
        where: {
          date: { $gt: Date.now() - 30 * 24 * 60 * 60 * 1000 }, // Last 30 days
        },
      },
    },
  });
  const { data: documentsData } = db.useQuery({
    documents: {
      $: {
        where: {
          status: "pending",
        },
      },
    },
  });

  const totalPlayers = playersData?.playerProfiles?.length || 0;
  const pendingDocuments = documentsData?.documents?.length || 0;
  const recentMatches = matchesData?.matches || [];
  const matchesThisMonth = recentMatches.length;
  const wins = recentMatches.filter((m) => m.result === "win").length;

  // Calculate monthly income
  const monthlyIncome = paymentsData?.payments
    ?.filter((p) => {
      const paymentDate = new Date(p.paymentDate).getTime();
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return paymentDate > thirtyDaysAgo;
    })
    .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [user, isLoading, toast]);

  useEffect(() => {
    if (!isLoading && user && !isAdmin) {
      toast({
        title: "Acceso Denegado",
        description: "No tienes permisos de administrador",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, [user, isLoading, isAdmin, toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSignOut = async () => {
    await db.auth.signOut();
    window.location.href = "/";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const adminSections = [
    {
      title: "Gestión de Usuarios",
      description: "Administrar jugadores, entrenadores y permisos",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Gestión Financiera",
      description: "Pagos, cartera y reportes financieros",
      icon: DollarSign,
      href: "/admin/finance",
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Torneos y Partidos",
      description: "Calendario, resultados y tablas",
      icon: Calendar,
      href: "/admin/tournaments",
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Noticias",
      description: "Publicar y editar noticias del club",
      icon: Newspaper,
      href: "/admin/news",
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Categorías",
      description: "Gestionar categorías, rosters y coaches",
      icon: Trophy,
      href: "/admin/categories",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    },
    {
      title: "Documentos",
      description: "Revisar y aprobar documentos",
      icon: FileText,
      href: "/admin/documents",
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Wild Dogs Hockey Club</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm" data-testid="button-home">
                  Ver Sitio Público
                </Button>
              </Link>
              <Avatar>
                <AvatarFallback>
                  {user.email?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{user.email}</div>
                <div className="text-sm text-muted-foreground">Administrador</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenido, Administrador</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Desde este panel puedes gestionar todos los aspectos del club Wild Dogs.
              Selecciona una sección para comenzar.
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jugadores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-players">{totalPlayers}</div>
              <p className="text-xs text-muted-foreground">Activos en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-monthly-income">
                ${monthlyIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Últimos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos este Mes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-matches">{matchesThisMonth}</div>
              <p className="text-xs text-muted-foreground">{wins} victorias</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos Pendientes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-pending-docs">{pendingDocuments}</div>
              <p className="text-xs text-muted-foreground">Requieren revisión</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <Link key={index} href={section.href}>
              <Card className="hover-elevate active-elevate-2 h-full" data-testid={`admin-card-${index}`}>
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${section.bgColor} flex items-center justify-center mb-4`}>
                    <section.icon className={`h-6 w-6 ${section.color}`} />
                  </div>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
