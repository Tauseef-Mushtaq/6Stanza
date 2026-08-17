import type { Metadata } from "next";
import { StartProjectPageContent } from "@/features/start-project/sections/StartProjectPageContent";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Tell 6STANZA what you're building — start a real project conversation.",
};

export default function StartProjectPage() {
  return <StartProjectPageContent />;
}
