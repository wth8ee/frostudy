"use client";

import { createContext, useContext, useEffect, useState } from "react";

type ColorTheme = "ice" | "green" | "purple";

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("ice");

  useEffect(() => {
    const saved = localStorage.getItem("color-theme") as ColorTheme;
    if (saved && ["ice", "green", "purple"].includes(saved)) {
      setColorThemeState(saved);
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = "ice";
    }
  }, []);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem("color-theme", theme);
    document.documentElement.dataset.theme = theme;
  };

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }
  return context;
}
