"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  memo,
} from "react";
import { CONTEXT_ERROR_MESSAGES } from "@/lib/constants/messages";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = memo<{ children: React.ReactNode }>(
  ({ children }) => {
    const [theme, setTheme] = useState<Theme>("light");
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      const savedTheme = localStorage.getItem("theme");
      const initialTheme =
        savedTheme === "light" || savedTheme === "dark" ? savedTheme : "light";

      setTheme(initialTheme);
      setIsInitialized(true);
    }, []);

    useEffect(() => {
      if (isInitialized) {
        localStorage.setItem("theme", theme);
        if (theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    }, [theme, isInitialized]);

    const toggleTheme = useCallback(() => {
      setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    }, []);

    return (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  },
);

ThemeProvider.displayName = "ThemeProvider";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(CONTEXT_ERROR_MESSAGES.THEME_PROVIDER);
  }
  return context;
};
