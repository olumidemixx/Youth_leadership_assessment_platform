import prisma from "@/lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    UPDATE Rating
    SET q5 = (q1 + q2 + q3 + q4) / 4.0
    WHERE q5 IS NULL;
  `);
}

main()
  .then(() => {
    console.log("Backfill complete!");
  })
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
