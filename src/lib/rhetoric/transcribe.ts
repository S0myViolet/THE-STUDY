/**
 * Optional transcription hook for Voice practice.
 *
 * Audio never leaves the browser unless a transcription service has been
 * configured server-side. The integration point is a POST to /api/transcribe
 * (not part of this build) that accepts the recording and returns { text }.
 * It is only attempted when NEXT_PUBLIC_TRANSCRIBE_ENABLED === "1".
 */
export function transcriptionEnabled(): boolean {
  return process.env.NEXT_PUBLIC_TRANSCRIBE_ENABLED === "1";
}

export async function transcribe(blob: Blob): Promise<string | null> {
  if (!transcriptionEnabled()) return null;
  try {
    const form = new FormData();
    form.append("audio", blob, "recording.webm");
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    if (!res.ok) return null;
    const json = (await res.json()) as { text?: string };
    return typeof json.text === "string" && json.text.trim() ? json.text.trim() : null;
  } catch {
    return null;
  }
}
