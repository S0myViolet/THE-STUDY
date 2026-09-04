import type { Appearance } from "@/lib/domain/types";

export function applyAppearance(appearance: Appearance) {
  if (typeof window === "undefined") return;
  localStorage.setItem("the-study:appearance", appearance);
  const dark = appearance === "dark" || (appearance === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
}

export function applyReducedMotion(on: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem("the-study:reduced-motion", on ? "1" : "0");
  if (on) document.documentElement.setAttribute("data-reduced-motion", "true");
  else document.documentElement.removeAttribute("data-reduced-motion");
}

export function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
