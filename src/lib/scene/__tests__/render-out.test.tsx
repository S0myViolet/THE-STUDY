import { it } from "vitest";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { buildScene, listTemplates, SceneSvg } from "@/lib/scene";
const OUT = process.env.SCENE_OUT ?? "/tmp";
it("write svgs", () => {
  const seeds = (process.env.SCENE_SEEDS ?? "4021").split(",").map(Number);
  for (const t of listTemplates()) for (const seed of seeds) {
    const scene = buildScene(t.id, seed);
    fs.writeFileSync(`${OUT}/scene-${t.id}-${seed}.svg`, renderToStaticMarkup(<SceneSvg scene={scene} />));
  }
});
