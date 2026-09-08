import { redirect } from "next/navigation";

/** The V1 Desk moved to /v1/desk; the front door is Today. */
export default function DeskRedirect() {
  redirect("/today");
}
