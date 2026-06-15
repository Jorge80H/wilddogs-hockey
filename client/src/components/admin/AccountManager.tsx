import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const ROLES = ["guardian", "coach", "admin"];

export function AccountManager() {
  const { toast } = useToast();
  const { data } = db.useQuery({ users: { players: {}, coachProfile: {} } });
  const users = (data?.users || []) as any[];
  const [editing, setEditing] = useState<string | null>(null);

  const setRole = async (u: any, role: string) => {
    await db.transact([db.tx.users[u.id].update({ role, updatedAt: Date.now() })]);
    toast({ title: `Rol actualizado a ${role}` });
    setEditing(null);
  };

  return (
    <Card>
      <CardHeader><CardTitle>Cuentas</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between border rounded p-2">
            <div>
              <div className="font-medium text-sm">{u.firstName ? `${u.firstName} ${u.lastName || ""}` : u.email}</div>
              <div className="text-xs text-muted-foreground">{u.email} · {(u.players || []).length} jugador(es)</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{u.role}</Badge>
              {editing === u.id ? (
                <div className="flex gap-1">
                  {ROLES.map((r) => <Button key={r} size="sm" variant="secondary" onClick={() => setRole(u, r)}>{r}</Button>)}
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(u.id)}>Cambiar rol</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
