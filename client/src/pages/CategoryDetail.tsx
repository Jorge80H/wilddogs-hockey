import { useParams } from "wouter";
import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Clock, Target } from "lucide-react";
import type { PlayerProfile, User, Coach, CategoryAchievement } from "@shared/schema";
import playerPlaceholder from "@assets/generated_images/Player_portrait_placeholder_d8c2b3f0.png";
import coachPlaceholder from "@assets/generated_images/Coach_portrait_placeholder_9533f352.png";
import sub8Image from "@assets/generated_images/Sub_8_category_action_a72d36d1.png";
import sub12Image from "@assets/generated_images/Sub_12_category_action_b13c69c9.png";
import sub14Image from "@assets/generated_images/Sub_14_category_action_8361893f.png";
import sub16Image from "@assets/generated_images/Sub_16_category_action_736df6df.png";
import sub18Image from "@assets/generated_images/Sub_18_category_action_dd3bdc31.png";
import mayoresImage from "@assets/generated_images/Mayores_category_action_e9aef5c0.png";

type PlayerWithUser = PlayerProfile & { user: User };

export default function CategoryDetail() {
  const params = useParams();
  const categoryId = params.id as string;

  const { data: players = [], isLoading: playersLoading } = useQuery<PlayerWithUser[]>({
    queryKey: ["/api/categories", categoryId, "players"],
  });

  const { data: coaches = [], isLoading: coachesLoading } = useQuery<Coach[]>({
    queryKey: ["/api/categories", categoryId, "coaches"],
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery<CategoryAchievement[]>({
    queryKey: ["/api/categories", categoryId, "achievements"],
  });

  const categoryImages: Record<string, string> = {
    sub8: sub8Image,
    sub12: sub12Image,
    sub14: sub14Image,
    sub16: sub16Image,
    sub18: sub18Image,
    mayores: mayoresImage,
  };

  const categoryInfo: Record<string, any> = {
    sub8: {
      name: "Sub 8",
      ageRange: "Menores de 8 años",
      description: "Introducción al hockey en línea con énfasis en diversión y desarrollo de habilidades básicas motoras.",
      schedule: "Martes y Jueves, 4:00 PM - 5:30 PM",
      objectives: [
        "Desarrollar habilidades motoras básicas",
        "Aprender fundamentos del patinaje",
        "Manejo básico del stick y puck",
        "Fomentar el amor por el deporte",
      ],
    },
    sub12: {
      name: "Sub 12",
      ageRange: "Menores de 12 años",
      description: "Desarrollo técnico progresivo con introducción a conceptos tácticos básicos del juego.",
      schedule: "Martes y Jueves, 4:00 PM - 5:30 PM",
      objectives: [
        "Perfeccionar técnica individual",
        "Comprender posiciones de juego",
        "Trabajar en equipo efectivamente",
        "Participar en torneos locales",
      ],
    },
    sub14: {
      name: "Sub 14",
      ageRange: "Menores de 14 años",
      description: "Formación competitiva con énfasis en táctica colectiva y desarrollo físico.",
      schedule: "Lunes, Miércoles y Viernes, 5:30 PM - 7:00 PM",
      objectives: [
        "Dominar sistemas tácticos",
        "Mejorar condición física específica",
        "Desarrollar liderazgo en cancha",
        "Competir a nivel regional",
      ],
    },
    sub16: {
      name: "Sub 16",
      ageRange: "Menores de 16 años",
      description: "Alto nivel competitivo con preparación para categorías mayores.",
      schedule: "Lunes, Miércoles y Viernes, 5:30 PM - 7:00 PM",
      objectives: [
        "Excelencia técnico-táctica",
        "Preparación mental competitiva",
        "Representación nacional",
        "Proyección deportiva avanzada",
      ],
    },
    sub18: {
      name: "Sub 18",
      ageRange: "Menores de 18 años",
      description: "Categoría pre-profesional con enfoque en alto rendimiento.",
      schedule: "Lunes, Miércoles y Viernes, 7:00 PM - 9:00 PM",
      objectives: [
        "Perfeccionamiento integral",
        "Transición a nivel senior",
        "Competencia nacional e internacional",
        "Desarrollo profesional",
      ],
    },
    mayores: {
      name: "Mayores",
      ageRange: "18 años en adelante",
      description: "Competencia adulta de alto nivel en torneos locales y nacionales.",
      schedule: "Lunes, Miércoles y Viernes, 7:00 PM - 9:00 PM",
      objectives: [
        "Competencia profesional",
        "Representación del club a máximo nivel",
        "Torneos nacionales",
        "Excelencia deportiva",
      ],
    },
  };

  const info = categoryInfo[categoryId] || categoryInfo.sub8;
  const heroImage = categoryImages[categoryId] || sub8Image;

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt={info.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight uppercase drop-shadow-lg">
            {info.name}
          </h1>
          <p className="text-2xl text-white/90 drop-shadow-md">{info.ageRange}</p>
        </div>
      </section>

      {/* Category Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Horarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{info.schedule}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Target className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Trophy className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Nivel</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {categoryId === "sub8" || categoryId === "sub12"
                      ? "Formativo"
                      : categoryId === "mayores"
                      ? "Elite"
                      : "Competitivo"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="text-2xl">Objetivos Formativos</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {info.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Player Roster */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Roster de Jugadores</h2>
          {playersLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="w-24 h-24 rounded-full bg-muted animate-pulse mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse w-2/3 mx-auto" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : players.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {players.map((player) => (
                <Card key={player.id} className="hover-elevate active-elevate-2" data-testid={`player-card-${player.id}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                      <img
                        src={player.user.profileImageUrl || playerPlaceholder}
                        alt={`${player.user.firstName} ${player.user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-3xl font-black text-primary mb-2">
                      #{player.jerseyNumber || "00"}
                    </div>
                    <h3 className="font-bold mb-1">
                      {player.user.firstName} {player.user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize mb-2">
                      {player.position || "Jugador"}
                    </p>
                    {(player.goals || player.assists || player.gamesPlayed) ? (
                      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                        <div>PJ: {player.gamesPlayed || 0}</div>
                        <div>G: {player.goals || 0} | A: {player.assists || 0}</div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <p>No hay jugadores registrados en esta categoría aún.</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Coaching Staff */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold mb-12 text-center">Cuerpo Técnico</h2>
          {coachesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="w-32 h-32 rounded-full bg-muted animate-pulse mx-auto mb-4" />
                    <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-muted rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : coaches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {coaches.map((coach) => (
                <Card key={coach.id} data-testid={`coach-card-${coach.id}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                      <img
                        src={coach.photoUrl || coachPlaceholder}
                        alt={coach.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-bold mb-1">{coach.name}</h3>
                    <p className="text-sm text-primary mb-2">{coach.role}</p>
                    {coach.experience && (
                      <p className="text-xs text-muted-foreground">{coach.experience}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 max-w-2xl mx-auto">
              <div className="text-center text-muted-foreground">
                <p>Información del cuerpo técnico próximamente.</p>
              </div>
            </Card>
          )}
        </div>
      </section>

      {/* Achievements */}
      {achievements.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold mb-12 text-center">Logros de la Categoría</h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {achievements.map((achievement) => (
                <Card key={achievement.id} className="hover-elevate active-elevate-2" data-testid={`achievement-${achievement.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Trophy className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-mono text-muted-foreground mb-1">{achievement.year}</div>
                        <div className="text-lg font-semibold">{achievement.title}</div>
                        {achievement.description && (
                          <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
