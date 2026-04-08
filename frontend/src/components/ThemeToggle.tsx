import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("surf-studio-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("surf-studio-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-bg-subtle hover:bg-bg-subtle-hover transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun className="w-4 h-4 text-fg-base" /> : <Moon className="w-4 h-4 text-fg-base" />}
    </button>
  );
}
