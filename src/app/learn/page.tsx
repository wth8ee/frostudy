import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StudySession } from "./StudySession";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default async function LearnPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const now = new Date();
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { dailyReviewLimit: true }
  });
  
  const limit = user?.dailyReviewLimit || 20;

  const wordsToReview = await prisma.word.findMany({
    where: {
      userId: session.user.id,
      nextReview: {
        lte: now,
      },
    },
    take: limit,
    orderBy: {
      nextReview: "asc",
    }
  });

  if (wordsToReview.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Вы всё повторили!</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Вы повторили все слова на данный момент. Возвращайтесь позже или добавьте новые слова в свой словарь.
        </p>
        <div className="flex gap-4 mt-8">
          <Button size="lg" className="rounded-xl font-bold h-12" nativeButton={false} render={<Link href="/">На главную</Link>} />
          <Button size="lg" variant="outline" className="rounded-xl font-bold h-12 border-2" nativeButton={false} render={<Link href="/dictionary">Добавить еще слова</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-full max-h-[800px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Сеанс повторения</h1>
        <p className="text-muted-foreground font-medium">Осталось {wordsToReview.length} слов</p>
      </div>
      <StudySession words={wordsToReview} />
    </div>
  );
}
