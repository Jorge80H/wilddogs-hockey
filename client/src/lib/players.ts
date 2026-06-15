export type PlayerStatus = "pending" | "approved" | "rejected" | "inactive";
export type Relationship = "self" | "hijo" | "hija" | "otro";

const TRANSITIONS: Record<PlayerStatus, PlayerStatus[]> = {
  pending: ["approved", "rejected"],
  rejected: ["pending"],
  approved: ["inactive"],
  inactive: ["approved"],
};

export function canTransition(from: PlayerStatus, to: PlayerStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function canViewContent(status: PlayerStatus): boolean {
  return status === "approved";
}

const REL_LABELS: Record<string, string> = {
  self: "Tú",
  hijo: "Hijo",
  hija: "Hija",
  otro: "Otro",
};

export function relationshipLabel(rel: string | undefined): string {
  if (!rel) return "Jugador";
  return REL_LABELS[rel] ?? "Jugador";
}

export function playerDisplayName(p: { firstName?: string; lastName?: string }): string {
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ").trim();
  return name || "Jugador sin nombre";
}

export function coachCanApprove(
  coachCategory: string | undefined,
  playerCategory: string | undefined
): boolean {
  if (!coachCategory || !playerCategory) return false;
  return coachCategory === playerCategory;
}
