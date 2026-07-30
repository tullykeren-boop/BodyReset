import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import type { Goal } from "@/generated/prisma/client";

export type CoachContext = {
  name: string | null;
  goal: Goal;
  painAreaNames: string[];
  streak: number;
  recentMoods: string[];
  recentFeedback: { helped: boolean; painBefore: number; painAfter: number }[];
};

export type CoachReply = {
  text: string;
  suggestion: { focus: string; durationMinutes: number } | null;
};

async function getCoachContext(userId: string): Promise<CoachContext> {
  const [user, profile, recentCheckIns, recentFeedback, completedSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.profile.findUnique({ where: { userId }, include: { painAreas: { include: { bodyArea: true } } } }),
    prisma.checkIn.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 3 }),
    prisma.sessionFeedback.findMany({
      where: { plannedSession: { dailyPlan: { userId } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.plannedSession.findMany({
      where: { dailyPlan: { userId }, completedAt: { not: null } },
      select: { completedAt: true },
    }),
  ]);

  return {
    name: user?.name ?? null,
    goal: profile?.goal ?? "MOBILITY",
    painAreaNames: profile?.painAreas.map((p) => p.bodyArea.name) ?? [],
    streak: calculateStreak(completedSessions.map((s) => s.completedAt as Date)),
    recentMoods: recentCheckIns.map((c) => c.mood),
    recentFeedback: recentFeedback.map((f) => ({
      helped: f.helped,
      painBefore: f.painBefore,
      painAfter: f.painAfter,
    })),
  };
}

const COACH_RULES: { match: string[]; reply: (ctx: CoachContext) => CoachReply }[] = [
  {
    match: ["shoulder"],
    reply: (ctx) => ({
      text: `Shoulders are a common spot for tension to build through the day${
        ctx.painAreaNames.includes("Shoulders") ? " — it's one of the areas you flagged" : ""
      }. A short shoulder release now can stop it from building further.`,
      suggestion: { focus: "Shoulders", durationMinutes: 4 },
    }),
  },
  {
    match: ["neck"],
    reply: () => ({
      text: "Neck tightness usually responds well to a short mobility reset before it builds through the afternoon. Want to try one now?",
      suggestion: { focus: "Neck", durationMinutes: 3 },
    }),
  },
  {
    match: ["back"],
    reply: () => ({
      text: "Lower back tightness often builds after long stretches of sitting. A quick standing reset can help reset your posture.",
      suggestion: { focus: "Lower back", durationMinutes: 5 },
    }),
  },
  {
    match: ["wrist"],
    reply: () => ({
      text: "Wrist strain adds up fast with typing and mousing. A short stretch-and-mobilize break can take the edge off.",
      suggestion: { focus: "Wrists", durationMinutes: 3 },
    }),
  },
  {
    match: ["hip"],
    reply: () => ({
      text: "Tight hips are common after long sitting stretches. A short hip-opening session can help you feel more mobile.",
      suggestion: { focus: "Hips", durationMinutes: 4 },
    }),
  },
  {
    match: ["tired", "energy", "exhausted", "fatigue"],
    reply: () => ({
      text: "That drop usually isn't about sleep alone — stagnant blood flow from sitting plays a big part. A short full-body reset can help more than a coffee refill.",
      suggestion: { focus: "Full body", durationMinutes: 3 },
    }),
  },
];

function matchReply(userMessage: string, context: CoachContext): CoachReply {
  const lower = userMessage.toLowerCase();
  const rule = COACH_RULES.find((r) => r.match.some((kw) => lower.includes(kw)));
  if (rule) return rule.reply(context);
  return {
    text:
      context.painAreaNames.length > 0
        ? `Got it — noted. Based on what you've told us, a short ${context.painAreaNames[0].toLowerCase()} session could be a good next step whenever you have a few minutes.`
        : "Got it — noted. Let me know how you're feeling and I can point you to a short session that might help.",
    suggestion: null,
  };
}

/**
 * Rule-based coach reply: matches keywords in the user's message against a
 * small set of body-area/energy patterns, grounded in their actual stored
 * profile and history rather than anything invented.
 */
export async function generateCoachReply(userId: string, userMessage: string): Promise<CoachReply> {
  const context = await getCoachContext(userId);
  return matchReply(userMessage, context);
}
