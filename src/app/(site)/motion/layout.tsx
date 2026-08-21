import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Motion Engine — Internal Demo",
  robots: { index: false, follow: false },
};

export default function MotionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
