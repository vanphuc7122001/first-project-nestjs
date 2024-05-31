import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const seeds = [];

  const seeded: string[] = (
    await prisma.seed.findMany({
      where: { key: { in: seeds.map((seed) => seed.key) } },
    })
  ).map((seed) => seed.key);

  for (const seed of seeds) {
    if (!seeded.includes(seed.key)) {
      await seed.run(prisma);
      await prisma.seed.create({ data: { key: seed.key } });
    }
  }

  process.exit(0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
