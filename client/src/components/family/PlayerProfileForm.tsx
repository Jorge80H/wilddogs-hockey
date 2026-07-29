import { useState } from "react";
import { db } from "@/lib/instant";
import { id as txId } from "@instantdb/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { playerProfileSchema, CATEGORIES } from "@/lib/playerSchema";

const CATEGORY_LABELS: Record<string, string> = {
  sub8: "Sub 8", sub12: "Sub 12", sub14: "Sub 14", sub16: "Sub 16", sub18: "Sub 18", mayores: "Mayores",
};

export function PlayerProfileForm({
  titularId, existing, onDone,
}: { titularId: string; existing?: any; onDone?: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: existing?.firstName || "",
    lastName: existing?.lastName || "",
    relationshipToTitular: existing?.relationshipToTitular || "hijo",
    category: existing?.category || "sub12",
    dateOfBirth: existing?.dateOfBirth || "",
    position: existing?.position || "",
    bloodType: existing?.bloodType || "",
    allergies: existing?.allergies || "",
    medicalConditions: existing?.medicalConditions || "",
    emergencyContact: existing?.emergencyContact || "",
    emergencyPhone: existing?.emergencyPhone || "",
    secondaryContactName: existing?.secondaryContactName || "",
    secondaryContactPhone: existing?.secondaryContactPhone || "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const isSelf = form.relationshipToTitular === "self";

  const save = async () => {
    const parsed = playerProfileSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Revisa los datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    const pid = existing?.id || txId();
    const ops: any[] = [
      db.tx.playerProfiles[pid].update({
        ...parsed.data,
        status: existing?.status || "pending",
        gamesPlayed: existing?.gamesPlayed ?? 0,
        goals: existing?.goals ?? 0,
        assists: existing?.assists ?? 0,
        createdAt: existing?.createdAt || Date.now(),
        updatedAt: Date.now(),
      }),
    ];
    if (!existing) ops.push(db.tx.playerProfiles[pid].link({ titular: titularId }));
    await db.transact(ops);
    toast({ title: existing ? "✅ Datos actualizados" : "✅ Jugador agregado (en revisión)" });
    onDone?.();
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isSelf ? "Tus datos de jugador" : existing ? "Editar jugador" : "Agregar jugador"}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nombre</Label><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
          <div><Label>Apellido</Label><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
          <div>
            <Label>Relación contigo</Label>
            <select className="w-full border rounded h-10 px-2" value={form.relationshipToTitular}
              onChange={(e) => set("relationshipToTitular", e.target.value)}>
              <option value="hijo">Hijo</option>
              <option value="hija">Hija</option>
              <option value="otro">Otro</option>
              <option value="self">Yo mismo (jugador adulto)</option>
            </select>
          </div>
          <div>
            <Label>Categoría deseada</Label>
            <select className="w-full border rounded h-10 px-2" value={form.category}
              onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div><Label>Fecha de nacimiento</Label><Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} /></div>
          <div><Label>Posición</Label><Input value={form.position} onChange={(e) => set("position", e.target.value)} /></div>
          <div><Label>Tipo de sangre</Label><Input value={form.bloodType} onChange={(e) => set("bloodType", e.target.value)} /></div>
          <div><Label>Contacto emergencia</Label><Input value={form.emergencyContact} onChange={(e) => set("emergencyContact", e.target.value)} /></div>
          <div><Label>Tel. emergencia</Label><Input value={form.emergencyPhone} onChange={(e) => set("emergencyPhone", e.target.value)} /></div>
          <div className="col-span-2"><Label>Alergias / condiciones médicas</Label><Input value={form.medicalConditions} onChange={(e) => set("medicalConditions", e.target.value)} /></div>
        </div>
        <Button onClick={save} className="w-full">{existing ? "Guardar cambios" : "Agregar jugador"}</Button>
      </CardContent>
    </Card>
  );
}
