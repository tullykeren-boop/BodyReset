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

  const bodyAreas = await prisma.bodyArea.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <PhoneFrame>
      <div className="h-full overflow-y-auto">
        <OnboardingClient bodyAreas={bodyAreas.map((a) => ({ slug: a.slug, name: a.name }))} />
      </div>
    </PhoneFrame>
  );
}
