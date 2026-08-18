import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  concerns,
  mechanisms,
  concernMechanisms,
  practices,
  practiceConcerns,
} from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding ${concerns.length} concerns...`);
  for (const concern of concerns) {
    await prisma.concern.upsert({
      where: { slug: concern.slug },
      update: concern,
      create: concern,
    });
  }

  console.log(`Seeding ${mechanisms.length} mechanisms...`);
  for (const mechanism of mechanisms) {
    await prisma.mechanism.upsert({
      where: { slug: mechanism.slug },
      update: mechanism,
      create: mechanism,
    });
  }

  // Resolve every slug up front so the link loops are plain id lookups rather
  // than a query per row.
  const concernIdBySlug = new Map(
    (await prisma.concern.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id])
  );
  const mechanismIdBySlug = new Map(
    (await prisma.mechanism.findMany({ select: { id: true, slug: true } })).map((m) => [m.slug, m.id])
  );

  function concernId(slug: string) {
    const id = concernIdBySlug.get(slug);
    if (!id) throw new Error(`Unknown concern slug: "${slug}"`);
    return id;
  }
  function mechanismId(slug: string) {
    const id = mechanismIdBySlug.get(slug);
    if (!id) throw new Error(`Unknown mechanism slug: "${slug}"`);
    return id;
  }

  console.log(`Linking concerns to mechanisms (${concernMechanisms.length} links)...`);
  for (const link of concernMechanisms) {
    const ids = { concernId: concernId(link.concern), mechanismId: mechanismId(link.mechanism) };
    await prisma.concernMechanism.upsert({
      where: { concernId_mechanismId: ids },
      update: { weight: link.weight },
      create: { ...ids, weight: link.weight },
    });
  }

  console.log(`Seeding ${practices.length} practices...`);
  for (const practice of practices) {
    const { mechanisms: practiceMechanisms, ...practiceData } = practice;

    const row = await prisma.practice.upsert({
      where: { slug: practice.slug },
      update: practiceData,
      create: practiceData,
    });

    for (const link of practiceMechanisms) {
      const ids = { practiceId: row.id, mechanismId: mechanismId(link.slug) };
      await prisma.practiceMechanism.upsert({
        where: { practiceId_mechanismId: ids },
        update: { weight: link.weight },
        create: { ...ids, weight: link.weight },
      });
    }
  }

  const practiceIdBySlug = new Map(
    (await prisma.practice.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id])
  );

  console.log(`Applying ${practiceConcerns.length} direct concern overrides...`);
  for (const override of practiceConcerns) {
    const practiceId = practiceIdBySlug.get(override.practice);
    if (!practiceId) throw new Error(`Unknown practice slug: "${override.practice}"`);
    const ids = { practiceId, concernId: concernId(override.concern) };
    await prisma.practiceConcern.upsert({
      where: { practiceId_concernId: ids },
      update: { weight: override.weight },
      create: { ...ids, weight: override.weight },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
