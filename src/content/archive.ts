import type { ArchiveEntry, ArchiveConnection } from "@/lib/domain/types";
import { ARCHIVE_A } from "./archive-a";
import { ARCHIVE_B, ARCHIVE_PATHS } from "./archive-b";
import { ARCHIVE_CONNECTIONS_SEED } from "./archive-connections";
export const ARCHIVE_ENTRIES: ArchiveEntry[] = [...ARCHIVE_A, ...ARCHIVE_B, ...ARCHIVE_PATHS];
export const ARCHIVE_CONNECTIONS: ArchiveConnection[] = ARCHIVE_CONNECTIONS_SEED;
export function archiveEntry(id: string): ArchiveEntry | undefined {
  return ARCHIVE_ENTRIES.find((e) => e.id === id);
}
