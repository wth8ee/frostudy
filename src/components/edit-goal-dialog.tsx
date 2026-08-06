"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { updateGoal } from "@/app/actions/goal";

interface EditGoalDialogProps {
  currentTotalWords: number;
  currentDays: number;
  currentDailyLimit: number;
}

export function EditGoalDialog({ currentTotalWords, currentDays, currentDailyLimit }: EditGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [totalWords, setTotalWords] = useState(currentTotalWords.toString());
  const [days, setDays] = useState(currentDays.toString());
  const [dailyLimit, setDailyLimit] = useState(currentDailyLimit.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGoal(parseInt(totalWords, 10), parseInt(days, 10), parseInt(dailyLimit, 10));
      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Настроить цель</span>
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Настройка цели</DialogTitle>
          <DialogDescription>
            Установите желаемое количество слов, срок и лимит повторений в день.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="totalWords">Количество слов (общая цель)</Label>
            <Input 
              id="totalWords" 
              type="number" 
              min="10" 
              max="100000" 
              value={totalWords} 
              onChange={(e) => setTotalWords(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="days">Срок (в днях)</Label>
            <Input 
              id="days" 
              type="number" 
              min="1" 
              max="3650" 
              value={days} 
              onChange={(e) => setDays(e.target.value)} 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dailyLimit">Лимит слов для повторения (в день)</Label>
            <Input 
              id="dailyLimit" 
              type="number" 
              min="1" 
              max="500" 
              value={dailyLimit} 
              onChange={(e) => setDailyLimit(e.target.value)} 
              required 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
