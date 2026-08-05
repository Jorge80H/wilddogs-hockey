import { useState } from "react";
import { db } from "@/lib/instant";
import { useFamily } from "@/hooks/useFamily";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home, ArrowLeft, BookOpen, Star } from "lucide-react";
import { Link } from "wouter";
import { PlayerSwitcher } from "@/components/family/PlayerSwitcher";
import { TitularOnboardingForm } from "@/components/family/TitularOnboardingForm";
import { PlayerProfileForm } from "@/components/family/PlayerProfileForm";
import { PlayerStatusBanner } from "@/components/family/PlayerStatusBanner";
import { canViewContent, playerDisplayName } from "@/lib/players";
import { PlayerProgressHeader } from "@/components/learning/PlayerProgressHeader";
import { PathCarousel } from "@/components/learning/PathCarousel";
import { ContentViewer } from "@/components/learning/ContentViewer";
import { QuizRunner } from "@/components/learning/QuizRunner";
import { Leaderboard } from "@/components/learning/Leaderboard";
import { FeedbackMetricsCard } from "@/components/feedback/FeedbackMetricsCard";
import { MonthlyReportCard } from "@/components/feedback/MonthlyReportCard";
import { FeedbackHistoryList } from "@/components/feedback/FeedbackHistoryList";

export default function PlayerDashboard() {
  const { authUser, titular, players, isLoading, needsOnboarding } = useFamily();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [openMaterialId, setOpenMaterialId] = useState<string | null>(null);
  const [inQuiz, setInQuiz] = useState(false);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" /></div>;
  }
  if (!authUser || !titular) { window.location.href = "/login"; return null; }

  const Header = ({ children }: { children?: React.ReactNode }) => (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">{children}
          <div><h1 className="text-xl font-bold">Mi familia</h1>
            <p className="text-xs text-muted-foreground">{titular.firstName || authUser.email}</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/"><Button variant="outline" size="sm"><Home className="h-4 w-4" /></Button></Link>
          <Button variant="outline" size="sm" onClick={() => { db.auth.signOut(); window.location.href = "/"; }}><LogOut className="h-4 w-4" /></Button>
        </div>
      </div>
    </header>
  );

  // 1) Onboarding del titular
  if (needsOnboarding) {
    return <div className="min-h-screen bg-background"><Header /><main className="container mx-auto px-4 py-8"><TitularOnboardingForm titular={titular} /></main></div>;
  }

  // 2) Agregar jugador
  if (adding) {
    return <div className="min-h-screen bg-background">
      <Header><Button variant="ghost" size="icon" onClick={() => setAdding(false)}><ArrowLeft className="h-5 w-5" /></Button></Header>
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <PlayerProfileForm titularId={titular.id} onDone={() => setAdding(false)} />
      </main></div>;
  }

  // 3) Selección: directo si hay 1, selector si 2+
  const effectiveId = selectedId || (players.length === 1 ? players[0].id : null);
  if (!effectiveId) {
    return <div className="min-h-screen bg-background"><Header />
      <main className="container mx-auto px-4 py-8">
        {players.length === 0 && <p className="text-muted-foreground mb-4">Aún no has agregado jugadores. Agrega a tu hijo/a o regístrate como jugador.</p>}
        <PlayerSwitcher players={players} onSelect={setSelectedId} onAdd={() => setAdding(true)} />
      </main></div>;
  }

  // 4) Vista de un jugador
  const player = players.find((p) => p.id === effectiveId)!;
  const unlocked = canViewContent(player.status);
  return (
    <div className="min-h-screen bg-background">
      <Header>{players.length > 1 && <Button variant="ghost" size="icon" onClick={() => setSelectedId(null)}><ArrowLeft className="h-5 w-5" /></Button>}</Header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-12 w-12"><AvatarFallback>{(player.firstName?.[0] || "?").toUpperCase()}</AvatarFallback></Avatar>
          <div><h2 className="text-2xl font-bold">{playerDisplayName(player)}</h2>
            <p className="text-sm text-muted-foreground capitalize">{player.category} · {player.position || "Sin posición"}</p></div>
        </div>

        <PlayerStatusBanner status={player.status} rejectionReason={player.rejectionReason} documents={player.documents} />

        <Card className="mb-6">
          <CardHeader><CardTitle>Ficha del jugador</CardTitle></CardHeader>
          <CardContent>
            <PlayerProfileForm titularId={titular.id} existing={player} onDone={() => {}} />
          </CardContent>
        </Card>

        {!unlocked ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">
            El contenido se habilita cuando el club apruebe a este jugador.
          </CardContent></Card>
        ) : (
          <FormacionSection player={player} openMaterialId={openMaterialId} setOpenMaterialId={setOpenMaterialId} inQuiz={inQuiz} setInQuiz={setInQuiz} />
        )}
      </main>
    </div>
  );
}

function FormacionSection({ player, openMaterialId, setOpenMaterialId, inQuiz, setInQuiz }: any) {
  const { data } = db.useQuery(
    openMaterialId ? { trainingMaterials: { $: { where: { id: openMaterialId } }, questions: {} } } : null
  );
  const material = (data?.trainingMaterials?.[0] as any) || null;

  if (openMaterialId && material) {
    if (inQuiz) {
      return <QuizRunner player={player} material={material} onDone={() => { setInQuiz(false); setOpenMaterialId(null); }} />;
    }
    return <ContentViewer material={material} onQuiz={() => setInQuiz(true)} onBack={() => setOpenMaterialId(null)} />;
  }

  return (
    <div className="space-y-6">
      <PlayerProgressHeader player={player} />

      <Tabs defaultValue="formacion" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formacion"><BookOpen className="mr-2 h-4 w-4" /> Ruta de Formación</TabsTrigger>
          <TabsTrigger value="feedback"><Star className="mr-2 h-4 w-4" /> Evaluación & Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="formacion" className="space-y-6">
          <PathCarousel player={player} onOpen={(mid: string) => { setOpenMaterialId(mid); setInQuiz(false); }} />
          <Leaderboard category={player.category} currentPlayerId={player.id} />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeedbackMetricsCard playerProfileId={player.id} />
            <MonthlyReportCard playerProfileId={player.id} />
          </div>
          <FeedbackHistoryList playerProfileId={player.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
