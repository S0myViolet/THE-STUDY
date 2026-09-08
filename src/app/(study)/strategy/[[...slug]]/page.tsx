import { redirect } from "next/navigation";
import { v1Href } from "@/lib/nav";

/** The V1 room moved into the archive; old links and bookmarks follow it. */
export default async function Page({ params, searchParams }: { params: Promise<{ slug?: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ slug }, search] = await Promise.all([params, searchParams]);
  redirect(v1Href("strategy", slug, search));
}
