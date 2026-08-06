"use client";

import { useMemo, useEffect, useState } from "react";

interface ActivityCalendarProps {
  activities: { date: Date; count: number }[];
  dailyReviewLimit: number;
}

export function ActivityCalendar({ activities, dailyReviewLimit }: ActivityCalendarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = useMemo(() => {
    const dates = [];
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [today]);

  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach((a) => {
      map.set(new Date(a.date).toISOString().split('T')[0], a.count);
    });
    return map;
  }, [activities]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const count = activityMap.get(key) || 0;
      if (count > 0 || (i === 0 && count === 0)) { 
        if (count > 0) streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [activityMap, today]);

  const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  if (!mounted) return null;

  return (
    <div className="flex flex-col space-y-4 p-5 bg-card rounded-2xl border-2 border-border/50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
      
      <div className="flex justify-between items-center relative z-10">
        <h3 className="font-bold text-lg flex items-center gap-2">
          🔥 Ударный режим
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-orange-500">{currentStreak}</span>
          <span className="text-muted-foreground font-medium text-sm">дней подряд</span>
        </div>
      </div>
      
      <div className="flex justify-between gap-2 overflow-x-auto pb-2 pt-2 custom-scrollbar relative z-10 w-full max-w-sm mx-auto">
        {weekDays.map((date, i) => {
          const key = date.toISOString().split('T')[0];
          const count = activityMap.get(key) || 0;
          const isToday = key === today.toISOString().split('T')[0];
          const isCompleted = count > 0;
          const isGoalMet = count >= dailyReviewLimit;
          const dayName = daysOfWeek[i];
          
          return (
            <div key={key} className="flex flex-col items-center gap-2">
              <span className={`text-xs font-bold ${isToday ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {dayName}
              </span>
              <div 
                className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isGoalMet 
                    ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)] scale-110' 
                    : isCompleted 
                      ? 'bg-orange-500/40 border-orange-500/40 text-white' 
                      : isToday 
                        ? 'border-orange-500 border-dashed bg-orange-500/10' 
                        : 'border-border/50 bg-muted/10 text-muted-foreground/30'}
                `}
                title={`${key}: ${count} слов`}
              >
                <span className={`text-sm font-bold ${isGoalMet ? 'text-white' : ''}`}>
                  {date.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-xs text-muted-foreground text-center pt-1 font-medium">
        Выполните цель ({dailyReviewLimit} слов), чтобы зажечь день!
      </div>
    </div>
  );
}
