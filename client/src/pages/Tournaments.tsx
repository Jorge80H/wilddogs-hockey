import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/instant";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function Tournaments() {
  const { isLoading, error, data } = db.useQuery({
    matches: {},
    standings: {}
  });

  const matchesData = data?.matches || [];
  const upcomingMatches = matchesData
    .filter((m) => m.status === "Not Started" || m.date >= Date.now())
    .sort((a, b) => a.date - b.date);

  const pastMatches = matchesData
    .filter((m) => m.status !== "Not Started" && m.date < Date.now())
    .sort((a, b) => b.date - a.date);

  const standings = data?.standings || [];

  const upcomingLoading = isLoading;
  const pastLoading = isLoading;
  const standingsLoading = isLoading;

  if (error) {
    return <div className="p-8 text-center text-red-500">Error cargando datos: {error.message}</div>;
  }

  const getResultBadgeVariant = (result: string | null) => {
    if (result === "win") return "default";
    if (result === "loss") return "destructive";
    return "secondary";
  };

  const getResultText = (result: string | null) => {
    if (result === "win") return "Victoria";
    if (result === "loss") return "Derrota";
    return "Empate";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase drop-shadow-2xl">
              Torneos
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light drop-shadow-md">
              Resultados, calendario y tablas de posiciones
            </p>
          </motion.div>
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
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {upcomingLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="border-0 shadow-none bg-transparent">
                        <CardContent className="p-6">
                          <div className="h-20 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : upcomingMatches.length > 0 ? (
                  upcomingMatches.map((match) => (
                    <motion.div key={match.id} variants={fadeIn}>
                      <Card className="hover-elevate active-elevate-2 group border-border/40 hover:border-primary/50 transition-all duration-300 shadow-sm" data-testid={`upcoming-match-${match.id}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                  {format(new Date(match.date), "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                                </span>
                              </div>
                              <div className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors">
                                Wild Dogs vs {match.opponent}
                              </div>
                              {match.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                  <MapPin className="h-4 w-4" />
                                  {match.location}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="capitalize px-4 py-1.5">{match.notes?.split(' - ')[0] || "General"}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div variants={fadeIn}>
                    <Card className="p-16 border-dashed border-2 bg-transparent text-center">
                      <div className="text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No hay partidos programados próximamente.</p>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Past Results */}
            <TabsContent value="results">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {pastLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="border-0 shadow-none bg-transparent">
                        <CardContent className="p-6">
                          <div className="h-24 bg-muted animate-pulse rounded" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : pastMatches.length > 0 ? (
                  pastMatches.map((match) => (
                    <motion.div key={match.id} variants={fadeIn}>
                      <Card className="hover-elevate active-elevate-2 group border-border/40 hover:border-primary/50 transition-all duration-300 shadow-sm" data-testid={`past-match-${match.id}`}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                  {format(new Date(match.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                                </span>
                                <Badge variant={getResultBadgeVariant(match.result)} className="ml-2 px-3 py-0.5 shadow-sm">
                                  {getResultText(match.result)}
                                </Badge>
                              </div>
                              <div className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors">
                                Wild Dogs vs {match.opponent}
                              </div>
                              {match.homeScore !== null && match.awayScore !== null && (
                                <div className="text-4xl font-black font-mono text-primary/80 group-hover:text-primary transition-colors tracking-tighter">
                                  {match.homeScore} <span className="text-muted-foreground/30 text-2xl mx-1">-</span> {match.awayScore}
                                </div>
                              )}
                              {match.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3 bg-muted/30 w-fit px-3 py-1 rounded-md">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {match.location}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Badge variant="outline" className="capitalize px-4 py-1.5 border-primary/20 bg-primary/5">{match.notes?.split(' - ')[0] || "General"}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div variants={fadeIn}>
                    <Card className="p-16 border-dashed border-2 bg-transparent text-center">
                      <div className="text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">No hay resultados disponibles aún.</p>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Standings Table */}
            <TabsContent value="standings">
              {standingsLoading ? (
                <Card className="border-0 shadow-none bg-transparent">
                  <CardContent className="p-6">
                    <div className="h-96 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ) : standings.length > 0 ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-8"
                >
                  {Object.entries(
                    standings.reduce((acc, curr) => {
                      const category = curr.division || "General";
                      if (!acc[category]) acc[category] = [];
                      acc[category].push(curr);
                      return acc;
                    }, {} as Record<string, typeof standings>)
                  ).sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([category, teamStandings]) => (
                      <motion.div key={category} variants={fadeIn}>
                        <Card className="border-border/40 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-2">
                              <Trophy className="h-5 w-5 text-primary" />
                              {category}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm" data-testid={`standings-table-${category}`}>
                                <thead className="bg-muted/10">
                                  <tr className="border-b border-border/40 text-left text-muted-foreground">
                                    <th className="py-4 pl-6 pr-2 font-bold uppercase tracking-wider text-xs">#</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs">Equipo</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Partidos Jugados">PJ</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Ganados">G</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Empatados">E</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Perdidos">P</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Goles a Favor">GF</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Goles en Contra">GC</th>
                                    <th className="py-4 px-2 font-bold uppercase tracking-wider text-xs text-center" title="Diferencia de Goles">DG</th>
                                    <th className="py-4 pl-2 pr-6 font-black uppercase tracking-wider text-xs text-center text-primary">Pts</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                  {teamStandings
                                    .sort((a, b) => {
                                      if (a.points !== b.points) return b.points - a.points;
                                      if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
                                      return b.goalsFor - a.goalsFor;
                                    })
                                    .map((team, index) => (
                                      <tr
                                        key={team.id}
                                        className={`hover:bg-muted/30 transition-colors ${team.teamName.includes("Wild Dogs") ? "bg-primary/[0.03] border-l-2 border-l-primary" : ""
                                          }`}
                                        data-testid={`standing-row-${team.id}`}
                                      >
                                        <td className="py-4 pl-6 pr-2 font-black text-muted-foreground/50">{index + 1}</td>
                                        <td className={`py-4 px-2 font-bold ${team.teamName.includes("Wild Dogs") ? "text-primary" : ""}`}>
                                          {team.teamName}
                                        </td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.played}</td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.won}</td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.drawn}</td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.lost}</td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.goalsFor}</td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.goalsAgainst}</td>
                                        <td className="py-4 px-2 text-center font-mono opacity-80">{team.goalDifference}</td>
                                        <td className={`py-4 pl-2 pr-6 text-center font-black font-mono ${team.teamName.includes("Wild Dogs") ? "text-primary text-base" : "text-foreground"}`}>
                                          {team.points}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <motion.div variants={fadeIn} initial="hidden" animate="visible">
                  <Card className="p-16 border-dashed border-2 bg-transparent text-center">
                    <div className="text-muted-foreground">
                      <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">No hay tabla de posiciones disponible aún.</p>
                    </div>
                  </Card>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
