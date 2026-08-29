import { requireInstructor } from "@/lib/session";
import { getInstructorVideos } from "@/lib/data/instructor";
import { Card, Badge } from "@/components/ui/card";
import { VideoUploadForm } from "@/components/instructor/video-upload-form";
import { formatDuration } from "@/lib/utils";

export const metadata = { title: "Biblioteca de vídeos | Painel de cursos" };

export default async function InstructorVideosPage() {
  const user = await requireInstructor();
  const videos = await getInstructorVideos(user.id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Biblioteca de vídeos</h1>
        <p className="mt-1 text-sm text-ink-500">
          Todo vídeo enviado aqui fica disponível para ser reaproveitado em quantas aulas
          e cursos você quiser — sem precisar enviar o arquivo de novo.
        </p>

        <div className="mt-6 space-y-3">
          {videos.map((video) => (
            <Card key={video.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink-900">{video.title}</p>
                  <p className="text-xs text-ink-500">
                    {formatDuration(video.durationSec)} ·{" "}
                    {video.sizeBytes ? `${(video.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : ""}
                  </p>
                </div>
                <span className="text-xs text-ink-300">
                  usado em {video.lessons.length} aula(s)
                </span>
              </div>

              {video.lessons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {[...new Set(video.lessons.map((l) => l.module.course.title))].map((title) => (
                    <Badge key={title} tone="brand">
                      {title}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          ))}

          {videos.length === 0 && (
            <p className="text-sm text-ink-500">Você ainda não enviou nenhum vídeo.</p>
          )}
        </div>
      </div>

      <Card className="h-fit p-5">
        <h2 className="font-display font-semibold text-ink-900">Enviar novo vídeo</h2>
        <p className="mt-1 text-xs text-ink-500">
          O vídeo fica salvo na sua biblioteca. Depois é só vinculá-lo a uma aula em
          qualquer curso.
        </p>
        <div className="mt-4">
          <VideoUploadForm />
        </div>
      </Card>
    </div>
  );
}
