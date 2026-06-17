import Navbar from "./Navbar";
import { Analytics } from "@vercel/analytics/react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="p-0">{children}</main>
      <Analytics />
    </>
  );
}
