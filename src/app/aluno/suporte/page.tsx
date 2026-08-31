import { requireUser } from "@/lib/session";
import { SupportPageContent } from "@/components/support/support-page-content";

export const metadata = { title: "Central de ajuda | Área do aluno" };

export default async function StudentSupportPage() {
  const user = await requireUser();
  return <SupportPageContent userId={user.id} />;
}
