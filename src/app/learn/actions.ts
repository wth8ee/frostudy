"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function submitReview(wordId: string, performanceRating: 1 | 2 | 3 | 4) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const word = await prisma.word.findUnique({
    where: { id: wordId, userId: session.user.id },
  });

  if (!word) throw new Error("Word not found");

  let { interval, repetition, easeFactor } = word;


  if (performanceRating === 1) {
    repetition = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (performanceRating === 2) {
    interval = Math.max(1, Math.round(interval * 1.2));
    easeFactor = Math.max(1.3, easeFactor - 0.15);
  } else if (performanceRating === 3) {
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 3;
    else interval = Math.round(interval * easeFactor);
    repetition += 1;
  } else if (performanceRating === 4) {
    if (repetition === 0) interval = 4;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * easeFactor * 1.3);
    easeFactor += 0.15;
    repetition += 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  const updatedWord = await prisma.word.update({
    where: { id: word.id },
    data: {
      interval,
      repetition,
      easeFactor,
      nextReview,
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.studyActivity.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
    update: {
      count: { increment: 1 },
    },
    create: {
      userId: session.user.id,
      date: today,
      count: 1,
    },
  });

  return updatedWord;
}
