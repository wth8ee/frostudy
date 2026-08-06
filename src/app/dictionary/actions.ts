"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function addWord(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  const word = formData.get("word") as string;
  const translation = formData.get("translation") as string;
  const example = formData.get("example") as string;
  
  if (!word || !translation) return { error: "Word and translation are required" };
  
  await prisma.word.create({
    data: {
      userId: session.user.id,
      word,
      translation,
      example,
    }
  });
  
  revalidatePath("/dictionary");
  revalidatePath("/");
  return { success: true };
}

export async function deleteWord(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  
  await prisma.word.delete({
    where: {
      id,
      userId: session.user.id,
    }
  });
  
  revalidatePath("/dictionary");
  revalidatePath("/");
  return { success: true };
}
