import { describe, it, expect } from "vitest";
import {
  formatCOP,
  computeAccountStatus,
  computeTotalBalance,
  generateReceiptNumber,
} from "./finance";

describe("formatCOP", () => {
  it("formatea números y cadenas numéricas a formato de moneda COP ($)", () => {
    expect(formatCOP(150000)).toContain("150");
    expect(formatCOP("150000")).toContain("150");
    expect(formatCOP(0)).toContain("0");
  });
});

describe("computeAccountStatus", () => {
  it("retorna 'paid' si el estado ya está marcado como pagado", () => {
    expect(computeAccountStatus("paid", "2026-01-01")).toBe("paid");
  });

  it("retorna 'overdue' si la fecha de vencimiento es anterior a la fecha de hoy", () => {
    expect(computeAccountStatus("pending", "2026-01-01", new Date("2026-08-01").getTime())).toBe("overdue");
  });

  it("retorna 'pending' si la fecha de vencimiento es futura", () => {
    expect(computeAccountStatus("pending", "2026-12-31", new Date("2026-08-01").getTime())).toBe("pending");
  });
});

describe("computeTotalBalance", () => {
  it("retorna el balance total pendiente, vencido y pagado", () => {
    const now = new Date("2026-08-01").getTime();
    const accounts = [
      { amount: "150000", status: "pending", dueDate: "2026-12-31" },
      { amount: "150000", status: "pending", dueDate: "2026-01-01" }, // overdue
      { amount: "150000", status: "paid", dueDate: "2026-01-01" },
    ];

    const balance = computeTotalBalance(accounts, now);
    expect(balance.totalPending).toBe(150000);
    expect(balance.totalOverdue).toBe(150000);
    expect(balance.totalPaid).toBe(150000);
    expect(balance.totalDue).toBe(300000);
  });
});

describe("generateReceiptNumber", () => {
  it("genera un número de recibo con prefijo y correlativo", () => {
    const receipt = generateReceiptNumber(42, 2026);
    expect(receipt).toBe("REC-2026-0042");
  });
});
