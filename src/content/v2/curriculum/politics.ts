import type { Concept, Lesson } from "@/lib/v2/content-types";
import { scaffoldDomain } from "./_helpers";

// Authored in src/content/v2/curriculum/politics.ts — concepts follow src/content/v2/skeleton.ts exactly.
const concepts: Concept[] = [];
const lessons: Lesson[] = [];

export const POLITICS = scaffoldDomain("politics", { concepts, lessons });
