import { StudyGate } from "@/components/shell/StudyGate";
import { AppShell } from "@/components/shell/AppShell";

export default function StudyLayout({ children }: { children: React.ReactNode }) {
  return (
    <StudyGate>
      <AppShell>{children}</AppShell>
    </StudyGate>
  );
}
