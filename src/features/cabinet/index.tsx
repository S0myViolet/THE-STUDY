"use client";

import React from "react";
import { CabinetIndex } from "./Cabinet";
import { CuriosityPage } from "./Curiosity";

/**
 * The Cabinet of Curiosities.
 *   /cabinet             the cabinet: today's curiosity, drawers by domain
 *   /cabinet?random=1    opens a random unseen curiosity
 *   /cabinet/<id>        one curiosity (also opened by the daily session with ?session=&item=)
 */
export function CabinetRoom({ slug }: { slug: string[] }) {
  if (slug[0]) return <CuriosityPage id={slug[0]} />;
  return <CabinetIndex />;
}
