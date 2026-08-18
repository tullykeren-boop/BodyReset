import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CoachChat } from "./coach-chat";

export default async function CoachPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [messages, concerns] = await Promise.all([
    prisma.coachMessage.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.concern.findMany({ select: { slug: true, name: true } }),
  ]);

  return (
    <CoachChat
      initialMessages={messages.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.content,
        suggestion:
          m.suggestedConcernSlug && m.suggestedDurationMinutes
            ? {
                concernSlug: m.suggestedConcernSlug,
                durationMinutes: m.suggestedDurationMinutes,
              }
            : null,
      }))}
      userFirstName={user.name?.split(" ")[0] ?? null}
      concernNames={Object.fromEntries(concerns.map((c) => [c.slug, c.name]))}
    />
  );
}
