"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudy, useStudyQuery } from "@/lib/persistence/provider";
import { Empty, PageHeader, Spinner } from "@/components/ui/primitives";
import { I } from "@/components/ui/icons";
import type { FacultyId } from "@/lib/domain/faculties";
import { facultyViews, isFacultyId } from "@/lib/profile/derive";
import { Constellation } from "./Constellation";
import { FacultyPanel } from "./FacultyPanel";
import { FacultyTable } from "./FacultyTable";
import { FacultyDetail } from "./FacultyDetail";
import { EvidenceSection } from "./Evidence";
import { Methodology } from "./Methodology";
import { ProfileNav } from "./ProfileNav";

/**
 * The Profile room. Routes by slug:
 *   /profile               capability map (constellation + table)
 *   /profile/evidence      EVIDENCE: analytics over 30D / 90D / 1Y / ALL
 *   /profile/methodology   how the estimates are made, and why there is no score
 *   /profile/<facultyId>   one faculty in depth
 */
export function ProfileRoom({ slug }: { slug: string[] }) {
  const head = slug[0];
  if (head === "evidence") return <EvidenceSection />;
  if (head === "methodology") return <Methodology />;
  if (head && isFacultyId(head)) return <FacultyDetail faculty={head} />;
  if (head) {
    return (
      <div className="page">
        <Empty title="No such faculty in the Profile." action={<Link href="/v1/profile" className="btn btn-secondary">Back to the map</Link>} />
      </div>
    );
  }
  return <CapabilityMap />;
}

function CapabilityMap() {
  const { db } = useStudy();
  const router = useRouter();
  const params = useSearchParams();
  const estimates = useStudyQuery((db) => db.store("skill_estimates").list(), ["skill_estimates"]);
  const [selected, setSelected] = useState<FacultyId | null>(null);

  // QA-only seeding path. Never linked from the interface; see lib/profile/qa-seed.ts.
  useEffect(() => {
    if (params.get("qa-seed") !== "1") return;
    let alive = true;
    import("@/lib/profile/qa-seed").then(async ({ seedProfileQA }) => {
      await seedProfileQA(db);
      if (alive) router.replace("/v1/profile");
    });
    return () => {
      alive = false;
    };
  }, [params, db, router]);

  const views = useMemo(() => facultyViews(estimates.data ?? []), [estimates.data]);
  const total = views.reduce((s, v) => s + v.evidenceCount, 0);
  const tested = views.filter((v) => v.evidenceCount > 0).length;

  // Default to the faculty with the most evidence, so the panel is never blank.
  const defaultId = total ? [...views].sort((a, b) => b.evidenceCount - a.evidenceCount)[0]?.id ?? null : null;
  const active = selected ?? defaultId;
  const current = active ? views.find((v) => v.id === active) : undefined;

  return (
    <div className="page">
      <PageHeader eyebrow="Profile" title="How do I think?" lede="Not a score. A map of twelve faculties, each estimated from the evidence the Study has actually seen, with its own level, trend and confidence." />
      <ProfileNav current="map" />

      {estimates.loading ? (
        <Spinner label="Reading the evidence" />
      ) : total === 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
            <Constellation views={views} selected={active} onSelect={setSelected} />
            {current ? <FacultyPanel view={current} /> : null}
          </div>
          <Empty
            className="mt-6"
            title="The Study has no evidence yet. Begin with a case."
            body="Every exercise leaves evidence behind. The constellation fills in as it accumulates; nothing here is assumed."
            action={
              <Link href="/v1/casebook" className="btn btn-lg">
                Open the Casebook <I.ArrowRight size={14} />
              </Link>
            }
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
            <section aria-label="Constellation" className="min-w-0">
              <Constellation views={views} selected={active} onSelect={setSelected} />
            </section>
            {current ? <FacultyPanel view={current} /> : null}
          </div>

          <section className="mt-14 min-w-0" aria-labelledby="faculties">
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <div id="faculties" className="eyebrow">
                The twelve faculties
              </div>
              <span className="text-[12px] text-ink-3">
                <span className="numeral">{total}</span> pieces of evidence across <span className="numeral">{tested}</span> of 12
              </span>
            </div>
            <FacultyTable views={views} />
          </section>

          <p className="mt-10 text-[12px] text-ink-4 max-w-[60ch]">
            Levels need evidence before they move: three pieces to leave Untested, twenty for Advanced, forty for Exceptional. <Link href="/v1/profile/methodology" className="underline underline-offset-4 hover:text-ink">How the estimates are made.</Link>
          </p>
        </>
      )}
    </div>
  );
}
