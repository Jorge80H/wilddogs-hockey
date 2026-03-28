import { PublicNav } from "@/components/layout/PublicNav";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/instant";
import { Calendar, MapPin, Trophy, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/useSEO";
import { useState, useMemo } from "react";

import textureBg from "@assets/client_images/textura-grande_wilddogs_01.webp";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

// ─────────────────────────────────────────────
// DISCRIMINADORES DE TORNEO — matching EXPLÍCITO por campo league
// No usar lógica negada (!isFedepatin) para evitar que registros
// sin campo league se cuelen en el torneo equivocado.
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFedepatin = (m: any): boolean => {
  if (m.league === "fedepatin") return true;
  if (m.league === "Fede Patin") return true;   // formato legacy
  if (m.league === "fedehockey") return false;
  if (m.league === "Fede Hockey") return false;
  // fallback por location para datos muy viejos sin campo league
  const loc = (m.location || "").toLowerCase();
  return loc.includes("fedepatin") || loc.includes("skate") || loc.includes("parque la colina");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isFedehockey = (m: any): boolean => {
  if (m.league === "fedehockey") return true;
  if (m.league === "Fede Hockey") return true;  // formato legacy
  if (m.league === "fedepatin") return false;
  if (m.league === "Fede Patin") return false;
  // fallback: fedehockey si la location NO coincide con fedepatin
  const loc = (m.location || "").toLowerCase();
  const esFedepatin = loc.includes("fedepatin") || loc.includes("skate") || loc.includes("parque la colina");
  return !esFedepatin;
};

const WD_DISPLAY_FH = "Wild Dogs";
const WD_DISPLAY_FP = "Optima Wild Dogs (Condors)";

// ─────────────────────────────────────────────
// MINI CALENDARIO
// ─────────────────────────────────────────────
interface MiniCalendarProps {
  matchDates: Date[];
  selectedDate: Date | null;
  onSelectDate: (d: Date | null) => void;
}

function MiniCalendar({ matchDates, selectedDate, onSelectDate }: MiniCalendarProps) {
  const [viewMonth, setViewMonth] = useState(() => {
    const future = matchDates.filter(d => d >= new Date());
    return future.length > 0 ? startOfMonth(future[0]) : startOfMonth(new Date());
  });

  const days = eachDayOfInterval({ start: startOfMonth(viewMonth), end: endOfMonth(viewMonth) });
  const firstDayOfWeek = getDay(startOfMonth(viewMonth));
  const blanks = Array(firstDayOfWeek).fill(null);
  const hasMatch = (d: Date) => matchDates.some(md => isSameDay(md, d));
  const isSelected = (d: Date) => selectedDate ? isSameDay(d, selectedDate) : false;

  return (
    <div className="bg-card border border-border/40 rounded-xl shadow-sm p-4 min-w-[260px]">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="p-1.5 rounded-md hover:bg-muted transition-colors" aria-label="Mes anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-bold capitalize">{format(viewMonth, "MMMM yyyy", { locale: es })}</span>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="p-1.5 rounded-md hover:bg-muted transition-colors" aria-label="Mes siguiente">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map(d => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          const hasMt = hasMatch(day);
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={day.toISOString()}
              onClick={() => hasMt ? onSelectDate(sel ? null : day) : undefined}
              disabled={!hasMt}
              className={[
                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all",
                sel ? "bg-primary text-primary-foreground shadow-md" : "",
                !sel && hasMt ? "text-primary font-bold hover:bg-primary/10 cursor-pointer" : "",
                !sel && !hasMt ? "text-muted-foreground/40 cursor-default" : "",
                tod && !sel ? "ring-2 ring-primary/40" : "",
              ].join(" ")}
            >
              {format(day, "d")}
              {hasMt && !sel && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
      {selectedDate && (
        <button onClick={() => onSelectDate(null)} className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors py-1.5 rounded-md hover:bg-muted">
          <X className="h-3 w-3" />
          Ver todos los partidos
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLA DE POSICIONES
// ─────────────────────────────────────────────
function StandingsTable({ standings, getCategory }: { standings: any[], getCategory?: (s: any) => string }) {
  if (standings.length === 0) {
    return (
      <motion.div variants={fadeIn} initial="hidden" animate="visible">
        <Card className="p-16 border-dashed border-2 bg-transparent text-center">
          <div className="text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No hay tabla de posiciones disponible aún.</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Agrupar por división; deduplicar por teamName (por cambios de UUID entre versiones del workflow)
  const byDivision: Record<string, Record<string, any>> = {};
  for (const s of standings) {
    const div = getCategory ? getCategory(s) : String(s.division || "General");
    if (!byDivision[div]) byDivision[div] = {};
    const teamKey = String(s.teamName || "").toLowerCase().trim();
    if (!byDivision[div][teamKey] || (s.updatedAt || 0) > (byDivision[div][teamKey].updatedAt || 0)) {
      byDivision[div][teamKey] = s;
    }
  }

  const isWD = (name: string) =>
    name?.toLowerCase().includes("wild dogs") || name?.toLowerCase().includes("condors");

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
      {Object.entries(byDivision)
        .sort(([a], [b]) => sortCategories(a, b))
        .map(([category, teamsMap]) => {
          const teamList = Object.values(teamsMap).sort((a, b) => {
            if (a.points !== b.points) return b.points - a.points;
            if (a.goalDifference !== b.goalDifference) return b.goalDifference - a.goalDifference;
            return (b.goalsFor || 0) - (a.goalsFor || 0);
          });
          return (
            <motion.div key={category} variants={fadeIn}>
              <Card className="border-border/40 shadow-sm">
                <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
                  <CardTitle className="text-xl font-black uppercase tracking-tight text-primary flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
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
                        {teamList.map((team, index) => (
                          <tr
                            key={String(team.id || `${category}-${team.teamName}-${index}`)}
                            className={`hover:bg-muted/30 transition-colors ${isWD(team.teamName) ? "bg-primary/[0.03] border-l-2 border-l-primary" : ""}`}
                          >
                            <td className="py-4 pl-6 pr-2 font-black text-muted-foreground/50">{index + 1}</td>
                            <td className={`py-4 px-2 font-bold ${isWD(team.teamName) ? "text-primary" : ""}`}>{team.teamName}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.played ?? "-"}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.won ?? "-"}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.drawn ?? "-"}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.lost ?? "-"}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.goalsFor ?? "-"}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.goalsAgainst ?? "-"}</td>
                            <td className="py-4 px-2 text-center font-mono opacity-80">{team.goalDifference ?? "-"}</td>
                            <td className={`py-4 pl-2 pr-6 text-center font-black font-mono ${isWD(team.teamName) ? "text-primary text-base" : ""}`}>
                              {team.points ?? "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// PRÓXIMOS PARTIDOS + CALENDARIO
// ─────────────────────────────────────────────
function UpcomingWithCalendar({ matches, isLoading, wdDisplayName }: { matches: any[]; isLoading: boolean; wdDisplayName: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const matchDates = useMemo(() => matches.map(m => new Date(m.date)), [matches]);
  const filtered = selectedDate ? matches.filter(m => isSameDay(new Date(m.date), selectedDate)) : matches;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-shrink-0">
        <MiniCalendar matchDates={matchDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>
      <div className="flex-1 space-y-4">
        {selectedDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Partidos del <strong>{format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</strong></span>
          </div>
        )}
        {isLoading ? (
          [1, 2, 3].map(i => (
            <Card key={i} className="border-0 shadow-none bg-transparent">
              <CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent>
            </Card>
          ))
        ) : filtered.length > 0 ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
            {filtered.map(match => {
              // Mostrar en orden real: LOCAL vs VISITANTE
              const homeTeam = match.isHome ? wdDisplayName : match.opponent;
              const awayTeam = match.isHome ? match.opponent : wdDisplayName;
              return (
                <motion.div key={match.id} variants={fadeIn}>
                  <Card className="hover-elevate active-elevate-2 group border-border/40 hover:border-primary/50 transition-all duration-300 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                              {format(new Date(match.date), "EEEE, d 'de' MMMM", { locale: es })}
                              {" · "}
                              {new Date(match.date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" })}
                            </span>
                          </div>
                          <div className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors flex items-baseline gap-3 flex-wrap">
                            {homeTeam} vs {awayTeam}
                            <span className="text-xs font-normal text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">
                              {match.isHome ? "Local" : "Visitante"}
                            </span>
                          </div>
                          {match.location && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                              <MapPin className="h-4 w-4" />
                              {match.location}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="capitalize px-4 py-1.5">
                          {matchCat(match)}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <Card className="p-16 border-dashed border-2 bg-transparent text-center">
            <div className="text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {selectedDate ? "No hay partidos en esta fecha." : "No hay partidos próximos programados."}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RESULTADOS PASADOS
// ─────────────────────────────────────────────
function PastMatchesList({ matches, isLoading, wdDisplayName }: { matches: any[]; isLoading: boolean; wdDisplayName: string }) {
  const getBadgeVariant = (r: string | null) => r === "win" ? "default" as const : r === "loss" ? "destructive" as const : "secondary" as const;
  const getResultText = (r: string | null) => r === "win" ? "Victoria" : r === "loss" ? "Derrota" : "Empate";

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="border-0 bg-transparent">
          <CardContent className="p-6"><div className="h-24 bg-muted animate-pulse rounded" /></CardContent>
        </Card>
      ))}
    </div>
  );

  if (matches.length === 0) return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible">
      <Card className="p-16 border-dashed border-2 bg-transparent text-center">
        <div className="text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No hay resultados disponibles aún.</p>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
      {matches.map(match => {
        // Mostrar en orden real: LOCAL vs VISITANTE, homeScore - awayScore
        const homeTeam = match.isHome ? wdDisplayName : match.opponent;
        const awayTeam = match.isHome ? match.opponent : wdDisplayName;
        return (
          <motion.div key={match.id} variants={fadeIn}>
            <Card className="hover-elevate active-elevate-2 group border-border/40 hover:border-primary/50 transition-all duration-300 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {format(new Date(match.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </span>
                      <Badge variant={getBadgeVariant(match.result)} className="ml-2 px-3 py-0.5 shadow-sm">
                        {getResultText(match.result)}
                      </Badge>
                    </div>
                    <div className="text-2xl font-black mb-3 tracking-tight group-hover:text-primary transition-colors flex items-baseline gap-3 flex-wrap">
                      {homeTeam} vs {awayTeam}
                      <span className="text-xs font-normal text-muted-foreground border border-border/50 rounded px-1.5 py-0.5">
                        {match.isHome ? "Local" : "Visitante"}
                      </span>
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
                  <Badge variant="outline" className="capitalize px-4 py-1.5 border-primary/20 bg-primary/5">
                    {matchCat(match)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// FILTER UI & LOGIC
// ─────────────────────────────────────────────
const getCategoryWeight = (cat: string) => {
  const lower = cat.toLowerCase();
  if (lower.includes("sub") || lower.includes("u-") || lower.includes("u ")) {
    const num = parseInt(lower.replace(/\D/g, ''), 10);
    return isNaN(num) ? 50 : num; // e.g. Sub 8 -> 8, Sub 10 -> 10, Sub 16 -> 16
  }
  if (lower.includes("mayores") || lower.includes("pro") || lower.includes("elite")) return 90;
  if (lower.includes("girl") || lower.includes("niña")) return 100;
  if (lower.includes("women") || lower.includes("damas") || lower.includes("mujer")) return 110;
  return 60;
};

const sortCategories = (a: string, b: string) => {
  return getCategoryWeight(a) - getCategoryWeight(b) || a.localeCompare(b);
};

export const matchCat = (m: any) => {
  const notesStr = m.notes || m.division || "";
  if (!notesStr) return "General";
  
  if (isFedepatin(m)) {
    const parts = notesStr.split(" - ");
    const lastPart = parts[parts.length - 1].trim();
    if (!lastPart.toLowerCase().includes("sub") && !lastPart.toLowerCase().includes("juvenil")) {
      const dashParts = notesStr.split("-");
      const dashedLast = dashParts[dashParts.length - 1].trim();
      if (dashedLast.length > 20) return "General";
      return dashedLast || "General";
    }
    return lastPart || "General";
  }
  
  // Para Fedehockey
  const p = notesStr.split(" - ")[0].trim();
  if (p.length > 20) return "General";
  return p || "General";
};

export const standCat = (s: any) => matchCat(s);

function CategoryFilter({ categories, selected, onChange }: { categories: string[], selected: string, onChange: (c: string) => void }) {
  if (categories.length <= 1) return null;
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Badge
        variant={selected === "all" ? "default" : "outline"}
        className="cursor-pointer px-4 py-1.5 hover:bg-primary/90 hover:text-primary-foreground transition-colors"
        onClick={() => onChange("all")}
      >
        Todas las categorías
      </Badge>
      {categories.map(c => (
        <Badge
          key={c}
          variant={selected === c ? "default" : "outline"}
          className="cursor-pointer px-4 py-1.5 hover:bg-primary/90 hover:text-primary-foreground transition-colors"
          onClick={() => onChange(c)}
        >
          {c}
        </Badge>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────
export default function Tournaments() {
  useSEO({
    title: "Torneos y Resultados",
    description: "Calendario, resultados y tabla de posiciones de Optima Wild Dogs Hockey Club.",
    url: "/torneos",
  });

  const { isLoading, error, data } = db.useQuery({ matches: {}, standings: {} });
  const [fhCat, setFhCat] = useState<string>("all");
  const [fpCat, setFpCat] = useState<string>("all");

  const now = Date.now();
  const rawMatches: any[] = data?.matches || [];
  const standingsData: any[] = data?.standings || [];

  // Deduplicación de partidos (soluciona el bug de n8n que insertaba con timezone +5 y luego el correcto)
  // Agrupamos por (oponente, notas/categoria, local/visitante, y día calendario).
  // Retenemos el de creación más reciente (el correcto/último run de n8n).
  const matchesData = useMemo(() => {
    const deduped = new Map<string, any>();
    const sorted = [...rawMatches].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    for (const m of sorted) {
      if (!m.date || !m.opponent) continue;
      const dateStr = new Date(m.date).toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
      const homeAway = m.isHome ? "home" : "away";
      const key = `${m.opponent?.trim().toLowerCase()}-${m.notes?.trim().toLowerCase()}-${homeAway}-${dateStr}`;
      
      if (!deduped.has(key)) {
        deduped.set(key, m);
      }
    }
    return Array.from(deduped.values());
  }, [rawMatches]);

  // ── Fedehockey ──────────────────────────────
  const fhMatches = matchesData.filter(isFedehockey);
  const fhStandings = standingsData.filter(isFedehockey);
  
  const fhCategories = useMemo(() => {
    const s = new Set<string>();
    fhMatches.forEach(m => s.add(matchCat(m)));
    fhStandings.forEach(st => s.add(standCat(st)));
    return Array.from(s).sort(sortCategories);
  }, [fhMatches, fhStandings]);

  const viewFhMatches = fhCat === "all" ? fhMatches : fhMatches.filter(m => matchCat(m) === fhCat);
  const viewFhStandings = fhCat === "all" ? fhStandings : fhStandings.filter(s => standCat(s) === fhCat);

  const fhUpcoming = viewFhMatches
    .filter(m => m.status === "Not Started" && new Date(m.date).getTime() >= now)
    .sort((a, b) => a.date - b.date);
  const fhPast = viewFhMatches
    .filter(m => m.status !== "Not Started" || new Date(m.date).getTime() < now)
    .filter(m => m.result)   // solo mostrar partidos con resultado registrado
    .sort((a, b) => b.date - a.date);

  // ── Fedepatín ───────────────────────────────
  const fpMatches = matchesData.filter(isFedepatin);
  const fpStandings = standingsData.filter(isFedepatin);

  // Mapa de apoyo para Standings que no tienen categoría clara
  const fpTeamCatMap = useMemo(() => {
    const map = new Map<string, string>();
    fpMatches.forEach(m => {
      const cat = matchCat(m);
      if (cat && cat !== "General") {
        if (m.home) map.set(m.home.toLowerCase().trim(), cat);
        if (m.opponent) map.set(m.opponent.toLowerCase().trim(), cat);
      }
    });
    return map;
  }, [fpMatches]);

  const getFpStandCat = (s: any) => {
    let cat = standCat(s);
    if (cat === "General" || !cat) {
      const team = (s.teamName || "").toLowerCase().trim();
      if (fpTeamCatMap.has(team)) {
        return fpTeamCatMap.get(team)!;
      }
    }
    return cat;
  };

  const fpCategories = useMemo(() => {
    const s = new Set<string>();
    fpMatches.forEach(m => s.add(matchCat(m)));
    fpStandings.forEach(st => s.add(getFpStandCat(st)));
    return Array.from(s).sort(sortCategories);
  }, [fpMatches, fpStandings, fpTeamCatMap]);

  const viewFpMatches = fpCat === "all" ? fpMatches : fpMatches.filter(m => matchCat(m) === fpCat);
  const viewFpStandings = fpCat === "all" ? fpStandings : fpStandings.filter(s => getFpStandCat(s) === fpCat);

  const fpUpcoming = viewFpMatches
    .filter(m => m.status === "Not Started" && new Date(m.date).getTime() >= now)
    .sort((a, b) => a.date - b.date);
  const fpPast = viewFpMatches
    .filter(m => m.status !== "Not Started" || new Date(m.date).getTime() < now)
    .filter(m => m.result)
    .sort((a, b) => b.date - a.date);

  if (error) {
    return <div className="p-8 text-center text-red-500">Error cargando datos: {error.message}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav />

      {/* Hero */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40 pointer-events-none mix-blend-multiply"
          style={{ backgroundImage: `url(${textureBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px_16px]" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase drop-shadow-2xl">Torneos</h1>
            <p className="text-xl md:text-2xl opacity-90 font-light drop-shadow-md">
              La energía en la pista: resultados, calendario y tablas de posiciones
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="fedehockey" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12 h-14">
              <TabsTrigger value="fedehockey" className="text-base font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Fedehockey
              </TabsTrigger>
              <TabsTrigger value="fedepatin" className="text-base font-bold flex items-center gap-2">
                <Trophy className="h-4 w-4" /> Fedepatín
              </TabsTrigger>
            </TabsList>

            {/* ── FEDEHOCKEY ── */}
            <TabsContent value="fedehockey">
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary px-3 py-1">Liga Fedehockey Colombia</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Cancha Fedehockey</span>
              </div>
              <CategoryFilter categories={fhCategories} selected={fhCat} onChange={setFhCat} />
              <Tabs defaultValue="upcoming-fh">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="upcoming-fh">Próximos Partidos</TabsTrigger>
                  <TabsTrigger value="results-fh">Resultados</TabsTrigger>
                  <TabsTrigger value="standings-fh">Tabla de Posiciones</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming-fh">
                  <UpcomingWithCalendar matches={fhUpcoming} isLoading={isLoading} wdDisplayName={WD_DISPLAY_FH} />
                </TabsContent>
                <TabsContent value="results-fh">
                  <PastMatchesList matches={fhPast} isLoading={isLoading} wdDisplayName={WD_DISPLAY_FH} />
                </TabsContent>
                <TabsContent value="standings-fh">
                  <StandingsTable standings={viewFhStandings} getCategory={standCat} />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* ── FEDEPATÍN ── */}
            <TabsContent value="fedepatin">
              <div className="mb-4 flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="border-secondary/30 bg-secondary/5 text-secondary px-3 py-1">Liga Fedepatín Colombia</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Cancha Fedepatín</span>
                <Badge variant="secondary" className="text-xs">Jugamos como: Condors</Badge>
              </div>
              <CategoryFilter categories={fpCategories} selected={fpCat} onChange={setFpCat} />
              <Tabs defaultValue="upcoming-fp">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="upcoming-fp">Próximos Partidos</TabsTrigger>
                  <TabsTrigger value="results-fp">Resultados</TabsTrigger>
                  <TabsTrigger value="standings-fp">Tabla de Posiciones</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming-fp">
                  <UpcomingWithCalendar matches={fpUpcoming} isLoading={isLoading} wdDisplayName={WD_DISPLAY_FP} />
                </TabsContent>
                <TabsContent value="results-fp">
                  <PastMatchesList matches={fpPast} isLoading={isLoading} wdDisplayName={WD_DISPLAY_FP} />
                </TabsContent>
                <TabsContent value="standings-fp">
                  <StandingsTable standings={viewFpStandings} getCategory={getFpStandCat} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
}
