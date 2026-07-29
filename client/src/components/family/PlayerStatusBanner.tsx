import { Badge } from "@/components/ui/badge";
import type { PlayerStatus } from "@/lib/players";

const REQUIRED_DOCS = [
  { type: "id", label: "Documento de identidad" },
  { type: "eps", label: "EPS" },
  { type: "medical", label: "Certificado médico" },
  { type: "image_rights", label: "Derechos de imagen" },
];

export function PlayerStatusBanner({ status, rejectionReason, documents }: {
  status: PlayerStatus; rejectionReason?: string; documents?: any[];
}) {
  if (status === "approved") return null;
  const have = new Set((documents || []).map((d) => d.type));
  const missing = REQUIRED_DOCS.filter((d) => !have.has(d.type));

  return (
    <div className="rounded-lg border p-4 mb-6 bg-muted/40">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={status === "rejected" ? "destructive" : "secondary"}>
          {status === "rejected" ? "Rechazado" : status === "inactive" ? "Inactivo" : "En revisión por el club"}
        </Badge>
      </div>
      {status === "rejected" && rejectionReason && (
        <p className="text-sm text-destructive mb-2">Motivo: {rejectionReason}</p>
      )}
      {status !== "inactive" && (
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">Documentos pendientes:</p>
          {missing.length === 0 ? (
            <p className="text-green-600">Todos los documentos cargados ✔</p>
          ) : (
            <ul className="list-disc ml-5">{missing.map((d) => <li key={d.type}>{d.label}</li>)}</ul>
          )}
        </div>
      )}
    </div>
  );
}
