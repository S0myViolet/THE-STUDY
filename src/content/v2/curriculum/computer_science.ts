import type { Concept, Lesson } from "@/lib/v2/content-types";
import { scaffoldDomain } from "./_helpers";

// Authored in src/content/v2/curriculum/computer_science.ts — concepts follow src/content/v2/skeleton.ts exactly.
const concepts: Concept[] = [];
const lessons: Lesson[] = [];

export const COMPUTER_SCIENCE = scaffoldDomain("computer_science", { concepts, lessons });
