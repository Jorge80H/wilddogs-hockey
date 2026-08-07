export type AccountStatus = "pending" | "paid" | "overdue";

export interface AccountReceivableItem {
  id?: string;
  amount: string | number;
  dueDate: string; // ISO date string "YYYY-MM-DD"
  status: AccountStatus | string;
  description?: string;
  createdAt?: number;
}

export interface PaymentItem {
  id?: string;
  amount: string | number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber?: string;
  notes?: string;
  receiptNumber: string;
  createdAt?: number;
}

export interface BalanceSummary {
  totalPending: number;
  totalOverdue: number;
  totalPaid: number;
  totalDue: number;
}

export function formatCOP(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(num);
}

export function computeAccountStatus(
  currentStatus: string,
  dueDateStr: string,
  nowMs: number = Date.now()
): AccountStatus {
  if (currentStatus === "paid") return "paid";

  if (!dueDateStr) return "pending";

  const dueTimestamp = new Date(dueDateStr).getTime();
  if (!isNaN(dueTimestamp) && dueTimestamp < nowMs) {
    return "overdue";
  }

  return "pending";
}

export function computeTotalBalance(
  accounts: Partial<AccountReceivableItem>[],
  nowMs: number = Date.now()
): BalanceSummary {
  let totalPending = 0;
  let totalOverdue = 0;
  let totalPaid = 0;

  (accounts || []).forEach((acc) => {
    const amt = typeof acc.amount === "string" ? parseFloat(acc.amount) || 0 : acc.amount || 0;
    const computed = computeAccountStatus(acc.status || "pending", acc.dueDate || "", nowMs);

    if (computed === "paid") {
      totalPaid += amt;
    } else if (computed === "overdue") {
      totalOverdue += amt;
    } else {
      totalPending += amt;
    }
  });

  return {
    totalPending,
    totalOverdue,
    totalPaid,
    totalDue: totalPending + totalOverdue,
  };
}

export function generateReceiptNumber(seq: number, year: number = new Date().getFullYear()): string {
  const padded = String(seq).padStart(4, "0");
  return `REC-${year}-${padded}`;
}
