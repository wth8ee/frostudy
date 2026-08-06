"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateGoal(targetTotalWords: number, targetDays: number, dailyReviewLimit: number) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      targetTotalWords,
      targetDays,
      dailyReviewLimit,
    },
  });

  revalidatePath("/");
  revalidatePath("/learn");
}
