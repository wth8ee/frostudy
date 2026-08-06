import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AddWordDialog } from "@/components/add-word-dialog";
import { BrainCircuit, Clock } from "lucide-react";
import { ExcelActions } from "@/components/excel-actions";

export default async function DictionaryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const words = await prisma.word.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ваш словарь</h1>
          <p className="text-muted-foreground mt-1">
            {words.length} слов(а) в вашей коллекции
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExcelActions />
          <AddWordDialog />
        </div>
      </div>

      {words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <BrainCircuit className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold">Ваш словарь пуст</h2>
          <p className="text-muted-foreground max-w-md">
            Начните добавлять слова, чтобы пополнить свой словарный запас. Они
            автоматически появятся в ваших ежедневных сеансах повторения.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {words.map((word: any) => (
            <Card
              key={word.id}
              className="border-2 border-border/50 hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{word.word}</h3>
                  <div
                    className="flex items-center text-xs font-semibold text-muted-foreground bg-muted px-2 py-1 rounded-md"
                    title="Следующее повторение"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(word.nextReview).toLocaleDateString()}
                  </div>
                </div>
                <p className="text-primary font-bold mb-4">
                  {word.translation}
                </p>
                {word.example && (
                  <div className="mt-auto pt-3 border-t text-sm text-muted-foreground italic">
                    "{word.example}"
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
