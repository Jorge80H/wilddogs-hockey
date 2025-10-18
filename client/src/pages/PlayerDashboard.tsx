import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, DollarSign, FileText, User, Calendar, TrendingUp } from "lucide-react";
import type { PlayerProfile, AccountReceivable, User as UserType } from "@shared/schema";

type PlayerWithUser = PlayerProfile & { user: UserType };

export default function PlayerDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: profile } = useQuery<PlayerWithUser>({
    queryKey: ["/api/player/profile"],
    enabled: isAuthenticated,
  });

  const { data: accounts = [] } = useQuery<AccountReceivable[]>({
    queryKey: ["/api/player/accounts"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const pendingBalance = accounts
    .filter((a) => a.status === "pending" || a.status === "overdue")
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Panel de Jugador</h1>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={user.profileImageUrl || undefined} />
                <AvatarFallback>
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-muted-foreground">{user.email}</div>
              </div>
              <a href="/api/logout">
                <Button variant="outline" size="sm" data-testid="button-logout">
                  Cerrar Sesión
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categoría</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize" data-testid="text-category">
                {profile?.category || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos Jugados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-games-played">
                {profile?.gamesPlayed || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goles</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-goals">
                {profile?.goals || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile?.assists || 0} asistencias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${pendingBalance > 0 ? "text-destructive" : "text-green-600"}`} data-testid="text-balance">
                ${pendingBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Número:</span>
                  <span className="ml-2 font-semibold">#{profile?.jerseyNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Posición:</span>
                  <span className="ml-2 font-semibold capitalize">{profile?.position || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Teléfono:</span>
                  <span className="ml-2 font-semibold">{profile?.phone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo de Sangre:</span>
                  <span className="ml-2 font-semibold">{profile?.bloodType || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Estado de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.slice(0, 5).map((account) => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md" data-testid={`account-${account.id}`}>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{account.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Vencimiento: {new Date(account.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold">${parseFloat(account.amount).toLocaleString()}</div>
                        <Badge
                          variant={
                            account.status === "paid"
                              ? "default"
                              : account.status === "overdue"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {account.status === "paid" ? "Pagado" : account.status === "overdue" ? "Vencido" : "Pendiente"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No tienes cuentas pendientes.</p>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Mantén tus documentos actualizados para participar en torneos.
              </p>
              <Button variant="outline" className="w-full" data-testid="button-upload-documents">
                Subir Documentos
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-schedule">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Horario de Entrenamientos
              </Button>
              <Button variant="outline" className="w-full justify-start" data-testid="button-view-tournaments">
                <Trophy className="mr-2 h-4 w-4" />
                Próximos Torneos
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
