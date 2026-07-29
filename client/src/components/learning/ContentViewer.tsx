import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ListChecks, ExternalLink } from "lucide-react";

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function ContentViewer({ material, onQuiz, onBack }: { material: any; onQuiz: () => void; onBack: () => void }) {
  const embed = material?.contentUrl ? youtubeEmbed(material.contentUrl) : null;
  const hasQuiz = (material?.questions || []).length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{material?.title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-1" /> Volver</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {embed ? (
          <div className="aspect-video w-full">
            <iframe className="w-full h-full rounded" src={embed} title={material.title} allowFullScreen />
          </div>
        ) : (
          <a href={material?.contentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary underline">
            Abrir contenido <ExternalLink className="h-4 w-4" />
          </a>
        )}
        {material?.description && <p className="text-sm text-muted-foreground">{material.description}</p>}
        {hasQuiz ? (
          <Button onClick={onQuiz} className="w-full"><ListChecks className="h-4 w-4 mr-1" /> Hacer el quiz</Button>
        ) : (
          <p className="text-sm text-muted-foreground">Este contenido aún no tiene quiz.</p>
        )}
      </CardContent>
    </Card>
  );
}
