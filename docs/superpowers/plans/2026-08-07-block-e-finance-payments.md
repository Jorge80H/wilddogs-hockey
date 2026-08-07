# Bloque E — Pagos, Cartera y Comprobantes — Implementation Plan

**Goal:** Implementar el módulo de cartera, conceptos de cobro, cuentas por cobrar e historial de recibos de pago.

---

## Tasks Breakdown

### Task 1: Esquema + Permisos (Fundación Bloque E)
- Modify: `instant.schema.ts`
- Modify: `instant.perms.ts`

---

### Task 2: Lógica Pura Financiera (TDD)
- Create: `client/src/lib/finance.ts`
- Create: `client/src/lib/finance.test.ts`

---

### Task 3: Componentes del Jugador
- Create: `client/src/components/finance/PlayerBillingCard.tsx`
- Create: `client/src/components/finance/PaymentHistoryList.tsx`

---

### Task 4: Componentes de Tesorería Admin
- Create: `client/src/components/admin/FinanceManager.tsx`

---

### Task 5: Integración en Dashboards
- Modify: `client/src/pages/PlayerDashboard.tsx`
- Modify: `client/src/pages/AdminDashboard.tsx`
