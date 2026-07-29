import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { titularSchema } from "@/lib/playerSchema";

export function TitularOnboardingForm({ titular, onDone }: { titular: any; onDone?: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: titular?.firstName || "",
    lastName: titular?.lastName || "",
    phone: titular?.phone || "",
    documentType: titular?.documentType || "CC",
    documentNumber: titular?.documentNumber || "",
    address: titular?.address || "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    const parsed = titularSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Revisa los datos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    await db.transact([
      db.tx.users[titular.id].update({ ...parsed.data, updatedAt: Date.now() }),
    ]);
    toast({ title: "✅ Datos guardados" });
    onDone?.();
  };

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader><CardTitle>Completa tus datos de contacto</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Nombre</Label><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} /></div>
          <div><Label>Apellido</Label><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} /></div>
          <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
          <div><Label>Documento</Label><Input value={form.documentNumber} onChange={(e) => set("documentNumber", e.target.value)} /></div>
          <div className="col-span-2"><Label>Dirección</Label><Input value={form.address} onChange={(e) => set("address", e.target.value)} /></div>
        </div>
        <Button onClick={save} className="w-full">Guardar</Button>
      </CardContent>
    </Card>
  );
}
