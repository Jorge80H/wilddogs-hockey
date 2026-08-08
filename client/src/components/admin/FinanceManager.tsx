import { useState } from "react";
import { db } from "@/lib/instant";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tx, id as txId } from "@instantdb/react";
import { DollarSign, Plus, CheckCircle, Receipt } from "lucide-react";
import { formatCOP, generateReceiptNumber } from "@/lib/finance";
import { playerDisplayName } from "@/lib/players";
import { format } from "date-fns";
import { BreBPaymentCard } from "@/components/finance/BreBPaymentCard";

export function FinanceManager() {
  const { toast } = useToast();

  const { data } = db.useQuery({
    paymentConcepts: {},
    playerProfiles: {
      $: { where: { status: "approved" } },
      receivables: { concept: {} },
      paymentRecords: {},
    },
    payments: {},
    accountsReceivable: {},
  });

  const concepts = (data?.paymentConcepts || []) as any[];
  const players = (data?.playerProfiles || []) as any[];
  const payments = (data?.payments || []) as any[];

  // Concept state
  const [conceptName, setConceptName] = useState("");
  const [conceptAmount, setConceptAmount] = useState("");
  const [conceptFrequency, setConceptFrequency] = useState("monthly");
  const [showCreateConcept, setShowCreateConcept] = useState(false);

  // Charge generation state
  const [selectedConceptId, setSelectedConceptId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [chargeDueDate, setChargeDueDate] = useState(format(new Date(), "yyyy-MM-dd"));

  // Payment recording state
  const [recordPlayerId, setRecordPlayerId] = useState("");
  const [recordReceivableId, setRecordReceivableId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleCreateConcept = async () => {
    if (!conceptName.trim() || !conceptAmount.trim()) {
      toast({ title: "Error", description: "Completa el nombre y valor del concepto.", variant: "destructive" });
      return;
    }

    try {
      const cid = txId();
      await db.transact([
        tx.paymentConcepts[cid].update({
          name: conceptName.trim(),
          amount: conceptAmount.trim(),
          frequency: conceptFrequency,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      ]);

      toast({ title: "✅ Concepto de cobro creado" });
      setConceptName("");
      setConceptAmount("");
      setShowCreateConcept(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleGenerateCharge = async () => {
    if (!selectedConceptId || !selectedPlayerId) {
      toast({ title: "Error", description: "Selecciona el concepto y el jugador.", variant: "destructive" });
      return;
    }

    const concept = concepts.find((c) => c.id === selectedConceptId);
    if (!concept) return;

    try {
      const accId = txId();
      await db.transact([
        tx.accountsReceivable[accId].update({
          amount: String(concept.amount),
          dueDate: chargeDueDate,
          status: "pending",
          description: concept.name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
        tx.accountsReceivable[accId].link({ concept: concept.id }),
        tx.accountsReceivable[accId].link({ player: selectedPlayerId }),
      ]);

      toast({ title: "✅ Cuenta por cobrar generada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRecordPayment = async () => {
    if (!recordPlayerId || !paymentAmount.trim()) {
      toast({ title: "Error", description: "Selecciona un jugador e ingresa el monto pagado.", variant: "destructive" });
      return;
    }

    try {
      const payId = txId();
      const receiptNo = generateReceiptNumber(payments.length + 1);

      const ops: any[] = [
        tx.payments[payId].update({
          amount: String(paymentAmount),
          paymentDate: format(new Date(), "yyyy-MM-dd"),
          paymentMethod,
          referenceNumber: referenceNumber.trim() || undefined,
          receiptNumber: receiptNo,
          createdAt: Date.now(),
        }),
        tx.payments[payId].link({ player: recordPlayerId }),
      ];

      // If tied to a specific account receivable, update its status to paid
      if (recordReceivableId) {
        ops.push(
          tx.accountsReceivable[recordReceivableId].update({
            status: "paid",
            updatedAt: Date.now(),
          })
        );
        const appLinkId = txId();
        ops.push(
          tx.paymentApplications[appLinkId].update({
            amount: String(paymentAmount),
            createdAt: Date.now(),
          }),
          tx.paymentApplications[appLinkId].link({ payment: payId }),
          tx.paymentApplications[appLinkId].link({ account: recordReceivableId })
        );
      }

      await db.transact(ops);

      toast({ title: `✅ Pago registrado. Comprobante ${receiptNo}` });
      setPaymentAmount("");
      setReferenceNumber("");
      setRecordReceivableId("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const activePlayerForPayment = players.find((p) => p.id === recordPlayerId);
  const pendingReceivablesForPlayer = (activePlayerForPayment?.receivables || []).filter((r: any) => r.status !== "paid");

  return (
    <div className="space-y-6">
      <BreBPaymentCard />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-emerald-500" /> Configuración de Conceptos de Cobro
          </CardTitle>
          <Button size="sm" onClick={() => setShowCreateConcept(!showCreateConcept)}>
            <Plus className="mr-1 h-4 w-4" /> {showCreateConcept ? "Cancelar" : "Nuevo Concepto"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreateConcept && (
            <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
              <h4 className="font-semibold text-xs">Crear Concepto de Cobro</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Nombre del Concepto *</Label>
                  <Input value={conceptName} onChange={(e) => setConceptName(e.target.value)} placeholder="Ej. Mensualidad Agosto..." className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Monto ($ COP) *</Label>
                  <Input type="number" value={conceptAmount} onChange={(e) => setConceptAmount(e.target.value)} placeholder="150000" className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs">Frecuencia</Label>
                  <Select value={conceptFrequency} onValueChange={setConceptFrequency}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly" className="text-xs">Mensual</SelectItem>
                      <SelectItem value="once" className="text-xs">Pago Único</SelectItem>
                      <SelectItem value="annual" className="text-xs">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreateConcept} className="w-full">Guardar Concepto</Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {concepts.map((c) => (
              <div key={c.id} className="p-3 border rounded-lg bg-card text-xs flex justify-between items-center">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-muted-foreground capitalize text-[10px]">{c.frequency}</p>
                </div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCOP(c.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generar Cobro */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" /> Generar Cuenta por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Concepto *</Label>
              <Select value={selectedConceptId} onValueChange={setSelectedConceptId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Elige concepto..." /></SelectTrigger>
                <SelectContent>
                  {concepts.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name} ({formatCOP(c.amount)})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Jugador *</Label>
              <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Elige jugador..." /></SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{playerDisplayName(p)} ({p.category})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Fecha de Vencimiento *</Label>
              <Input type="date" value={chargeDueDate} onChange={(e) => setChargeDueDate(e.target.value)} className="h-8 text-xs" />
            </div>

            <Button onClick={handleGenerateCharge} className="w-full">Generar Cobro</Button>
          </CardContent>
        </Card>

        {/* Registrar Pago */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-emerald-500" /> Registrar Recibo de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Jugador *</Label>
              <Select value={recordPlayerId} onValueChange={setRecordPlayerId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Elige jugador..." /></SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">{playerDisplayName(p)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {recordPlayerId && (
              <div>
                <Label className="text-xs">Aplicar a Cuenta Pendiente (Opcional)</Label>
                <Select value={recordReceivableId} onValueChange={(val) => {
                  setRecordReceivableId(val);
                  const acc = pendingReceivablesForPlayer.find((a: any) => a.id === val);
                  if (acc) setPaymentAmount(acc.amount);
                }}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Seleccionar cobro pendiente..." /></SelectTrigger>
                  <SelectContent>
                    {pendingReceivablesForPlayer.map((acc: any) => (
                      <SelectItem key={acc.id} value={acc.id} className="text-xs">
                        {acc.concept?.name || acc.description} - {formatCOP(acc.amount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Monto Pagado ($) *</Label>
                <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-xs">Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer" className="text-xs">Transferencia / Nequi</SelectItem>
                    <SelectItem value="cash" className="text-xs">Efectivo</SelectItem>
                    <SelectItem value="card" className="text-xs">Tarjeta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">N° de Comprobante / Referencia Bancaria</Label>
              <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Ej. Ref: 987654" className="h-8 text-xs" />
            </div>

            <Button onClick={handleRecordPayment} className="w-full">
              <CheckCircle className="mr-2 h-4 w-4" /> Registrar Pago y Emitir Recibo
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
