import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { playerDisplayName } from "@/lib/players";

/**
 * Cola de aprobación. Si `category` viene, filtra a esa categoría (uso coach).
 * `reviewerId` = users.id del staff que aprueba (para enlazar approvedBy).
 */
export function ApprovalQueue({ category, reviewerId }: { category?: string; reviewerId: string }) {
  const { toast } = useToast();
  const where: any = { status: "pending" };
  if (category) where.category = category;
  const { data } = db.useQuery({ playerProfiles: { $: { where }, titular: {}, documents: {} } });
  const pending = (data?.playerProfiles || []) as any[];
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const approve = async (p: any) => {
    await db.transact([
      db.tx.playerProfiles[p.id].update({ status: "approved", approvedAt: Date.now(), rejectionReason: undefined, updatedAt: Date.now() }),
      db.tx.playerProfiles[p.id].link({ approvedBy: reviewerId }),
    ]);
    toast({ title: `✅ ${playerDisplayName(p)} aprobado` });
  };
  const reject = async (p: any) => {
    if (!reason.trim()) { toast({ title: "Escribe un motivo", variant: "destructive" }); return; }
    await db.transact([
      db.tx.playerProfiles[p.id].update({ status: "rejected", rejectionReason: reason.trim(), updatedAt: Date.now() }),
    ]);
    toast({ title: `${playerDisplayName(p)} rechazado` });
    setRejecting(null); setReason("");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Aprobación de jugadores {category ? `(${category})` : ""}</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {pending.length === 0 && <p className="text-sm text-muted-foreground">No hay jugadores pendientes.</p>}
        {pending.map((p) => (
          <div key={p.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{playerDisplayName(p)}</div>
                <div className="text-xs text-muted-foreground capitalize">{p.category} · Titular: {p.titular?.[0]?.firstName || p.titular?.[0]?.email || "—"}</div>
                <div className="text-xs mt-1">Documentos: {(p.documents || []).length} cargados</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => approve(p)}>Aprobar</Button>
                <Button size="sm" variant="destructive" onClick={() => setRejecting(rejecting === p.id ? null : p.id)}>Rechazar</Button>
              </div>
            </div>
            {rejecting === p.id && (
              <div className="flex gap-2 mt-2">
                <Input placeholder="Motivo del rechazo" value={reason} onChange={(e) => setReason(e.target.value)} />
                <Button size="sm" variant="destructive" onClick={() => reject(p)}>Confirmar</Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
