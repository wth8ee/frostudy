"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Library } from "lucide-react";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) throw new Error(error.message);
      }
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Что-то пошло не так.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-xl border-2 border-border/50">
        <CardHeader className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Library className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isSignUp ? "Создать аккаунт" : "С возвращением"}
          </CardTitle>
          <CardDescription className="text-base">
            {isSignUp
              ? "Присоединяйтесь к Frostudy и начните обучение сегодня."
              : "Войдите, чтобы продолжить обучение."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-xl font-medium border border-destructive/20">
                {error}
              </div>
            )}
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Имя</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="h-12 border-2 bg-muted/50 rounded-xl"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 border-2 bg-muted/50 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 border-2 bg-muted/50 rounded-xl"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? "Подождите..." : isSignUp ? "Регистрация" : "Войти"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground hover:text-primary font-bold rounded-xl"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
              }}
            >
              {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
