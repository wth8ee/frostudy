"use client";

import { useState } from "react";
import { Word } from "@prisma/client";
import { submitReview } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface StudySessionProps {
  words: Word[];
}

export function StudySession({ words }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [queue, setQueue] = useState<Word[]>(words);
  const router = useRouter();

  if (currentIndex >= queue.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        <h2 className="text-3xl font-bold">Сеанс завершен!</h2>
        <p className="text-muted-foreground text-lg">Отличная работа. Вы повторили {new Set(queue.map(w => w.id)).size} слов(а).</p>
        <Button size="lg" className="rounded-xl font-bold h-12" onClick={() => router.refresh()}>
          Завершить
        </Button>
      </div>
    );
  }

  const currentWord = queue[currentIndex];

  const formatInterval = (minutes: number) => {
    if (minutes < 60) return `${Math.max(1, minutes)} мин`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} ч`;
    const days = Math.round(minutes / 1440);
    if (days < 30) return `${days} дн`;
    const months = Math.round(days / 30);
    if (months < 12) return `${months} мес`;
    return `${Math.round(days / 365)} г`;
  };

  const handleReview = async (rating: 1 | 2 | 3 | 4) => {
    setLoading(true);
    try {
      const updatedWord = await submitReview(currentWord.id, rating);
      if (updatedWord.interval < 1440) {
        setQueue((prev) => [...prev, updatedWord]);
      }
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Сеанс повторения</h1>
        <p className="text-muted-foreground font-medium">Осталось {queue.length - currentIndex} слов</p>
      </div>
      <div className="flex flex-col h-[60vh] max-h-[600px] w-full max-w-2xl mx-auto">
      <Card className="flex-1 flex flex-col justify-center items-center text-center p-8 border-4 border-border/50 rounded-3xl shadow-sm relative overflow-hidden bg-card">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground mb-8 tracking-tight break-words px-4 w-full text-center">
          {currentWord.word}
        </div>
        
        {showAnswer ? (
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="h-px w-full bg-border/50 mb-8" />
            <div className="text-3xl font-bold text-primary mb-4">
              {currentWord.translation}
            </div>
            {currentWord.example && (
              <div className="text-lg text-muted-foreground italic bg-muted/30 p-4 rounded-xl border border-border/30">
                "{currentWord.example}"
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in duration-300 mt-8">
            <Button 
              size="lg" 
              className="w-full h-16 text-xl font-bold rounded-2xl shadow-[0_4px_0_var(--color-primary-shadow)] hover:translate-y-1 hover:shadow-[0_0px_0_var(--color-primary-shadow)] transition-all"
              onClick={() => setShowAnswer(true)}
            >
              Показать ответ
            </Button>
          </div>
        )}
      </Card>

      {showAnswer && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-destructive/30 hover:border-destructive hover:bg-destructive/10 text-foreground transition-all hover:scale-[1.02]"
            onClick={() => handleReview(1)}
            disabled={loading}
          >
            <span className="text-lg font-bold">Снова</span>
            <span className="text-xs text-muted-foreground mt-1">1 мин</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/10 text-foreground transition-all hover:scale-[1.02]"
            onClick={() => handleReview(2)}
            disabled={loading}
          >
            <span className="text-lg font-bold">Трудно</span>
            <span className="text-xs text-muted-foreground mt-1">
              {formatInterval(currentWord.repetition === 0 ? 3 : currentWord.repetition === 1 ? 10 : Math.max(1440, Math.round(currentWord.interval * 1.2)))}
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-primary/30 hover:border-primary hover:bg-primary/10 text-foreground transition-all hover:scale-[1.02]"
            onClick={() => handleReview(3)}
            disabled={loading}
          >
            <span className="text-lg font-bold">Хорошо</span>
            <span className="text-xs text-muted-foreground mt-1">
              {formatInterval(currentWord.repetition === 0 ? 5 : currentWord.repetition === 1 ? 15 : currentWord.repetition === 2 ? 1440 : Math.max(1440, Math.round(currentWord.interval * currentWord.easeFactor)))}
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-blue-500/30 hover:border-blue-500 hover:bg-blue-500/10 text-foreground transition-all hover:scale-[1.02]"
            onClick={() => handleReview(4)}
            disabled={loading}
          >
            <span className="text-lg font-bold">Легко</span>
            <span className="text-xs text-muted-foreground mt-1">
              {formatInterval(currentWord.repetition === 0 ? 15 : currentWord.repetition === 1 ? 1440 : currentWord.repetition === 2 ? 4320 : Math.max(5760, Math.round(currentWord.interval * currentWord.easeFactor * 1.3)))}
            </span>
          </Button>
        </div>
      )}
    </div>
    </>
  );
}
