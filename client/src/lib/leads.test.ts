import { describe, it, expect } from "vitest";
import {
  TRIAL_SLOTS,
  CLUB_WHATSAPP,
  slotsForAge,
  findSlot,
  buildWhatsAppTrialUrl,
  buildLeadSubject,
  buildLeadMessage,
  computeLeadStatus,
  summarizeLeads,
  type TrialLead,
} from "./leads";

const lead: TrialLead = {
  parentName: "María Gómez",
  childName: "Samuel",
  childAge: "9",
  phone: "3001234567",
  email: "maria@ejemplo.com",
  slotId: "lun-17",
};

describe("TRIAL_SLOTS", () => {
  it("define franjas con id único y rango de edad coherente", () => {
    const ids = TRIAL_SLOTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const slot of TRIAL_SLOTS) {
      expect(slot.minAge).toBeLessThanOrEqual(slot.maxAge);
      expect(slot.label.length).toBeGreaterThan(0);
      expect(slot.location.length).toBeGreaterThan(0);
    }
  });
});

describe("slotsForAge", () => {
  it("retorna solo las franjas que cubren la edad del niño", () => {
    const slots = slotsForAge(9);
    expect(slots.length).toBeGreaterThan(0);
    for (const slot of slots) {
      expect(9).toBeGreaterThanOrEqual(slot.minAge);
      expect(9).toBeLessThanOrEqual(slot.maxAge);
    }
  });

  it("acepta la edad como cadena (viene de un <select>)", () => {
    expect(slotsForAge("9")).toEqual(slotsForAge(9));
  });

  it("retorna todas las franjas cuando no hay edad seleccionada", () => {
    expect(slotsForAge("")).toEqual(TRIAL_SLOTS);
    expect(slotsForAge(undefined)).toEqual(TRIAL_SLOTS);
  });

  it("retorna lista vacía para una edad fuera de todo rango", () => {
    expect(slotsForAge(99)).toEqual([]);
  });
});

describe("findSlot", () => {
  it("encuentra la franja por id", () => {
    expect(findSlot("lun-17")?.id).toBe("lun-17");
  });

  it("retorna undefined para un id desconocido o vacío", () => {
    expect(findSlot("no-existe")).toBeUndefined();
    expect(findSlot("")).toBeUndefined();
  });
});

describe("buildWhatsAppTrialUrl", () => {
  it("apunta al WhatsApp del club en formato wa.me", () => {
    const url = buildWhatsAppTrialUrl(lead);
    expect(url.startsWith(`https://wa.me/${CLUB_WHATSAPP}?text=`)).toBe(true);
  });

  it("codifica el mensaje para URL (sin espacios crudos ni saltos de línea)", () => {
    const url = buildWhatsAppTrialUrl(lead);
    const query = url.split("?text=")[1];
    expect(query).not.toContain(" ");
    expect(query).not.toContain("\n");
    // Se puede decodificar de vuelta al mensaje original
    expect(decodeURIComponent(query)).toContain("Samuel");
  });

  it("incluye nombre del niño, edad y la franja elegida", () => {
    const text = decodeURIComponent(buildWhatsAppTrialUrl(lead).split("?text=")[1]);
    expect(text).toContain("Samuel");
    expect(text).toContain("9");
    expect(text).toContain(findSlot("lun-17")!.label);
    expect(text).toContain("clase de cortesía");
  });

  it("funciona sin franja elegida y sin nombre del niño", () => {
    const text = decodeURIComponent(
      buildWhatsAppTrialUrl({ parentName: "Ana", phone: "3000000000" }).split("?text=")[1],
    );
    expect(text).toContain("Ana");
    expect(text).toContain("clase de cortesía");
    expect(text).not.toContain("undefined");
  });
});

describe("buildLeadSubject / buildLeadMessage", () => {
  it("el asunto identifica al niño y la franja para verlo de un vistazo en la bandeja", () => {
    const subject = buildLeadSubject(lead);
    expect(subject).toContain("Samuel");
    expect(subject).toContain("9");
    expect(subject).toContain(findSlot("lun-17")!.label);
  });

  it("el mensaje conserva todos los datos del formulario", () => {
    const message = buildLeadMessage(lead);
    expect(message).toContain("María Gómez");
    expect(message).toContain("Samuel");
    expect(message).toContain("3001234567");
    expect(message).toContain("maria@ejemplo.com");
  });

  it("no imprime 'undefined' cuando faltan campos opcionales", () => {
    const minimal = buildLeadMessage({ parentName: "Ana", phone: "3000000000" });
    expect(minimal).not.toContain("undefined");
    expect(buildLeadSubject({ parentName: "Ana", phone: "3000000000" })).not.toContain("undefined");
  });
});

describe("computeLeadStatus", () => {
  it("deriva 'nuevo' cuando no hay estado guardado y no fue leído", () => {
    expect(computeLeadStatus({ isRead: false })).toBe("nuevo");
  });

  it("deriva 'contactado' cuando fue leído pero no tiene estado explícito", () => {
    expect(computeLeadStatus({ isRead: true })).toBe("contactado");
  });

  it("respeta el estado explícito por encima de isRead", () => {
    expect(computeLeadStatus({ isRead: false, status: "inscrito" })).toBe("inscrito");
    expect(computeLeadStatus({ isRead: true, status: "nuevo" })).toBe("nuevo");
  });

  it("ignora un estado desconocido y cae al derivado", () => {
    expect(computeLeadStatus({ isRead: false, status: "basura" })).toBe("nuevo");
  });
});

describe("summarizeLeads", () => {
  it("cuenta los leads por estado del embudo", () => {
    const summary = summarizeLeads([
      { isRead: false },
      { isRead: true },
      { isRead: true, status: "agendado" },
      { isRead: true, status: "asistio" },
      { isRead: true, status: "inscrito" },
      { isRead: true, status: "inscrito" },
    ]);

    expect(summary.nuevo).toBe(1);
    expect(summary.contactado).toBe(1);
    expect(summary.agendado).toBe(1);
    expect(summary.asistio).toBe(1);
    expect(summary.inscrito).toBe(2);
    expect(summary.total).toBe(6);
  });

  it("retorna todo en cero para una lista vacía", () => {
    const summary = summarizeLeads([]);
    expect(summary.total).toBe(0);
    expect(summary.nuevo).toBe(0);
    expect(summary.inscrito).toBe(0);
  });
});
