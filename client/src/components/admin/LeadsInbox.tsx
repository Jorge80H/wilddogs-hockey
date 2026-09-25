import { useState } from "react";
import { id } from "@instantdb/react";
import { db } from "@/lib/instant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABELS,
  computeLeadStatus,
  summarizeLeads,
  summarizeBySource,
  buildLeadSubject,
  buildLeadMessage,
  CLUB_WHATSAPP,
  type LeadStatus,
} from "@/lib/leads";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABELS,
  normalizeLeadSource,
  type LeadSource,
} from "@/lib/attribution";

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

/** Orígenes que tiene sentido elegir a mano (los que llegan sin pasar por el sitio). */
const MANUAL_SOURCES: LeadSource[] = ["meta_ads", "instagram", "colegio", "referido", "google_ads", "google", "whatsapp", "otro"];

const SELECT_CLASS =
  "h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

const EMPTY_MANUAL = { parentName: "", childName: "", childAge: "", phone: "", source: "meta_ads" as LeadSource };

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
 * Recibe lo que entra por `/unete` y lo que el club registra a mano desde WhatsApp.
 */
export function LeadsInbox() {
  const { toast } = useToast();
  const [filter, setFilter] = useState<LeadStatus | "todos">("todos");
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState(EMPTY_MANUAL);
  const [saving, setSaving] = useState(false);

  const { data, isLoading, error } = db.useQuery({
    contactSubmissions: { $: { order: { createdAt: "desc" } } },
  });

  const leads = (data?.contactSubmissions || []) as any[];
  const summary = summarizeLeads(leads);
  const bySource = summarizeBySource(leads);
  const visible = filter === "todos" ? leads : leads.filter((l) => computeLeadStatus(l) === filter);

  const setStatus = async (lead: any, status: LeadStatus) => {
    await db.transact([
      db.tx.contactSubmissions[lead.id].update({ status, isRead: true }),
    ]);
    toast({ title: `Lead marcado como "${LEAD_STATUS_LABELS[status]}"` });
  };

  const setSource = async (lead: any, source: LeadSource) => {
    await db.transact([db.tx.contactSubmissions[lead.id].update({ source })]);
  };

  const saveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manual.parentName.trim() || !manual.phone.trim()) return;
    setSaving(true);
    const lead = {
      parentName: manual.parentName,
      childName: manual.childName,
      childAge: manual.childAge,
      phone: manual.phone,
    };
    try {
      await db.transact([
        db.tx.contactSubmissions[id()].update({
          name: manual.parentName.trim(),
          email: "no-email@optimawilddogs.com",
          phone: manual.phone.trim(),
          subject: buildLeadSubject(lead),
          message: buildLeadMessage(lead),
          status: "contactado",
          source: manual.source,
          isRead: true,
          createdAt: Date.now(),
        }),
      ]);
      toast({ title: "Lead registrado", description: `Origen: ${LEAD_SOURCE_LABELS[manual.source]}` });
      setManual(EMPTY_MANUAL);
      setShowManual(false);
    } catch {
      toast({ title: "No se pudo guardar", description: "Intenta de nuevo.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
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
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>Leads · Clase de cortesía</CardTitle>
        <Button size="sm" variant={showManual ? "ghost" : "default"} onClick={() => setShowManual(!showManual)}>
          {showManual ? "Cancelar" : "+ Registrar lead de WhatsApp"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showManual && (
          <form onSubmit={saveManual} className="border rounded-lg p-3 space-y-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Para familias que escribieron directo al WhatsApp (anuncio de Meta, colegio, referido)
              sin pasar por el formulario de la web.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="m-parent">Padre/madre *</Label>
                <Input id="m-parent" value={manual.parentName} onChange={(e) => setManual({ ...manual, parentName: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="m-phone">WhatsApp *</Label>
                <Input id="m-phone" inputMode="tel" value={manual.phone} onChange={(e) => setManual({ ...manual, phone: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="m-child">Hijo/a</Label>
                <Input id="m-child" value={manual.childName} onChange={(e) => setManual({ ...manual, childName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="m-age">Edad</Label>
                <Input id="m-age" inputMode="numeric" value={manual.childAge} onChange={(e) => setManual({ ...manual, childAge: e.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="m-source">¿Cómo nos conoció?</Label>
                <select
                  id="m-source"
                  className={`${SELECT_CLASS} w-full`}
                  value={manual.source}
                  onChange={(e) => setManual({ ...manual, source: e.target.value as LeadSource })}
                >
                  {MANUAL_SOURCES.map((s) => (
                    <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Guardando..." : "Guardar lead"}
            </Button>
          </form>
        )}

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

        {/* Origen */}
        {bySource.length > 0 && (
          <div className="border rounded-lg p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              De dónde vienen
            </div>
            <div className="flex flex-wrap gap-2">
              {bySource.map((row) => (
                <div key={row.source} className="text-xs border rounded-md px-2 py-1 bg-muted/40">
                  <span className="font-semibold">{LEAD_SOURCE_LABELS[row.source]}</span>
                  <span className="text-muted-foreground"> · {row.total} leads · {row.inscritos} inscritos</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
          const source = normalizeLeadSource(lead.source);
          return (
            <div key={lead.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-xs text-muted-foreground">{lead.subject}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(lead.createdAt)}
                    {lead.campaign ? ` · campaña ${lead.campaign}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Origen del lead"
                    className={`${SELECT_CLASS} h-7 text-xs`}
                    value={source}
                    onChange={(e) => setSource(lead, e.target.value as LeadSource)}
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>{LEAD_SOURCE_LABELS[s]}</option>
                    ))}
                  </select>
                  <span
                    className={`text-[10px] uppercase font-bold border rounded-full px-2 py-1 whitespace-nowrap ${STATUS_STYLES[status]}`}
                  >
                    {LEAD_STATUS_LABELS[status]}
                  </span>
                </div>
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
