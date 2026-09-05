"use client";

import React from "react";
import { Overview } from "./Overview";
import { Brief } from "./Brief";
import { Report } from "./Report";
import { ReportDetail, ReportsList } from "./Reports";
import { NotFound } from "./shared";

/**
 * Fieldwork routes, resolved from the catch-all slug:
 *   /fieldwork                         index
 *   /fieldwork/reports                 past reports
 *   /fieldwork/reports/<reportId>      one report, read-only
 *   /fieldwork/<assignmentId>          brief + accept
 *   /fieldwork/<assignmentId>/report   the report form
 */
export function FieldworkRoom({ slug }: { slug: string[] }) {
  const [first, second, third] = slug;
  if (!first) return <Overview />;
  if (first === "reports") {
    if (third) return <NotFound what="report" />;
    return second ? <ReportDetail id={second} /> : <ReportsList />;
  }
  if (!second) return <Brief id={first} />;
  if (second === "report" && !third) return <Report id={first} />;
  return <NotFound />;
}
