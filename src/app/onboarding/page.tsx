import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PhoneFrame } from "@/components/phone-frame";
import { OnboardingClient } from "./onboarding-client";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existingProfile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (existingProfile) redirect("/dashboard");

  const concerns = await prisma.concern.findMany({ orderBy: { sortOrder: "asc" } });
  const toOption = (c: (typeof concerns)[number]) => ({ slug: c.slug, name: c.name });

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto">
        <OnboardingClient
          physicalConcerns={concerns.filter((c) => c.kind === "PHYSICAL").map(toOption)}
          mentalConcerns={concerns.filter((c) => c.kind === "MENTAL").map(toOption)}
        />
      </div>
    </PhoneFrame>
  );
}
