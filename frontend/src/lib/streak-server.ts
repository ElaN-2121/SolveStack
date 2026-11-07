import { prisma } from "@/lib/prisma";
import { computeStreak, DEFAULT_TIME_ZONE, isValidTimeZone } from "@/lib/streak";

export async function getStreakForUser(userId: string, now: Date = new Date()) {
  const [user, solved] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { timezone: true } }),
    prisma.challenge.findMany({
      where: { userId, status: "SOLVED", solvedAt: { not: null } },
      select: { solvedAt: true },
      orderBy: { solvedAt: "desc" },
      take: 5000,
    }),
  ]);

  const timeZone = user?.timezone && isValidTimeZone(user.timezone) ? user.timezone : DEFAULT_TIME_ZONE;
  const dates = solved.flatMap((c: { solvedAt: Date | null }) => (c.solvedAt ? [c.solvedAt] : []));
  return { ...computeStreak(dates, timeZone, now), timezone: timeZone };
}
