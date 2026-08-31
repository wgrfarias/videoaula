import { requireInstructor } from "@/lib/session";
import { SupportPageContent } from "@/components/support/support-page-content";

export const metadata = { title: "Central de ajuda | Painel de cursos" };

export default async function InstructorSupportPage() {
  const user = await requireInstructor();
  return <SupportPageContent userId={user.id} />;
}
