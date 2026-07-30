import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { bodyAreas, muscleGroups, bodyAreaMuscleGroups, exercises } from "./seed-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding body areas...");
  for (const area of bodyAreas) {
    await prisma.bodyArea.upsert({
      where: { slug: area.slug },
      update: area,
      create: area,
    });
  }

  console.log("Seeding muscle groups...");
  for (const group of muscleGroups) {
    await prisma.muscleGroup.upsert({
      where: { slug: group.slug },
      update: group,
      create: group,
    });
  }

  console.log("Linking body areas to muscle groups...");
  for (const link of bodyAreaMuscleGroups) {
    const [bodyArea, muscleGroup] = await Promise.all([
      prisma.bodyArea.findUniqueOrThrow({ where: { slug: link.bodyArea } }),
      prisma.muscleGroup.findUniqueOrThrow({ where: { slug: link.muscleGroup } }),
    ]);
    await prisma.bodyAreaMuscleGroup.upsert({
      where: {
        bodyAreaId_muscleGroupId: {
          bodyAreaId: bodyArea.id,
          muscleGroupId: muscleGroup.id,
        },
      },
      update: { weight: link.weight },
      create: {
        bodyAreaId: bodyArea.id,
        muscleGroupId: muscleGroup.id,
        weight: link.weight,
      },
    });
  }

  console.log("Seeding exercises...");
  for (const ex of exercises) {
    const { muscleGroups: exMuscleGroups, ...exerciseData } = ex;

    const exercise = await prisma.exercise.upsert({
      where: { slug: ex.slug },
      update: exerciseData,
      create: exerciseData,
    });

    for (const link of exMuscleGroups) {
      const muscleGroup = await prisma.muscleGroup.findUniqueOrThrow({
        where: { slug: link.slug },
      });
      await prisma.exerciseMuscleGroup.upsert({
        where: {
          exerciseId_muscleGroupId: {
            exerciseId: exercise.id,
            muscleGroupId: muscleGroup.id,
          },
        },
        update: { isPrimary: link.isPrimary },
        create: {
          exerciseId: exercise.id,
          muscleGroupId: muscleGroup.id,
          isPrimary: link.isPrimary,
        },
      });
    }
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
