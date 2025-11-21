import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { db } from "@/lib/instant";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Tournaments() {
  const now = Date.now();

  // Query upcoming matches
  const { data: upcomingData, isLoading: upcomingLoading } = db.useQuery({
    matches: {
      $: {
        where: {
          date: { $gt: now },
        },
      },
    },
  });

  // Query past matches
  const { data: pastData, isLoading: pastLoading } = db.useQuery({
    matches: {
      $: {
        where: {
          date: { $lt: now },
        },
      },
    },
  });

  // Query standings
  const { data: standingsData, isLoading: standingsLoading } = db.useQuery({
    standings: {},
  });

  const upcomingMatches = upcomingData?.matches || [];
  const pastMatches = pastData?.matches || [];
  const standings = standingsData?.standings?.sort((a, b) => a.position - b.position) || [];

  const getResultBadgeVariant = (result: string | null | undefined) => {
    if (result === "win") return "default";
    if (result === "loss") return "destructive";
    return "secondary";
  };

  const getResultText = (result: string | null | undefined) => {
    if (result === "win") return "Victoria";
    if (result === "loss") return "Derrota";
    return "Empate";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
              Torneos
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Resultados, calendario y tablas de posiciones
            </p>
          </div>
        </div>
      </section>

      {/* Tabs for different sections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="upcoming" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">Próximos Partidos</TabsTrigger>
              <TabsTrigger value="results" data-testid="tab-results">Resultados</TabsTrigger>
              <TabsTrigger value="standings" data-testid="tab-standings">Tabla de Posiciones</TabsTrigger>
            </TabsList>

            {/* Upcoming Matches */}
            <TabsContent value="upcoming">
              <div className="space-y-4">
                {upcomingLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="h-20 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => (
                    <Card key={match.id} className="hover-elevate active-elevate-2" data-testid={`upcoming-match-${match.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(match.date), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                              </span>
                            </div>
                            <div className="text-2xl font-bold mb-2">
                              Wild Dogs vs {match.opponent}
                            </div>
                            {match.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {match.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="capitalize">
                              {match.categoryId?.replace('sub', 'Sub ') || "General"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12">
                    <div className="text-center text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay partidos programados próximamente.</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Past Results */}
            <TabsContent value="results">
              <div className="space-y-4">
                {pastLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="h-20 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : pastMatches.length > 0 ? (
                  pastMatches.map((match) => (
                    <Card key={match.id} className="hover-elevate active-elevate-2" data-testid={`past-match-${match.id}`}>
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(match.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                              </span>
                              <Badge variant={getResultBadgeVariant(match.result)} className="ml-2">
                                {getResultText(match.result)}
                              </Badge>
                            </div>
                            <div className="text-2xl font-bold mb-2">
                              Wild Dogs vs {match.opponent}
                            </div>
                            {match.homeScore !== null && match.homeScore !== undefined && match.awayScore !== null && match.awayScore !== undefined && (
                              <div className="text-3xl font-black font-mono text-primary">
                                {match.homeScore} - {match.awayScore}
                              </div>
                            )}
                            {match.location && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <MapPin className="h-4 w-4" />
                                {match.location}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="capitalize">
                              {match.categoryId?.replace('sub', 'Sub ') || "General"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12">
                    <div className="text-center text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hay resultados disponibles aún.</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Standings Table */}
            <TabsContent value="standings">
              {standingsLoading ? (
                <Card>
                  <CardContent className="p-6">
                    <div className="h-96 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ) : standings.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Tabla de Posiciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full" data-testid="standings-table">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="pb-3 pl-4 pr-2 font-semibold text-sm">#</th>
                            <th className="pb-3 px-2 font-semibold text-sm">Equipo</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">PJ</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">G</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">E</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">P</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">GF</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">GC</th>
                            <th className="pb-3 px-2 font-semibold text-sm text-center">DG</th>
                            <th className="pb-3 pl-2 pr-4 font-semibold text-sm text-center">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standings.map((team) => (
                            <tr
                              key={team.id}
                              className={`border-b hover-elevate active-elevate-2 ${
                                team.teamName === "Wild Dogs" ? "bg-primary/5" : ""
                              }`}
                              data-testid={`standing-row-${team.id}`}
                            >
                              <td className="py-3 pl-4 pr-2 font-bold">{team.position}</td>
                              <td className="py-3 px-2 font-semibold">{team.teamName}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.played}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.won}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.drawn}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.lost}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.goalsFor}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.goalsAgainst}</td>
                              <td className="py-3 px-2 text-center font-mono">{team.goalDifference}</td>
                              <td className="py-3 pl-2 pr-4 text-center font-bold font-mono text-primary">
                                {team.points}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-12">
                  <div className="text-center text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay tabla de posiciones disponible aún.</p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
