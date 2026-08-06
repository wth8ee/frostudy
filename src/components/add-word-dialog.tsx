"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { addWord } from "@/app/dictionary/actions";

export function AddWordDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    await addWord(formData);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="rounded-xl font-bold shadow-sm" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Добавить слово
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] rounded-3xl border-2">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Добавить новое слово</DialogTitle>
            <DialogDescription>
              Добавьте новое слово в свой словарь. Оно будет запланировано для повторения.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="word" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Слово</Label>
              <Input
                id="word"
                name="word"
                placeholder="напр. Gato"
                required
                className="h-12 border-2 bg-muted/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="translation" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Перевод</Label>
              <Input
                id="translation"
                name="translation"
                placeholder="напр. Кот"
                required
                className="h-12 border-2 bg-muted/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="example" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Пример (необязательно)</Label>
              <Input
                id="example"
                name="example"
                placeholder="напр. El gato duerme"
                className="h-12 border-2 bg-muted/50 rounded-xl"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold rounded-xl shadow-sm" 
              disabled={loading}
            >
              {loading ? "Добавление..." : "Добавить слово"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
