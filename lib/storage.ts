import { ConnectionSettings, EMPTY_SETTINGS } from "./types";

const SETTINGS_KEY = "hc_admin_settings";
const AUTH_KEY = "hc_admin_authed";

export function loadSettings(): ConnectionSettings {
  if (typeof window === "undefined") return EMPTY_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return EMPTY_SETTINGS;
    return { ...EMPTY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return EMPTY_SETTINGS;
  }
}

export function saveSettings(settings: ConnectionSettings): void {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.sessionStorage.getItem(AUTH_KEY) === "1";
}

export function setAuthed(): void {
  window.sessionStorage.setItem(AUTH_KEY, "1");
}
