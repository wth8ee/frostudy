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
  const router = useRouter();

  if (currentIndex >= words.length) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        <h2 className="text-3xl font-bold">Сеанс завершен!</h2>
        <p className="text-muted-foreground text-lg">Отличная работа. Вы повторили {words.length} слов(а).</p>
        <Button size="lg" className="rounded-xl font-bold h-12" onClick={() => router.refresh()}>
          Завершить
        </Button>
      </div>
    );
  }

  const currentWord = words[currentIndex];

  const handleReview = async (rating: 1 | 2 | 3 | 4) => {
    setLoading(true);
    try {
      await submitReview(currentWord.id, rating);
      setShowAnswer(false);
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[600px] w-full max-w-2xl mx-auto">
      <Card className="flex-1 flex flex-col justify-center items-center text-center p-8 border-4 border-border/50 rounded-3xl shadow-sm relative overflow-hidden bg-card">
        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        
        <div className="text-6xl font-black text-foreground mb-8 tracking-tight">
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
          <div className="w-full max-w-md animate-in fade-in duration-300 flex-1 flex flex-col justify-end pb-8">
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
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-destructive/20 hover:border-destructive hover:bg-destructive/10 text-destructive font-bold transition-all hover:scale-[1.02]"
            onClick={() => handleReview(1)}
            disabled={loading}
          >
            <span className="text-lg">Снова</span>
            <span className="text-xs opacity-70 mt-1">&lt; 1 мин</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/10 text-orange-600 font-bold transition-all hover:scale-[1.02]"
            onClick={() => handleReview(2)}
            disabled={loading}
          >
            <span className="text-lg">Трудно</span>
            <span className="text-xs opacity-70 mt-1">
              {currentWord.interval === 0 ? "1 дн." : `${Math.max(1, Math.round(currentWord.interval * 1.2))} дн.`}
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-primary/20 hover:border-primary hover:bg-primary/10 text-primary font-bold transition-all hover:scale-[1.02]"
            onClick={() => handleReview(3)}
            disabled={loading}
          >
            <span className="text-lg">Хорошо</span>
            <span className="text-xs opacity-70 mt-1">
              {currentWord.interval === 0 ? "3 дн." : `${Math.round(currentWord.interval * currentWord.easeFactor)} дн.`}
            </span>
          </Button>
          <Button 
            variant="outline" 
            className="h-20 flex flex-col items-center justify-center rounded-2xl border-2 border-blue-500/20 hover:border-blue-500 hover:bg-blue-500/10 text-blue-600 font-bold transition-all hover:scale-[1.02]"
            onClick={() => handleReview(4)}
            disabled={loading}
          >
            <span className="text-lg">Легко</span>
            <span className="text-xs opacity-70 mt-1">
              {currentWord.interval === 0 ? "4 дн." : `${Math.round(currentWord.interval * currentWord.easeFactor * 1.3)} дн.`}
            </span>
          </Button>
        </div>
      )}
    </div>
  );
}
