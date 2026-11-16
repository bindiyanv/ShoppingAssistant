import { useCallback, useEffect, useState } from "react";

const KEY = "shopassist.theme";

function currentTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(currentTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* storage unavailable — theme still applies for this visit */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  return { theme, toggle };
}
