import { db } from "@/lib/instant";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  DollarSign,
  FileText,
  User,
  Calendar,
  TrendingUp,
  Star,
  BookOpen,
  LogOut,
  Home,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PublicNav } from "@/components/layout/PublicNav";

export default function PlayerDashboard() {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading } = db.useAuth();

  // Get the user's profile from InstantDB
  const { data, isLoading: dataLoading } = db.useQuery(
    authUser
      ? {
          users: {
            $: { where: { id: authUser.id } },
          },
        }
      : null
  );

  const user = data?.users?.[0] as any;
  const isLoading = authLoading || (!!authUser && dataLoading);

  // Get player profile linked to this user
  const { data: profileData } = db.useQuery(
    user
      ? {
          playerProfiles: {
            $: { where: { "user.id": user.id } },
            feedback: { coach: {} },
          },
        }
      : null
  );

  // Get account receivables for the player
  const { data: accountsData } = db.useQuery(
    profileData?.playerProfiles?.[0]
      ? {
          accountsReceivable: {
            $: {
              where: {
                "playerProfile.id": profileData.playerProfiles[0].id,
              },
            },
          },
        }
      : null
  );

  // Get training materials (public ones)
  const { data: materialsData } = db.useQuery({
    trainingMaterials: {
      $: { where: { isPublic: true } },
    },
  });

  useEffect(() => {
    if (!isLoading && !authUser) {
      toast({
        title: "No autorizado",
        description: "Iniciando sesión...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [authUser, isLoading, toast]);

  if (isLoading || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  const profile = profileData?.playerProfiles?.[0] as any;
  const accounts = (accountsData?.accountsReceivable || []) as any[];
  const feedback = (profile?.feedback || []) as any[];
  const materials = (materialsData?.trainingMaterials || []) as any[];

  const pendingBalance = accounts
    .filter((a) => a.status === "pending" || a.status === "overdue")
    .reduce((sum, a) => sum + parseFloat(a.amount || "0"), 0);

  const avgScore = feedback.length > 0
    ? (
        feedback.reduce(
          (sum, f) =>
            sum +
            ((f.technicalScore || 0) +
              (f.tacticalScore || 0) +
              (f.physicalScore || 0) +
              (f.attitudeScore || 0)) /
              4,
          0
        ) / feedback.length
      ).toFixed(1)
    : "N/A";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Jugador</h1>
              <p className="text-sm text-muted-foreground">Wild Dogs Hockey Club</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="mr-2 h-4 w-4" />
                  Inicio
                </Button>
              </Link>
              <Avatar>
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback>
                  {user?.firstName?.[0] || authUser.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <div className="font-semibold">
                  {user?.firstName || authUser.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  {profile?.category || "Sin categoría"}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  db.auth.signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categoría</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold capitalize">
                {profile?.category || "N/A"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partidos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {profile?.gamesPlayed || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Goles / Asist.</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {profile?.goals || 0} / {profile?.assists || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl font-bold ${
                  pendingBalance > 0 ? "text-destructive" : "text-green-600"
                }`}
              >
                ${pendingBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="text-xs sm:text-sm">
              <User className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Perfil
            </TabsTrigger>
            <TabsTrigger value="payments" className="text-xs sm:text-sm">
              <DollarSign className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Pagos
            </TabsTrigger>
            <TabsTrigger value="feedback" className="text-xs sm:text-sm">
              <Star className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Feedback
            </TabsTrigger>
            <TabsTrigger value="training" className="text-xs sm:text-sm">
              <BookOpen className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Formación
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" /> Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile ? (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Número:</span>
                      <span className="ml-2 font-semibold">
                        #{profile.jerseyNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Posición:</span>
                      <span className="ml-2 font-semibold capitalize">
                        {profile.position || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Teléfono:</span>
                      <span className="ml-2 font-semibold">
                        {profile.phone || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tipo de Sangre:</span>
                      <span className="ml-2 font-semibold">
                        {profile.bloodType || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acudiente:</span>
                      <span className="ml-2 font-semibold">
                        {profile.guardianName || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tel. Emergencia:</span>
                      <span className="ml-2 font-semibold">
                        {profile.emergencyPhone || "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Tu perfil de jugador aún no ha sido creado. Contacta al
                    administrador.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" /> Estado de Pagos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accounts.length > 0 ? (
                  <div className="space-y-3">
                    {accounts.map((account: any) => (
                      <div
                        key={account.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {account.description}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Vencimiento:{" "}
                            {new Date(account.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-bold">
                            ${parseFloat(account.amount).toLocaleString()}
                          </div>
                          <Badge
                            variant={
                              account.status === "paid"
                                ? "default"
                                : account.status === "overdue"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {account.status === "paid"
                              ? "Pagado"
                              : account.status === "overdue"
                              ? "Vencido"
                              : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No tienes cuentas registradas.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" /> Feedback de Entrenadores
                </CardTitle>
                {feedback.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Promedio general: <strong>{avgScore}/10</strong>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {feedback.length > 0 ? (
                  <div className="space-y-4">
                    {feedback
                      .sort((a: any, b: any) => b.createdAt - a.createdAt)
                      .map((fb: any) => (
                        <div
                          key={fb.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">
                              {fb.type === "post-match"
                                ? "Post-partido"
                                : fb.type === "quarterly"
                                ? "Trimestral"
                                : "General"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(fb.createdAt), "d MMM yyyy", {
                                locale: es,
                              })}
                            </span>
                          </div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Técnica
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {fb.technicalScore || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Táctica
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {fb.tacticalScore || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Física
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {fb.physicalScore || "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">
                                Actitud
                              </div>
                              <div className="text-lg font-bold text-primary">
                                {fb.attitudeScore || "-"}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm">{fb.comments}</p>
                          {fb.strengths && (
                            <p className="text-sm text-green-600">
                              💪 <strong>Fortalezas:</strong> {fb.strengths}
                            </p>
                          )}
                          {fb.areasToImprove && (
                            <p className="text-sm text-orange-600">
                              📈 <strong>Por mejorar:</strong>{" "}
                              {fb.areasToImprove}
                            </p>
                          )}
                          {fb.coach?.[0] && (
                            <p className="text-xs text-muted-foreground">
                              — {fb.coach[0].name}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      Aún no tienes evaluaciones de entrenadores.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Material de Formación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {materials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map((mat: any) => (
                      <a
                        key={mat.id}
                        href={mat.contentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-primary/10 text-primary rounded-lg p-2">
                            {mat.type === "video" ? (
                              <BookOpen className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">
                              {mat.title}
                            </h4>
                            {mat.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {mat.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {mat.type}
                              </Badge>
                              {mat.duration && (
                                <span className="text-xs text-muted-foreground">
                                  {mat.duration}
                                </span>
                              )}
                              {mat.difficulty && (
                                <Badge variant="secondary" className="text-xs capitalize">
                                  {mat.difficulty}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No hay material de formación disponible aún.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
