# Bloque E — Pagos, Cartera y Comprobantes — Design Spec

**Goal:** Implementar un sistema de gestión financiera y cartera para Wild Dogs Hockey Club, permitiendo administrar conceptos de pago, cuentas por cobrar por jugador y recibos de pago.

## Entidades de InstantDB
- `paymentConcepts`: Conceptos configurables (ej: "Mensualidad", "Inscripción Torneo").
- `accountsReceivable`: Cuentas por cobrar generadas a cada jugador.
- `payments`: Pagos registrados con su respectivo número de comprobante/recibo.
- `paymentApplications`: Vinculación entre un pago y la cuenta por cobrar correspondiente.

## Relaciones Nuevas
- `accountPlayer`: `accountsReceivable` -> `playerProfiles` (`player`).
- `paymentPlayer`: `payments` -> `playerProfiles` (`player`).

## Permisos
- Acceso de lectura a cuentas e historial para la familia del jugador (`isFamily`).
- Control total de gestión para administradores/tesoreros.
