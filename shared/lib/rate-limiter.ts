import prisma from "../db/prisma";
import { tooManyRequest } from "./error-handlers";

interface RateLimitOptions {
  limit: number; // Max allowed requests
  windowSeconds: number; // Time window in seconds
}

export async function checkRateLimit(key: string, options: RateLimitOptions) {
  const { limit, windowSeconds } = options;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  // Atomic operation: find existing window or create new one
  const existing = await prisma.rateLimit.findUnique({
    where: { key },
  });

  // If expired or doesn't exist, reset window
  if (!existing || existing.expiresAt < now) {
    await prisma.rateLimit.upsert({
      where: { key },
      create: { key, count: 1, expiresAt: resetAt },
      update: { count: 1, expiresAt: resetAt },
    });
    return { success: true, remaining: limit - 1, resetAt };
  }

  // Window is active but limit exceeded
  if (existing.count >= limit) {
    return { success: false, remaining: 0, resetAt: existing.expiresAt };
  }

  const updated = await prisma.rateLimit.update({
    where: { key },
    data: { count: { increment: 1 } },
  });

  return {
    success: true,
    remaining: Math.max(0, limit - updated.count),
    resetAt: existing.expiresAt,
  };
}

export async function executeRatelimit(req: Request) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const rateLimitKey = `register:${ip}`;

  const { resetAt, success } = await checkRateLimit(rateLimitKey, {
    limit: 10,
    windowSeconds: 15 * 60,
  });

  if (!success) {
    const retryAfterMinutes = Math.ceil(
      (resetAt.getTime() - Date.now()) / (1000 * 60),
    );
    throw tooManyRequest(
      "Too many requests. Please try again later after " +
        retryAfterMinutes +
        " minute(s)",
    );
  }
}
