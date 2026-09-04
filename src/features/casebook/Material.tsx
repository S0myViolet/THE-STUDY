"use client";

import React, { useMemo } from "react";
import type { NoticeMaterial } from "@/lib/domain/types";
import { buildScene, SceneSvg } from "@/lib/scene";
import { cx } from "@/lib/util/format";

/**
 * Renders the material the user must notice: a document, a message thread,
 * a table, a schedule, a room layout, plain text, or a procedural scene.
 * Chrome is minimal so the material fills the attention.
 */
export function Material({ material, className }: { material: NoticeMaterial; className?: string }) {
  const scene = useMemo(() => (material.kind === "scene" && material.scene ? buildScene(material.scene.template, material.scene.seed) : null), [material]);

  if (material.kind === "scene" && scene) {
    return (
      <div className={cx("stage", className)}>
        <SceneSvg scene={scene} className="w-full h-auto block" />
      </div>
    );
  }
  if (material.kind === "thread") {
    return (
      <div className={cx("sheet p-4 md:p-6 space-y-3", className)} role="log" aria-label={material.title ?? "Message thread"}>
        {material.title ? <div className="eyebrow mb-2">{material.title}</div> : null}
        {(material.lines ?? []).map((line, i) => {
          const m = line.match(/^([^:]{1,40}):\s*(.*)$/);
          const who = m?.[1];
          const text = m ? m[2] : line;
          const meta = who?.match(/\((.+)\)/)?.[1];
          return (
            <div key={i} className="flex gap-3">
              <div className="w-28 shrink-0 text-right">
                {who ? <div className="text-[12px] text-ink-2 font-medium leading-tight">{who.replace(/\s*\(.+\)/, "")}</div> : null}
                {meta ? <div className="mono text-[10px] text-ink-4">{meta}</div> : null}
              </div>
              <div className="flex-1 text-[14px] text-ink border-l border-line pl-3 leading-relaxed">{text}</div>
            </div>
          );
        })}
      </div>
    );
  }
  if (material.kind === "table" || material.kind === "schedule") {
    return (
      <div className={cx("sheet paper-texture p-4 md:p-6 overflow-x-auto", className)}>
        {material.title ? <div className="eyebrow mb-3">{material.title}</div> : null}
        <table className="table">
          {material.columns ? (
            <thead>
              <tr>
                {material.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
          ) : null}
          <tbody>
            {(material.rows ?? []).map((r, i) => (
              <tr key={i}>
                {r.map((cell, j) => (
                  <td key={j} className={cx(/^\d/.test(cell) ? "numeral" : "")}>{cell}</td>
                ))}
              </tr>
            ))}
            {!material.rows && material.lines
              ? material.lines.map((l, i) => (
                  <tr key={i}>
                    <td>{l}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    );
  }
  if (material.kind === "layout") {
    return (
      <div className={cx("sheet paper-texture p-6", className)}>
        {material.title ? <div className="eyebrow mb-3">{material.title}</div> : null}
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
          {(material.lines ?? []).map((l, i) => (
            <li key={i} className="text-[14px] py-1 border-b border-line">{l}</li>
          ))}
        </ol>
      </div>
    );
  }
  // document / text
  return (
    <div className={cx("sheet paper-texture p-6 md:p-8", className)}>
      {material.title ? <div className="eyebrow mb-4">{material.title}</div> : null}
      <div className={cx("space-y-1.5", material.kind === "document" ? "mono text-[13px]" : "serif text-[17px]")}>
        {(material.lines ?? []).map((l, i) => (
          <p key={i} className={cx("text-ink leading-relaxed", l.trim() === "" && "h-3")}>{l}</p>
        ))}
      </div>
    </div>
  );
}
