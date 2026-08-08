"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Library, PlayCircle, BookOpen } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useColorTheme } from "./color-theme-provider";

export function Navbar() {
  const { data: session } = authClient.useSession();
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 sm:h-16 items-center mx-auto px-2 xs:px-3 sm:px-8 max-w-6xl w-full">
        {/* Лого */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 mr-2 sm:mr-4">
            <Library className="w-6 h-6 sm:w-8 sm:h-8 text-primary shrink-0" />
            <span className="font-bold text-lg sm:text-2xl tracking-tighter text-primary">
              Frostudy
            </span>
          </Link>
          {session && (
            <nav className="flex items-center gap-1 sm:gap-4 text-sm font-medium">
              <Link href="/learn" className="transition-colors hover:text-foreground/80 text-foreground flex items-center gap-1 p-1 sm:p-0">
                <PlayCircle className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">Обучение</span>
              </Link>
              <Link href="/dictionary" className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1 p-1 sm:p-0">
                <BookOpen className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">Словарь</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Правая часть */}
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
          {/* Переключатель темы */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 shrink-0"
          >
            {mounted && theme === "dark" ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="sr-only">Переключить тему</span>
          </Button>

          {/* Цветовые темы */}
          {mounted && (
            <div className="flex bg-muted rounded-full p-0.5 sm:p-1 gap-0.5 sm:gap-1 shrink-0">
              <button
                onClick={() => setColorTheme("ice")}
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#00b4d8] border-2 transition-transform ${colorTheme === "ice" ? "scale-110 border-foreground" : "border-transparent"}`}
                title="Ледяной"
              />
              <button
                onClick={() => setColorTheme("green")}
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#58cc02] border-2 transition-transform ${colorTheme === "green" ? "scale-110 border-foreground" : "border-transparent"}`}
                title="Зеленый"
              />
              <button
                onClick={() => setColorTheme("purple")}
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-[#a855f7] border-2 transition-transform ${colorTheme === "purple" ? "scale-110 border-foreground" : "border-transparent"}`}
                title="Фиолетово-розовый"
              />
            </div>
          )}

          {/* Кнопка входа/выхода */}
          {session ? (
            <Button
              variant="outline"
              className="rounded-full font-bold text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 shrink-0"
              onClick={handleLogout}
            >
              Выйти
            </Button>
          ) : (
            <Button
              className="rounded-full font-bold shadow-md text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4 shrink-0"
              nativeButton={false}
              render={<Link href="/login">Начать</Link>}
            />
          )}
        </div>
      </div>
    </header>
  );
}
