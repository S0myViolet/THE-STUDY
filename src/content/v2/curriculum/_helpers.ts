import type { Concept, Course, Domain, DomainId, Lesson, Module } from "@/lib/v2/content-types";
import { CURRICULUM_SKELETON } from "../skeleton";

export interface DomainContent {
  domain: Domain;
  courses: Course[];
  modules: Module[];
  concepts: Concept[];
  lessons: Lesson[];
}

/**
 * Builds the domain/course/module records for a domain from the skeleton, so authors only
 * write concepts and lessons (and may override course/module summaries). Module lesson lists
 * are derived from the lessons supplied.
 */
export function scaffoldDomain(
  id: DomainId,
  content: { concepts: Concept[]; lessons: Lesson[]; courseSummaries?: Record<string, string>; moduleSummaries?: Record<string, string> },
): DomainContent {
  const sk = CURRICULUM_SKELETON.find((d) => d.id === id);
  if (!sk) throw new Error(`Unknown domain ${id}`);
  const order = CURRICULUM_SKELETON.findIndex((d) => d.id === id) + 1;
  const domain: Domain = { id: sk.id, title: sk.title, summary: sk.summary, courses: sk.courses.map((c) => c.id), order };
  const courses: Course[] = sk.courses.map((c) => ({ id: c.id, domainId: sk.id, title: c.title, summary: content.courseSummaries?.[c.id] ?? `${c.title} in ${sk.title.toLowerCase()}.`, modules: c.modules.map((m) => m.id), level: c.level }));
  const modules: Module[] = sk.courses.flatMap((c) =>
    c.modules.map((m) => ({
      id: m.id,
      courseId: c.id,
      title: m.title,
      summary: content.moduleSummaries?.[m.id] ?? `${m.title}: ${m.concepts.map((x) => x.title.toLowerCase()).join(", ")}.`,
      concepts: m.concepts.map((x) => x.id),
      lessons: content.lessons.filter((l) => l.moduleId === m.id).map((l) => l.id),
    })),
  );
  return { domain, courses, modules, concepts: content.concepts, lessons: content.lessons };
}
