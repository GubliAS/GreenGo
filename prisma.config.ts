import { defineConfig, env } from "prisma/config";

/* Prisma 7 moved the connection URL out of schema.prisma and into this file
 * (schema.prisma's datasource.url is no longer accepted — caught immediately
 * by `prisma validate`). Also wires the seed command so `prisma migrate dev`
 * runs it automatically. */

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
