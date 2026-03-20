import { z } from "zod";
import { ValidationError } from "@/lib/error-handler";

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_PROVIDER: z.enum(["mirage", "prisma"]).default("mirage"),
  DATABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

function validateEnv(): Env {
  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_PROVIDER: process.env.DATABASE_PROVIDER,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  };

  const env = EnvSchema.parse(rawEnv);

  if (env.DATABASE_PROVIDER === "prisma" && !env.DATABASE_URL) {
    throw new ValidationError(
      "DATABASE_URL is required when DATABASE_PROVIDER=prisma. " +
        "Please set the DATABASE_URL environment variable.",
      { provider: env.DATABASE_PROVIDER },
    );
  }

  return env;
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}

export function isPrismaProvider(): boolean {
  return getEnv().DATABASE_PROVIDER === "prisma";
}

export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === "development";
}

export function isProduction(): boolean {
  return getEnv().NODE_ENV === "production";
}

export function isTest(): boolean {
  return getEnv().NODE_ENV === "test";
}
