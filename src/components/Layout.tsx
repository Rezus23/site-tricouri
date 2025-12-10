import Navbar from "./Navbar";
import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="p-1">{children}</main>
      <Analytics />
    </>
  );
}
