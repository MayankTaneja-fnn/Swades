import { PrismaClient } from "@prisma/client/edge";

export const getPrisma = (databaseUrl: string) => {
  return new PrismaClient({
    datasourceUrl: databaseUrl,
  });
};
