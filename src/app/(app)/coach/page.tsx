import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoachChat } from "./coach-chat";

export default async function CoachPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const messages = await prisma.coachMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <CoachChat
      initialMessages={messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.content,
        suggestion:
          m.suggestedFocus && m.suggestedDurationMinutes
            ? { focus: m.suggestedFocus, durationMinutes: m.suggestedDurationMinutes }
            : null,
      }))}
      userFirstName={user.name?.split(" ")[0] ?? null}
    />
  );
}
