import { TopNav } from "@/components/layout/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-canvas">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
