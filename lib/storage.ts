import { ConnectionSettings, EMPTY_SETTINGS } from "./types";

const SETTINGS_KEY = "hc_admin_settings";
const AUTH_KEY = "hc_admin_authed";
const SIDEBAR_WIDTH_KEY = "hc_admin_sidebar_width";

export const DEFAULT_SIDEBAR_WIDTH = 170;
export const MIN_SIDEBAR_WIDTH = 140;
export const MAX_SIDEBAR_WIDTH = 400;

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

export function loadSidebarWidth(): number {
  if (typeof window === "undefined") return DEFAULT_SIDEBAR_WIDTH;
  const raw = Number(window.localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (!raw || Number.isNaN(raw)) return DEFAULT_SIDEBAR_WIDTH;
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, raw));
}

export function saveSidebarWidth(width: number): void {
  window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width));
}
