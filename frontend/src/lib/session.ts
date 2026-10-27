import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Returns the signed-in user's database row, or null.
 * Returns null even when a valid session cookie exists but the row is gone
 * (for example after a database reset), which prevents redirect loops.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      handle: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });
}
