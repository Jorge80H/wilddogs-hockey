/**
 * Wild Dogs Hockey Club - Lógica de captación (Clase de Cortesía)
 *
 * Lógica pura y testeable del embudo de captación:
 *   franjas disponibles → mensaje de WhatsApp pre-armado → estado del lead en la bandeja.
 *
 * Las franjas viven aquí como fuente única de verdad y deben mantenerse consistentes
 * con los horarios publicados en `client/src/pages/Services.tsx`.
 */

/** WhatsApp oficial del club en formato internacional sin '+' (requerido por wa.me). */
export const CLUB_WHATSAPP = "573143100208";

export interface TrialSlot {
  id: string;
  /** Texto que ve el padre y que viaja en el mensaje de WhatsApp. */
  label: string;
  location: string;
  /** Categorías que entrenan en esa franja, para contexto del coach. */
  categories: string;
  minAge: number;
  maxAge: number;
}

/**
 * Franjas de clase de cortesía: cupos dentro de entrenamientos que ya existen,
 * de modo que no cuestan horas extra de coach.
 */
export const TRIAL_SLOTS: TrialSlot[] = [
  {
    id: "lun-17",
    label: "Lunes 5:00 PM",
    location: "Hockey One (Cra 22 #164-83)",
    categories: "Sub 8, Sub 10 y Sub 12",
    minAge: 5,
    maxAge: 12,
  },
  {
    id: "vie-1630",
    label: "Viernes 4:30 PM",
    location: "Hockey One (Cra 22 #164-83)",
    categories: "Sub 8, Sub 10 y Sub 12",
    minAge: 5,
    maxAge: 12,
  },
  {
    id: "sab-07",
    label: "Sábado 7:00 AM",
    location: "Hockey One (Cra 22 #164-83)",
    categories: "Sub 14 y Sub 16",
    minAge: 13,
    maxAge: 17,
  },
];

export interface TrialLead {
  parentName: string;
  childName?: string;
  childAge?: string | number;
  phone: string;
  email?: string;
  slotId?: string;
}

/** Estados del embudo, en el orden en que ocurren. */
export const LEAD_STATUSES = [
  "nuevo",
  "contactado",
  "agendado",
  "asistio",
  "inscrito",
  "descartado",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  agendado: "Clase agendada",
  asistio: "Asistió a la clase",
  inscrito: "Inscrito",
  descartado: "Descartado",
};

export interface LeadRecord {
  isRead?: boolean;
  status?: string;
}

export interface LeadSummary extends Record<LeadStatus, number> {
  total: number;
}

/** Franjas compatibles con la edad del niño. Sin edad, se muestran todas. */
export function slotsForAge(age?: string | number): TrialSlot[] {
  if (age === undefined || age === null || age === "") return TRIAL_SLOTS;

  const parsed = typeof age === "number" ? age : parseInt(age, 10);
  if (Number.isNaN(parsed)) return TRIAL_SLOTS;

  return TRIAL_SLOTS.filter((slot) => parsed >= slot.minAge && parsed <= slot.maxAge);
}

export function findSlot(slotId?: string): TrialSlot | undefined {
  if (!slotId) return undefined;
  return TRIAL_SLOTS.find((slot) => slot.id === slotId);
}

/**
 * Mensaje que el padre envía al club. La conversación la inicia la familia:
 * así el club puede responder por WhatsApp sin restricciones y el lead no se enfría.
 */
export function buildWhatsAppTrialText(lead: TrialLead): string {
  const slot = findSlot(lead.slotId);
  const child = lead.childName?.trim();
  const age = lead.childAge ? `${lead.childAge} años` : "";

  const lines: string[] = [
    `Hola Wild Dogs, soy ${lead.parentName.trim()}.`,
    "",
    "Quiero agendar la clase de cortesía 🏒",
  ];

  if (child && age) {
    lines.push(`Para: ${child} (${age})`);
  } else if (child || age) {
    lines.push(`Para: ${child || age}`);
  }

  if (slot) {
    lines.push(`Franja que me sirve: ${slot.label} en ${slot.location}`);
  } else {
    lines.push("Quiero saber qué horarios tienen disponibles.");
  }

  return lines.join("\n");
}

/** URL lista para abrir el chat de WhatsApp del club con el mensaje pre-cargado. */
export function buildWhatsAppTrialUrl(lead: TrialLead): string {
  return `https://wa.me/${CLUB_WHATSAPP}?text=${encodeURIComponent(buildWhatsAppTrialText(lead))}`;
}

/** Asunto del registro en la bandeja de leads: legible de un vistazo. */
export function buildLeadSubject(lead: TrialLead): string {
  const slot = findSlot(lead.slotId);
  const child = lead.childName?.trim() || "Sin nombre";
  const age = lead.childAge ? `${lead.childAge} años` : "edad no indicada";
  const when = slot ? slot.label : "sin franja elegida";

  return `Clase de cortesía · ${child} (${age}) · ${when}`;
}

/** Detalle completo del formulario, para que el coach tenga todo al contactar. */
export function buildLeadMessage(lead: TrialLead): string {
  const slot = findSlot(lead.slotId);

  return [
    `Padre/madre: ${lead.parentName.trim()}`,
    `Hijo/a: ${lead.childName?.trim() || "No indicado"}`,
    `Edad: ${lead.childAge || "No indicada"}`,
    `WhatsApp: ${lead.phone.trim()}`,
    `Email: ${lead.email?.trim() || "No indicado"}`,
    `Franja solicitada: ${slot ? `${slot.label} — ${slot.location} (${slot.categories})` : "No indicada"}`,
  ].join("\n");
}

/**
 * Estado del lead. El estado explícito manda; si no hay, se deriva de `isRead`
 * para que los registros creados antes de la bandeja no aparezcan sin clasificar.
 */
export function computeLeadStatus(lead: LeadRecord): LeadStatus {
  if (lead.status && (LEAD_STATUSES as readonly string[]).includes(lead.status)) {
    return lead.status as LeadStatus;
  }
  return lead.isRead ? "contactado" : "nuevo";
}

/** Conteo del embudo para la cabecera de la bandeja de leads. */
export function summarizeLeads(leads: LeadRecord[]): LeadSummary {
  const summary = LEAD_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {} as Record<LeadStatus, number>,
  );

  for (const lead of leads) {
    summary[computeLeadStatus(lead)] += 1;
  }

  return { ...summary, total: leads.length };
}
