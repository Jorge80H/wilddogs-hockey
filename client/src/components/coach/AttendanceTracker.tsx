import { useState } from "react";
import { db } from "@/lib/instant";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tx, id as txId } from "@instantdb/react";
import { CalendarCheck, Plus, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { playerDisplayName } from "@/lib/players";

export function AttendanceTracker({ coachCategory }: { coachCategory?: string }) {
  const { toast } = useToast();

  const { data } = db.useQuery({
    trainingSessions: {
      $: coachCategory ? { where: { category: coachCategory } } : {},
      attendances: { player: {} },
    },
    playerProfiles: {
      $: coachCategory ? { where: { category: coachCategory, status: "approved" } } : { where: { status: "approved" } },
    },
  });

  const sessions = ((data?.trainingSessions || []) as any[]).sort((a, b) => (b.date || 0) - (a.date || 0));
  const players = (data?.playerProfiles || []) as any[];

  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [showCreateSession, setShowCreateSession] = useState(false);

  // New session state
  const [sessionDate, setSessionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("18:30");
  const [endTime, setEndTime] = useState("20:00");
  const [location, setLocation] = useState("Cancha Fedepatín / PRD");
  const [objective, setObjective] = useState("");

  const activeSessionId = selectedSessionId || (sessions[0]?.id || "");
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;

  const handleCreateSession = async () => {
    if (!coachCategory) {
      toast({ title: "Error", description: "Tu ficha de entrenador no tiene categoría asignada.", variant: "destructive" });
      return;
    }

    try {
      const sessionId = txId();
      const timestamp = new Date(sessionDate).getTime();

      await db.transact([
        tx.trainingSessions[sessionId].update({
          category: coachCategory,
          date: timestamp,
          startTime: startTime.trim() || undefined,
          endTime: endTime.trim() || undefined,
          location: location.trim() || undefined,
          objective: objective.trim() || undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ]);

      toast({ title: "✅ Sesión de entrenamiento creada" });
      setShowCreateSession(false);
      setSelectedSessionId(sessionId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSetAttendance = async (playerId: string, status: "present" | "absent" | "excused" | "late") => {
    if (!activeSession) return;

    try {
      const existingAttendance = ((activeSession.attendances || []) as any[]).find((a) => a.player?.id === playerId);
      const attId = existingAttendance?.id || txId();

      const ops: any[] = [
        tx.attendance[attId].update({
          status,
          updatedAt: Date.now(),
          createdAt: existingAttendance?.createdAt || Date.now(),
        }),
        tx.attendance[attId].link({ session: activeSession.id }),
        tx.attendance[attId].link({ player: playerId }),
      ];

      await db.transact(ops);
      toast({ title: `Asistencia: ${status}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-emerald-500" /> Toma de Asistencia en Tiempo Real {coachCategory ? `(${coachCategory})` : ""}
        </CardTitle>
        <Button size="sm" onClick={() => setShowCreateSession(!showCreateSession)}>
          <Plus className="mr-1 h-4 w-4" /> {showCreateSession ? "Cancelar" : "Nuevo Entrenamiento"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {showCreateSession && (
          <div className="p-4 border rounded-lg bg-muted/20 space-y-4">
            <h4 className="font-semibold text-sm">Programar Sesión de Entrenamiento</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Fecha</Label>
                <Input type="date" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Hora Inicio</Label>
                <Input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Hora Fin</Label>
                <Input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Lugar / Cancha</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Objetivo Técnico/Táctico</Label>
                <Input value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Ej. Táctica defensiva..." className="h-8 text-xs" />
              </div>
            </div>

            <Button onClick={handleCreateSession} className="w-full">Guardar Sesión</Button>
          </div>
        )}

        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aún no hay sesiones de entrenamiento programadas para esta categoría.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="text-xs">Seleccionar Fecha de Entrenamiento</Label>
              <div className="w-64">
                <Select value={activeSessionId} onValueChange={setSelectedSessionId}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Seleccionar sesión..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.date ? format(new Date(s.date), "d 'de' MMMM, yyyy", { locale: es }) : "Fecha"} ({s.startTime || ""})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeSession && (
              <div className="p-3 border rounded bg-card space-y-3">
                <div className="flex items-center justify-between text-xs border-b pb-2">
                  <span className="font-semibold text-primary">{activeSession.location || "Cancha"}</span>
                  <span className="text-muted-foreground">{activeSession.objective || "Sin objetivo especificado"}</span>
                </div>

                <div className="space-y-2">
                  {players.map((p) => {
                    const attRecord = ((activeSession.attendances || []) as any[]).find((a) => a.player?.id === p.id);
                    const currentStatus = attRecord?.status || null;

                    return (
                      <div key={p.id} className="flex items-center justify-between p-2 border rounded text-xs bg-background">
                        <span className="font-medium">{playerDisplayName(p)}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant={currentStatus === "present" ? "default" : "outline"}
                            className="h-7 px-2 text-[10px]"
                            onClick={() => handleSetAttendance(p.id, "present")}
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-400" /> Presente
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === "late" ? "secondary" : "outline"}
                            className="h-7 px-2 text-[10px]"
                            onClick={() => handleSetAttendance(p.id, "late")}
                          >
                            <Clock className="mr-1 h-3 w-3 text-amber-500" /> Tarde
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === "excused" ? "secondary" : "outline"}
                            className="h-7 px-2 text-[10px]"
                            onClick={() => handleSetAttendance(p.id, "excused")}
                          >
                            <AlertCircle className="mr-1 h-3 w-3 text-blue-500" /> Exc.
                          </Button>
                          <Button
                            size="sm"
                            variant={currentStatus === "absent" ? "destructive" : "outline"}
                            className="h-7 px-2 text-[10px]"
                            onClick={() => handleSetAttendance(p.id, "absent")}
                          >
                            <XCircle className="mr-1 h-3 w-3" /> Ausente
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
