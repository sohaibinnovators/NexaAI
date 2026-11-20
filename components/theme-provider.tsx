"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/lib/workspace/storage";
import type { ThemePreference } from "@/lib/workspace/types";
import {
  getPreferencesSnapshot,
  setPreferencesStore,
} from "@/lib/workspace/store";

type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ResolvedTheme;
  preference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    window.localStorage.setItem(STORAGE_KEYS.themeResolved, theme);
  } catch {
    // ignore
  }
}

function readPreference(): ThemePreference {
  try {
    const prefs = getPreferencesSnapshot();
    if (prefs.theme === "light" || prefs.theme === "dark" || prefs.theme === "system") {
      return prefs.theme;
    }
    const legacy = window.localStorage.getItem(STORAGE_KEYS.themeMode);
    if (legacy === "light" || legacy === "dark" || legacy === "system") {
      return legacy;
    }
    const old = window.localStorage.getItem(STORAGE_KEYS.themeResolved);
    if (old === "light" || old === "dark") return old;
  } catch {
    // ignore
  }
  return "system";
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === "light" || preference === "dark") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getSnapshot(): ResolvedTheme {
  return resolveTheme(readPreference());
}

function getServerSnapshot(): ResolvedTheme {
  return "light";
}

function getPreferenceServerSnapshot(): ThemePreference {
  return "system";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const preference = useSyncExternalStore(
    subscribe,
    readPreference,
    getPreferenceServerSnapshot,
  );

  useEffect(() => {
    applyTheme(theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readPreference() === "system") {
        applyTheme(resolveTheme("system"));
        emit();
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setThemePreference = useCallback((next: ThemePreference) => {
    const prefs = getPreferencesSnapshot();
    setPreferencesStore({ ...prefs, theme: next });
    try {
      window.localStorage.setItem(STORAGE_KEYS.themeMode, next);
    } catch {
      // ignore
    }
    applyTheme(resolveTheme(next));
    emit();
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(theme === "dark" ? "light" : "dark");
  }, [setThemePreference, theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, preference, setThemePreference, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
