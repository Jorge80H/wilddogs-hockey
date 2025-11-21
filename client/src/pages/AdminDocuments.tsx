import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Check, X, Clock } from "lucide-react";
import { db } from "@/lib/instant";

export default function AdminDocuments() {
  const [, setLocation] = useLocation();
  const { user, isLoading } = db.useAuth();

  // Check if user is admin
  const isAdmin = user?.email?.includes('admin') || false;

  // Query documents
  const { data: documentsData } = db.useQuery({ documents: {} });

  // Query players for document details
  const { data: playersData } = db.useQuery({ playerProfiles: {} });

  const documents = documentsData?.documents || [];
  const players = playersData?.playerProfiles || [];

  // Group documents by status
  const pending = documents.filter((d) => d.status === "pending");
  const approved = documents.filter((d) => d.status === "approved");
  const rejected = documents.filter((d) => d.status === "rejected");

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

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      id: "Documento de Identidad",
      eps: "EPS",
      medical: "Certificado Médico",
      image_rights: "Derechos de Imagen",
      other: "Otro",
    };
    return labels[type] || type;
  };

  const renderDocumentCard = (doc: typeof documents[0]) => {
    const player = players.find((p) => p.id === doc.playerProfileId);

    return (
      <Card key={doc.id} className="hover-elevate">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">
                  {getDocumentTypeLabel(doc.type)}
                </h3>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Jugador #{player?.jerseyNumber || "N/A"}</div>
                <div>Archivo: {doc.fileName}</div>
                <div>
                  Subido: {new Date(doc.uploadedAt).toLocaleDateString()}
                </div>
                {doc.notes && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    {doc.notes}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  doc.status === "approved"
                    ? "default"
                    : doc.status === "rejected"
                    ? "destructive"
                    : "secondary"
                }
              >
                {doc.status === "approved"
                  ? "Aprobado"
                  : doc.status === "rejected"
                  ? "Rechazado"
                  : "Pendiente"}
              </Badge>
              {doc.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="h-8 px-2">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
              <h1 className="text-2xl font-bold">Gestión de Documentos</h1>
              <p className="text-sm text-muted-foreground">
                Revisar y aprobar documentos de jugadores
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pending.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {approved.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {rejected.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-8">
          {/* Pending Documents */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">
                Documentos Pendientes de Revisión
              </h2>
              <div className="space-y-4">{pending.map(renderDocumentCard)}</div>
            </div>
          )}

          {/* Approved Documents */}
          {approved.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Documentos Aprobados</h2>
              <div className="space-y-4">{approved.map(renderDocumentCard)}</div>
            </div>
          )}

          {/* Rejected Documents */}
          {rejected.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Documentos Rechazados</h2>
              <div className="space-y-4">{rejected.map(renderDocumentCard)}</div>
            </div>
          )}

          {/* Empty State */}
          {documents.length === 0 && (
            <Card className="p-12">
              <div className="text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay documentos registrados</p>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
