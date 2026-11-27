import { useSyncExternalStore } from "react";

// Two themes: "light" and "dark". The choice lives on <html data-theme> and in
// localStorage; index.html sets it before first paint so there is no flash.
const KEY = "theme";

const read = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    /* private mode: the choice just won't persist */
  }
  listeners.forEach((fn) => fn());
}

/** The current theme, re-rendering when it changes. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "light");
  return [theme, () => setTheme(theme === "dark" ? "light" : "dark")];
}
