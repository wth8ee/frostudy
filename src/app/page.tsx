import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Trophy, Flame, Library } from "lucide-react";
import { EditGoalDialog } from "@/components/edit-goal-dialog";
import { ActivityCalendar } from "@/components/activity-calendar";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 text-center space-y-8 mt-12">
        <div className="w-32 h-32 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-4">
          <Library className="w-20 h-20" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          Освойте любой язык с <span className="text-primary">Frostudy</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Красивая и минималистичная система интервального повторения, которая поможет вам запомнить слова навсегда.
        </p>
        <Button size="lg" className="rounded-2xl text-lg px-8 h-14 font-bold shadow-[0_4px_0_var(--color-primary-shadow)] hover:translate-y-1 hover:shadow-[0_0px_0_var(--color-primary-shadow)] transition-all" nativeButton={false} render={<Link href="/login">Начать обучение</Link>} />
      </div>
    );
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const totalWords = await prisma.word.count({
    where: { userId },
  });

  const now = new Date();
  const wordsToReview = await prisma.word.count({
    where: {
      userId,
      nextReview: {
        lte: now,
      },
    },
  });

  const learnedWords = await prisma.word.count({
    where: {
      userId,
      interval: {
        gt: 0,
      },
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const activities = await prisma.studyActivity.findMany({
    where: {
      userId,
      date: {
        gte: thirtyDaysAgo
      }
    }
  });

  const targetTotalWords = user?.targetTotalWords || 3000;
  const targetDays = user?.targetDays || 90;
  const dailyReviewLimit = user?.dailyReviewLimit || 20;
  
  const startDate = user?.createdAt || new Date();
  const msPassed = Math.max(0, now.getTime() - startDate.getTime());
  const daysPassed = Math.floor(msPassed / (1000 * 60 * 60 * 24));
  
  const wordsPerDay = targetTotalWords / targetDays;
  const expectedWordsToDate = Math.floor(daysPassed * wordsPerDay);
  
  const wordsBehind = Math.max(0, expectedWordsToDate - totalWords);
  const isBehind = wordsBehind > 0;
  
  const daysLeft = Math.max(1, targetDays - daysPassed);
  const dailyPace = Math.ceil(Math.max(0, targetTotalWords - totalWords) / daysLeft);
  
  const progressPercent = Math.min((totalWords / targetTotalWords) * 100, 100);

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <h1 className="text-3xl font-bold">С возвращением, {session.user.name}!</h1>
        <p className="text-muted-foreground mt-1">Готовы выучить новые слова сегодня?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Слова для повторения</CardTitle>
            <Brain className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{wordsToReview}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Ждут вас прямо сейчас
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Всего слов</CardTitle>
            <Library className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{totalWords}</div>
            <p className="text-sm text-muted-foreground mt-1">
              В вашем словаре
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase text-muted-foreground">Выучено слов</CardTitle>
            <Trophy className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{learnedWords}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Пройдено начальное обучение
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className={`border-2 shadow-sm ${isBehind ? 'border-destructive/50 bg-destructive/5' : 'border-border/50 bg-muted/30'}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between w-full">
            <div className="flex items-center gap-2">
              <Flame className={`h-6 w-6 ${isBehind ? 'text-destructive animate-pulse' : 'text-orange-500'}`} />
              Цель: {targetTotalWords} слов за {targetDays} дн.
            </div>
            <EditGoalDialog currentTotalWords={targetTotalWords} currentDays={targetDays} currentDailyLimit={dailyReviewLimit} />
          </CardTitle>
          <CardDescription>Вам нужно добавлять по {dailyPace} слов(а) в день, чтобы успеть выполнить план.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progressPercent} className={`h-4 ${isBehind ? 'bg-destructive/20 *:[data-slot=progress-indicator]:bg-destructive' : 'bg-secondary'}`} />
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-muted-foreground">{totalWords} / {targetTotalWords} слов</span>
            {isBehind && (
              <span className="text-destructive font-bold animate-pulse text-right">
                ⚠️ Вы отстаете на {wordsBehind} слов! Поднажмите, иначе не успеете!
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <ActivityCalendar activities={activities} dailyReviewLimit={dailyReviewLimit} />

      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <Button 
          size="lg" 
          className="flex-1 rounded-2xl text-lg h-16 font-bold shadow-[0_4px_0_var(--color-primary-shadow)] hover:translate-y-1 hover:shadow-[0_0px_0_var(--color-primary-shadow)] transition-all" 
          nativeButton={false}
          render={<Link href="/learn">Начать сеанс повторения</Link>}
        />
        <Button 
          size="lg" 
          variant="outline" 
          className="flex-1 rounded-2xl text-lg h-16 font-bold border-2 shadow-[0_4px_0_var(--color-border)] hover:translate-y-1 hover:shadow-[0_0px_0_var(--color-border)] transition-all" 
          nativeButton={false}
          render={<Link href="/dictionary">Управление словарем</Link>}
        />
      </div>
    </div>
  );
}
