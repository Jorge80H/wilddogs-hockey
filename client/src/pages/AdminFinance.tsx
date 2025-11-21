import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { db } from "@/lib/instant";

export default function AdminFinance() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = db.useAuth();

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || false;

  // Query payment concepts
  const { data: conceptsData } = db.useQuery({ paymentConcepts: {} });

  // Query accounts receivable
  const { data: accountsData } = db.useQuery({ accountsReceivable: {} });

  // Query payments
  const { data: paymentsData } = db.useQuery({ payments: {} });

  // Query players for the accounts details
  const { data: playersData } = db.useQuery({ playerProfiles: {} });

  const concepts = conceptsData?.paymentConcepts || [];
  const accounts = accountsData?.accountsReceivable || [];
  const payments = paymentsData?.payments || [];
  const players = playersData?.playerProfiles || [];

  // Calculate statistics
  const totalPending = accounts
    .filter((a) => a.status === "pending" || a.status === "overdue")
    .reduce((sum, a) => sum + parseFloat(a.amount.toString()), 0);

  const totalCollected = payments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  const overdue = accounts.filter((a) => {
    if (a.status !== "pending") return false;
    const dueDate = new Date(a.dueDate).getTime();
    return dueDate < Date.now();
  });

  const thisMonthPayments = payments.filter((p) => {
    const paymentDate = new Date(p.paymentDate).getTime();
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return paymentDate > thirtyDaysAgo;
  });

  const thisMonthIncome = thisMonthPayments.reduce(
    (sum, p) => sum + parseFloat(p.amount.toString()),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              No tienes permisos para acceder a esta página.
            </p>
            <Button onClick={() => setLocation("/")}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Gestión Financiera</h1>
              <p className="text-sm text-muted-foreground">
                Pagos, cartera y reportes
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cartera Pendiente
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                ${totalPending.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {accounts.filter((a) => a.status === "pending").length} cuentas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recaudado Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalCollected.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {payments.length} pagos registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${thisMonthIncome.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {thisMonthPayments.length} pagos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {overdue.length}
              </div>
              <p className="text-xs text-muted-foreground">Cuentas vencidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="accounts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="accounts">Cuentas por Cobrar</TabsTrigger>
            <TabsTrigger value="payments">Pagos Registrados</TabsTrigger>
            <TabsTrigger value="concepts">Conceptos de Pago</TabsTrigger>
          </TabsList>

          {/* Accounts Receivable */}
          <TabsContent value="accounts">
            <Card>
              <CardHeader>
                <CardTitle>Cuentas por Cobrar</CardTitle>
              </CardHeader>
              <CardContent>
                {accounts.length > 0 ? (
                  <div className="space-y-3">
                    {accounts.map((account) => {
                      const player = players.find((p) => p.id === account.playerProfileId);
                      const isOverdue =
                        account.status === "pending" &&
                        new Date(account.dueDate).getTime() < Date.now();

                      return (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-semibold">
                              {account.description || "Cuenta por cobrar"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Jugador #{player?.jerseyNumber || "N/A"} •
                              Vence:{" "}
                              {new Date(account.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-mono font-bold text-lg">
                                ${parseFloat(account.amount.toString()).toLocaleString()}
                              </div>
                            </div>
                            <Badge
                              variant={
                                account.status === "paid"
                                  ? "default"
                                  : isOverdue
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {account.status === "paid"
                                ? "Pagado"
                                : isOverdue
                                ? "Vencido"
                                : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay cuentas por cobrar registradas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Pagos Registrados</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments
                      .sort((a, b) => {
                        const dateA = new Date(a.paymentDate).getTime();
                        const dateB = new Date(b.paymentDate).getTime();
                        return dateB - dateA;
                      })
                      .map((payment) => {
                        const player = players.find(
                          (p) => p.id === payment.playerProfileId
                        );

                        return (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-4 border rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-semibold">
                                Recibo #{payment.receiptNumber}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Jugador #{player?.jerseyNumber || "N/A"} •{" "}
                                {new Date(payment.paymentDate).toLocaleDateString()} •{" "}
                                <span className="capitalize">{payment.paymentMethod}</span>
                              </div>
                              {payment.notes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {payment.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-mono font-bold text-lg text-green-600">
                                ${parseFloat(payment.amount.toString()).toLocaleString()}
                              </div>
                              {payment.referenceNumber && (
                                <div className="text-xs text-muted-foreground">
                                  Ref: {payment.referenceNumber}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay pagos registrados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Concepts */}
          <TabsContent value="concepts">
            <Card>
              <CardHeader>
                <CardTitle>Conceptos de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                {concepts.length > 0 ? (
                  <div className="space-y-3">
                    {concepts.map((concept) => (
                      <div
                        key={concept.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{concept.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {concept.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Frecuencia:{" "}
                            <span className="capitalize">{concept.frequency}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-mono font-bold text-lg">
                              ${parseFloat(concept.amount.toString()).toLocaleString()}
                            </div>
                          </div>
                          <Badge variant={concept.isActive ? "default" : "secondary"}>
                            {concept.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay conceptos de pago configurados</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
