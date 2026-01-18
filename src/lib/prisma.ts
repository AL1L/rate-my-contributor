import { PrismaClient } from "@/generated/prisma/client"; // Updated import path for PrismaClient
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL || "";
console.log("NODE_ENV", process.env.NODE_ENV);
console.log("DATABASE_URL host", connectionString.replace(/\/\/.*?:.*?@/, "//***:***@"));

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

export default prisma;

export async function getCommitsByPullRequestId(pullRequestId: string) {
  return prisma.commit.findMany({
    where: { pullRequestId },
    select: {
      id: true,
      message: true,
      url: true,
    },
  });
}
