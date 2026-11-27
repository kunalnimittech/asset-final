import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button type="button" className="btn btn--icon" onClick={toggle} aria-label={`Switch to ${next} theme`} title={`Switch to ${next} theme`}>
      {theme === "dark" ? <Sun size={16} strokeWidth={1.8} /> : <Moon size={16} strokeWidth={1.8} />}
    </button>
  );
}
