import { db } from "@/lib/instant";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Star,
  BookOpen,
  Plus,
  LogOut,
  Home,
  Send,
  Video,
  FileText,
} from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { tx, id as txId } from "@instantdb/react";

export default function CoachDashboard() {
  const { toast } = useToast();
  const { user: authUser, isLoading: authLoading } = db.useAuth();

  // Get user record
  const { data: userData, isLoading: userLoading } = db.useQuery(
    authUser
      ? { users: { $: { where: { id: authUser.id } } } }
      : null
  );

  const user = userData?.users?.[0] as any;
  const isLoading = authLoading || (!!authUser && userLoading);

  // Get all player profiles for feedback
  const { data: playersData } = db.useQuery({
    playerProfiles: {
      user: {},
      feedback: {},
    },
  });

  // Get training materials created by this coach
  const { data: materialsData } = db.useQuery({
    trainingMaterials: {},
  });

  // Get categories
  const { data: categoriesData } = db.useQuery({
    categories: {},
  });

  // Feedback form state
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [feedbackType, setFeedbackType] = useState("post-match");
  const [technicalScore, setTechnicalScore] = useState(5);
  const [tacticalScore, setTacticalScore] = useState(5);
  const [physicalScore, setPhysicalScore] = useState(5);
  const [attitudeScore, setAttitudeScore] = useState(5);
  const [comments, setComments] = useState("");
  const [strengths, setStrengths] = useState("");
  const [areasToImprove, setAreasToImprove] = useState("");

  // Material form state
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matDescription, setMatDescription] = useState("");
  const [matType, setMatType] = useState("video");
  const [matUrl, setMatUrl] = useState("");
  const [matDuration, setMatDuration] = useState("");
  const [matDifficulty, setMatDifficulty] = useState("beginner");

  useEffect(() => {
    if (!isLoading && !authUser) {
      window.location.href = "/login";
    }
  }, [authUser, isLoading]);

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

  const players = (playersData?.playerProfiles || []) as any[];
  const materials = (materialsData?.trainingMaterials || []) as any[];

  const handleSubmitFeedback = async () => {
    if (!selectedPlayerId || !comments.trim()) {
      toast({
        title: "Error",
        description: "Selecciona un jugador y escribe comentarios",
        variant: "destructive",
      });
      return;
    }

    try {
      const feedbackId = txId();
      await db.transact([
        tx.playerFeedback[feedbackId].update({
          type: feedbackType,
          technicalScore,
          tacticalScore,
          physicalScore,
          attitudeScore,
          comments: comments.trim(),
          strengths: strengths.trim() || undefined,
          areasToImprove: areasToImprove.trim() || undefined,
          createdAt: Date.now(),
        }),
        tx.playerFeedback[feedbackId].link({ player: selectedPlayerId }),
      ]);

      toast({ title: "✅ Feedback enviado correctamente" });
      setShowFeedbackForm(false);
      setComments("");
      setStrengths("");
      setAreasToImprove("");
      setSelectedPlayerId("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmitMaterial = async () => {
    if (!matTitle.trim() || !matUrl.trim()) {
      toast({
        title: "Error",
        description: "Título y URL son requeridos",
        variant: "destructive",
      });
      return;
    }

    try {
      const matId = txId();
      await db.transact([
        tx.trainingMaterials[matId].update({
          title: matTitle.trim(),
          description: matDescription.trim() || undefined,
          type: matType,
          contentUrl: matUrl.trim(),
          duration: matDuration.trim() || undefined,
          difficulty: matDifficulty,
          isPublic: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ]);

      toast({ title: "✅ Material publicado correctamente" });
      setShowMaterialForm(false);
      setMatTitle("");
      setMatDescription("");
      setMatUrl("");
      setMatDuration("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Entrenador</h1>
              <p className="text-sm text-muted-foreground">Wild Dogs Hockey Club</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="mr-2 h-4 w-4" /> Inicio
                </Button>
              </Link>
              <div className="hidden sm:block">
                <div className="font-semibold">
                  {user?.firstName || authUser.email}
                </div>
                <div className="text-sm text-muted-foreground">Entrenador</div>
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

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="players" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="players">
              <Users className="mr-1 h-4 w-4" /> Jugadores
            </TabsTrigger>
            <TabsTrigger value="feedback">
              <Star className="mr-1 h-4 w-4" /> Feedback
            </TabsTrigger>
            <TabsTrigger value="materials">
              <BookOpen className="mr-1 h-4 w-4" /> Formación
            </TabsTrigger>
          </TabsList>

          {/* Players Tab */}
          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Mis Jugadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {players.length > 0 ? (
                  <div className="space-y-2">
                    {players.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <div className="font-semibold">
                            {p.user?.[0]?.firstName || "Jugador"}{" "}
                            {p.user?.[0]?.lastName || ""}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {p.category || "Sin categoría"} · #{p.jerseyNumber || "N/A"} ·{" "}
                            {p.position || "N/A"}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {p.gamesPlayed || 0} PJ
                          </Badge>
                          <Badge variant="outline">
                            {p.goals || 0} G / {p.assists || 0} A
                          </Badge>
                          <Badge variant="secondary">
                            {(p.feedback || []).length} eval.
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No hay jugadores registrados en el sistema.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" /> Evaluar Jugador
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Nueva Evaluación
                </Button>
              </CardHeader>
              <CardContent>
                {showFeedbackForm && (
                  <div className="border rounded-lg p-4 mb-6 space-y-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Jugador</Label>
                        <select
                          className="w-full mt-1 border rounded-md p-2 bg-background"
                          value={selectedPlayerId}
                          onChange={(e) => setSelectedPlayerId(e.target.value)}
                        >
                          <option value="">Seleccionar jugador...</option>
                          {players.map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.user?.[0]?.firstName || "Jugador"}{" "}
                              {p.user?.[0]?.lastName || ""} ({p.category})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <select
                          className="w-full mt-1 border rounded-md p-2 bg-background"
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value)}
                        >
                          <option value="post-match">Post-partido</option>
                          <option value="quarterly">Trimestral</option>
                          <option value="general">General</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: "Técnica", value: technicalScore, set: setTechnicalScore },
                        { label: "Táctica", value: tacticalScore, set: setTacticalScore },
                        { label: "Física", value: physicalScore, set: setPhysicalScore },
                        { label: "Actitud", value: attitudeScore, set: setAttitudeScore },
                      ].map((s) => (
                        <div key={s.label} className="text-center">
                          <Label className="text-xs">{s.label}</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={s.value}
                            onChange={(e) => s.set(Number(e.target.value))}
                            className="text-center text-lg font-bold mt-1"
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <Label>Comentarios *</Label>
                      <textarea
                        className="w-full mt-1 border rounded-md p-2 bg-background min-h-[80px]"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Observaciones generales del desempeño..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Fortalezas</Label>
                        <Input
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                          placeholder="¿En qué destacó?"
                        />
                      </div>
                      <div>
                        <Label>Áreas a mejorar</Label>
                        <Input
                          value={areasToImprove}
                          onChange={(e) => setAreasToImprove(e.target.value)}
                          placeholder="¿Qué debe trabajar?"
                        />
                      </div>
                    </div>

                    <Button onClick={handleSubmitFeedback} className="w-full">
                      <Send className="mr-2 h-4 w-4" /> Enviar Evaluación
                    </Button>
                  </div>
                )}

                {!showFeedbackForm && (
                  <p className="text-muted-foreground text-sm">
                    Haz clic en "Nueva Evaluación" para empezar a evaluar a un
                    jugador con scores numéricos y comentarios.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Materials Tab */}
          <TabsContent value="materials">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Material de Formación
                </CardTitle>
                <Button
                  size="sm"
                  onClick={() => setShowMaterialForm(!showMaterialForm)}
                >
                  <Plus className="mr-1 h-4 w-4" /> Nuevo Material
                </Button>
              </CardHeader>
              <CardContent>
                {showMaterialForm && (
                  <div className="border rounded-lg p-4 mb-6 space-y-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Título *</Label>
                        <Input
                          value={matTitle}
                          onChange={(e) => setMatTitle(e.target.value)}
                          placeholder="Ej: Ejercicio de pases cortos"
                        />
                      </div>
                      <div>
                        <Label>Tipo</Label>
                        <select
                          className="w-full mt-1 border rounded-md p-2 bg-background"
                          value={matType}
                          onChange={(e) => setMatType(e.target.value)}
                        >
                          <option value="video">Video</option>
                          <option value="document">Documento</option>
                          <option value="drill">Ejercicio</option>
                          <option value="tactic">Táctica</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label>URL del contenido * (YouTube, Google Drive, etc.)</Label>
                      <Input
                        value={matUrl}
                        onChange={(e) => setMatUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>

                    <div>
                      <Label>Descripción</Label>
                      <textarea
                        className="w-full mt-1 border rounded-md p-2 bg-background min-h-[60px]"
                        value={matDescription}
                        onChange={(e) => setMatDescription(e.target.value)}
                        placeholder="Describe brevemente el contenido..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duración</Label>
                        <Input
                          value={matDuration}
                          onChange={(e) => setMatDuration(e.target.value)}
                          placeholder="15 min"
                        />
                      </div>
                      <div>
                        <Label>Dificultad</Label>
                        <select
                          className="w-full mt-1 border rounded-md p-2 bg-background"
                          value={matDifficulty}
                          onChange={(e) => setMatDifficulty(e.target.value)}
                        >
                          <option value="beginner">Principiante</option>
                          <option value="intermediate">Intermedio</option>
                          <option value="advanced">Avanzado</option>
                        </select>
                      </div>
                    </div>

                    <Button onClick={handleSubmitMaterial} className="w-full">
                      <Plus className="mr-2 h-4 w-4" /> Publicar Material
                    </Button>
                  </div>
                )}

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
                              <Video className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{mat.title}</h4>
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
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  !showMaterialForm && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        No hay material publicado aún. ¡Sube el primero!
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
