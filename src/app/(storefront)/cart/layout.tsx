import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سلة المشتريات | سحبة فيب",
  robots: { index: false, follow: true },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
