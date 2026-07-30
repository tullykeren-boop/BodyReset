import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/streaks";
import { getAnthropicClient, isAnthropicConfigured, COACH_MODEL } from "@/lib/anthropic";
import type { CoachRole, Goal } from "@/generated/prisma/client";
import type Anthropic from "@anthropic-ai/sdk";

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

function buildSystemPrompt(context: CoachContext): string {
  const lines = [
    "You are the ReSet coach: a calm, warm, concise AI workday recovery coach.",
    "ReSet helps desk workers relieve and prevent physical discomfort (neck, shoulders, upper back, lower back, wrists, hips) with short 3-10 minute guided exercise sessions.",
    "You are NOT a doctor. Never diagnose conditions or claim to know something about the user you were not told. Only reference facts given below — do not invent details about their calendar, meetings, or day.",
    "Keep replies to 2-4 short sentences, warm and specific, never generic filler.",
    "",
    "What you actually know about this user:",
    `- Primary goal: ${context.goal.replace("_", " ").toLowerCase()}`,
    context.painAreaNames.length > 0
      ? `- Areas they usually feel discomfort: ${context.painAreaNames.join(", ")}`
      : "- They haven't told us their pain areas yet.",
    `- Current streak: ${context.streak} day(s)`,
    context.recentMoods.length > 0
      ? `- Recent check-ins (most recent first): ${context.recentMoods.join(", ")}`
      : "- No recent check-ins logged.",
    context.recentFeedback.length > 0
      ? `- Recent session feedback: ${context.recentFeedback
          .map((f) => `pain ${f.painBefore}->${f.painAfter}${f.helped ? ", helped" : ", didn't help much"}`)
          .join("; ")}`
      : "- No session feedback yet.",
    "",
    "If — and only if — it's genuinely relevant, you may suggest one short recovery session. When you do, end your reply on its own new line with exactly this format (nothing else on that line):",
    '<<SUGGEST focus="Shoulders" minutes="4">>',
    "Use one of the user's known pain areas as the focus when possible. Omit this line entirely if a suggestion doesn't fit the conversation.",
  ];
  return lines.join("\n");
}

const SUGGEST_LINE = /<<SUGGEST\s+focus="([^"]+)"\s+minutes="(\d+)">>\s*$/;

function parseSuggestion(text: string): CoachReply {
  const match = text.match(SUGGEST_LINE);
  if (!match) return { text: text.trim(), suggestion: null };
  return {
    text: text.replace(SUGGEST_LINE, "").trim(),
    suggestion: { focus: match[1], durationMinutes: Number(match[2]) },
  };
}

const FALLBACK_RULES: { match: string[]; reply: (ctx: CoachContext) => CoachReply }[] = [
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

function fallbackReply(userMessage: string, context: CoachContext): CoachReply {
  const lower = userMessage.toLowerCase();
  const rule = FALLBACK_RULES.find((r) => r.match.some((kw) => lower.includes(kw)));
  if (rule) return rule.reply(context);
  return {
    text:
      context.painAreaNames.length > 0
        ? `Got it — noted. Based on what you've told us, a short ${context.painAreaNames[0].toLowerCase()} session could be a good next step whenever you have a few minutes.`
        : "Got it — noted. Let me know how you're feeling and I can point you to a short session that might help.",
    suggestion: null,
  };
}

export async function generateCoachReply(
  userId: string,
  history: { role: CoachRole; content: string }[],
  userMessage: string
): Promise<CoachReply> {
  const context = await getCoachContext(userId);

  if (!isAnthropicConfigured()) {
    return fallbackReply(userMessage, context);
  }

  try {
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: COACH_MODEL,
      max_tokens: 300,
      system: buildSystemPrompt(context),
      messages: [
        ...history.map((m) => ({
          role: m.role === "ASSISTANT" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
        { role: "user" as const, content: userMessage },
      ],
    });

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n");

    return parseSuggestion(text);
  } catch {
    return fallbackReply(userMessage, context);
  }
}
