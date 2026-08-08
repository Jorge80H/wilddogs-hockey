import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, Building2, FileText, QrCode, Check, ExternalLink, ShieldCheck } from "lucide-react";

export function BreBPaymentCard() {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast({
      title: "¡Copiado!",
      description: `${label}: ${text} copiado al portapapeles.`,
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Card className="border-red-500/20 bg-gradient-to-br from-red-500/5 via-card to-card overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] px-2.5 py-0.5">
            Bre-B | Davivienda | Daviplata
          </Badge>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-xs text-red-600 dark:text-red-400 hover:text-red-700">
              <QrCode className="mr-1 h-3.5 w-3.5" /> Ver Código QR / Volante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md p-4 text-center">
            <DialogHeader>
              <DialogTitle className="text-center text-sm font-bold text-red-600">
                Información de Pago Oficial - Wild Dogs
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 space-y-3">
              <img
                src="/assets/metodos-pago-bre-b.png"
                alt="Medios de Pago Bre-B Wild Dogs"
                className="w-full max-h-[75vh] object-contain rounded-lg border shadow-md"
              />
              <p className="text-xs text-muted-foreground">
                Escanea el código QR desde la aplicación de tu entidad financiera (Daviplata, Davivienda, Bre-B, etc.) o usa la llave directamente.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-red-600" /> Club Deportivo Optima Wild Dogs
          </h3>
          <p className="text-xs text-muted-foreground">
            NIT: <span className="font-semibold text-foreground">902063261-8</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Llave Bre-B */}
          <div className="p-3 border border-red-500/20 rounded-lg bg-background flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Key className="h-3 w-3 text-red-600" /> Llave Bre-B
              </span>
              <p className="font-mono font-bold text-sm text-red-600 dark:text-red-400 tracking-wider">
                9020632618
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => copyToClipboard("9020632618", "Llave Bre-B")}
            >
              {copiedField === "Llave Bre-B" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-red-600" />
              )}
            </Button>
          </div>

          {/* Cuenta Davivienda / Daviplata */}
          <div className="p-3 border border-red-500/20 rounded-lg bg-background flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                <Building2 className="h-3 w-3 text-red-600" /> Cta. Ahorros Davivienda
              </span>
              <p className="font-mono font-bold text-sm text-foreground tracking-wider">
                108900875213
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs border-red-500/30 hover:bg-red-50 dark:hover:bg-red-950/50"
              onClick={() => copyToClipboard("108900875213", "Cuenta Davivienda")}
            >
              {copiedField === "Cuenta Davivienda" ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-red-600" />
              )}
            </Button>
          </div>
        </div>

        <div className="p-2.5 bg-red-600/10 border border-red-600/20 rounded text-[11px] text-red-800 dark:text-red-200 flex items-start gap-2">
          <span className="font-bold">💡 Tip de pago:</span>
          <span>
            Una vez realizado el pago o la transferencia, reporta el número de referencia/comprobante a la administración del club o a través de este panel para la expedición de tu recibo oficial.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
