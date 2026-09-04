"use client";
import React from "react";
import type { Scene } from "./types";

export function SceneSvg({ scene, className }: { scene: Scene; className?: string }) {
  return <svg viewBox={`0 0 ${scene.width} ${scene.height}`} className={className} role="img" aria-label={scene.setting} />;
}
