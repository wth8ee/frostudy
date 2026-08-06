"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addMultipleWords(words: { word: string; translation: string; example?: string }[]) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const data = words.map(w => ({
    userId: session.user.id,
    word: w.word,
    translation: w.translation,
    example: w.example,
    nextReview: new Date(),
  }));

  await prisma.word.createMany({
    data,
  });

  revalidatePath("/dictionary");
  revalidatePath("/learn");
  revalidatePath("/");
  
  return { success: true };
}

export async function getAllWords() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const words = await prisma.word.findMany({
    where: { userId: session.user.id },
    select: {
      word: true,
      translation: true,
      example: true,
    }
  });

  return words;
}
