import { useState } from "react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  computeLeadStatus,
  summarizeLeads,
  CLUB_WHATSAPP,
  type LeadStatus,
} from "@/lib/leads";

const STATUS_STYLES: Record<LeadStatus, string> = {
  nuevo: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  contactado: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  agendado: "bg-purple-500/15 text-purple-600 border-purple-500/30",
  asistio: "bg-teal-500/15 text-teal-600 border-teal-500/30",
  inscrito: "bg-green-500/15 text-green-600 border-green-500/30",
  descartado: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
};

/** Estados que se ofrecen como acción rápida, en el orden del embudo. */
const NEXT_STATUSES: LeadStatus[] = ["contactado", "agendado", "asistio", "inscrito", "descartado"];

function formatDate(ts?: number): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Normaliza un teléfono colombiano a formato wa.me (57 + 10 dígitos). */
function whatsappLink(phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return `https://wa.me/${CLUB_WHATSAPP}`;
  const withCountry = digits.length === 10 ? `57${digits}` : digits;
  return `https://wa.me/${withCountry}`;
}

/**
 * Bandeja de leads de clase de cortesía.
 * Es el punto donde el club ve y gestiona lo que entra por `/unete`.
 */
export function LeadsInbox() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<LeadStatus | "todos">("todos");

  const { data, isLoading, error } = db.useQuery({
    contactSubmissions: { $: { order: { createdAt: "desc" } } },
  });

  const leads = (data?.contactSubmissions || []) as any[];
  const summary = summarizeLeads(leads);
  const visible = filter === "todos" ? leads : leads.filter((l) => computeLeadStatus(l) === filter);

  const setStatus = async (lead: any, status: LeadStatus) => {
    await db.transact([
      db.tx.contactSubmissions[lead.id].update({ status, isRead: true }),
    ]);
    toast({ title: `Lead marcado como "${LEAD_STATUS_LABELS[status]}"` });
  };

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Leads · Clase de cortesía</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            No se pudieron cargar los leads. Verifica que los permisos de
            <code className="mx-1">contactSubmissions</code> estén publicados en InstantDB.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads · Clase de cortesía</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Embudo */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {LEAD_STATUSES.map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(filter === status ? "todos" : status)}
                className={`border rounded-lg p-2 text-center transition-colors ${
                  filter === status ? "ring-2 ring-primary" : ""
                } ${STATUS_STYLES[status]}`}
              >
                <div className="text-2xl font-bold tabular-nums">{summary[status]}</div>
                <div className="text-[10px] uppercase tracking-wide font-semibold">
                  {LEAD_STATUS_LABELS[status]}
                </div>
              </button>
            ),
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filter === "todos"
              ? `${summary.total} leads en total`
              : `${visible.length} en "${LEAD_STATUS_LABELS[filter]}"`}
          </span>
          {filter !== "todos" && (
            <Button size="sm" variant="ghost" onClick={() => setFilter("todos")}>
              Ver todos
            </Button>
          )}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Cargando leads...</p>}

        {!isLoading && visible.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay leads {filter === "todos" ? "todavía" : `en "${LEAD_STATUS_LABELS[filter]}"`}.
          </p>
        )}

        {visible.map((lead) => {
          const status = computeLeadStatus(lead);
          return (
            <div key={lead.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-xs text-muted-foreground">{lead.subject}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(lead.createdAt)}
                  </div>
                </div>
                <span
                  className={`text-[10px] uppercase font-bold border rounded-full px-2 py-1 whitespace-nowrap ${STATUS_STYLES[status]}`}
                >
                  {LEAD_STATUS_LABELS[status]}
                </span>
              </div>

              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans bg-muted/40 rounded p-2">
                {lead.message}
              </pre>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" asChild>
                  <a href={whatsappLink(lead.phone)} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </Button>
                {NEXT_STATUSES.filter((s) => s !== status).map((s) => (
                  <Button key={s} size="sm" variant="outline" onClick={() => setStatus(lead, s)}>
                    {LEAD_STATUS_LABELS[s]}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
