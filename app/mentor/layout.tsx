import { checkMentorAccess } from "@/lib/check-mentor";
import MentorSidebarLayout from "@/components/mentor/MentorSidebarLayout";

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, name } = await checkMentorAccess();

  const mentorUser = {
    name: name,
    email: user.email || "mentor@updateptn.id",
  };

  return (
    <MentorSidebarLayout user={mentorUser}>{children}</MentorSidebarLayout>
  );
}
