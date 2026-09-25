import { describe, it, expect } from "vitest";
import { classifyVisit, normalizeLeadSource } from "./attribution";

const HOST = "optimawilddogs.com";
const NOW = 1_700_000_000_000;

describe("classifyVisit", () => {
  it("anuncio de Meta con UTM pagada", () => {
    const a = classifyVisit("?utm_source=instagram&utm_medium=paid&utm_campaign=cortesia_sep", "", HOST, NOW);
    expect(a).toEqual({ source: "meta_ads", campaign: "cortesia_sep", landedAt: NOW });
  });

  it("anuncio de Google por gclid aunque no tenga UTM", () => {
    expect(classifyVisit("?gclid=abc", "https://www.google.com/", HOST, NOW)?.source).toBe("google_ads");
  });

  it("Google con UTM cpc es anuncio; sin medio pagado es orgánico", () => {
    expect(classifyVisit("?utm_source=google&utm_medium=cpc", "", HOST, NOW)?.source).toBe("google_ads");
    expect(classifyVisit("?utm_source=google&utm_medium=organic", "", HOST, NOW)?.source).toBe("google");
  });

  it("enlace de bio de Instagram sin UTM cae en orgánico por referrer", () => {
    expect(classifyVisit("", "https://l.instagram.com/", HOST, NOW)?.source).toBe("instagram");
  });

  it("búsqueda orgánica de Google por referrer", () => {
    expect(classifyVisit("", "https://www.google.com.co/", HOST, NOW)?.source).toBe("google");
  });

  it("enlaces para colegios y referidos", () => {
    expect(classifyVisit("?utm_source=colegio_san_jose", "", HOST, NOW)?.source).toBe("colegio");
    expect(classifyVisit("?utm_source=referido", "", HOST, NOW)?.source).toBe("referido");
  });

  it("visita directa o navegación interna no genera atribución", () => {
    expect(classifyVisit("", "", HOST, NOW)).toBeNull();
    expect(classifyVisit("", "https://optimawilddogs.com/servicios", HOST, NOW)).toBeNull();
  });

  it("fbclid desde la app sin referrer se toma como Instagram", () => {
    expect(classifyVisit("?fbclid=xyz", "", HOST, NOW)?.source).toBe("instagram");
  });
});

describe("normalizeLeadSource", () => {
  it("deja pasar fuentes conocidas y manda lo demás a directo", () => {
    expect(normalizeLeadSource("meta_ads")).toBe("meta_ads");
    expect(normalizeLeadSource("tiktok")).toBe("directo");
    expect(normalizeLeadSource(undefined)).toBe("directo");
  });
});
