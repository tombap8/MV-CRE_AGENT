"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MusicNoteIcon } from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home" },
  { href: "/projects", label: "My Projects" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-hairline">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow text-ink">
            <MusicNoteIcon className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-ink">BeatSync AI</span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/projects" && pathname.startsWith("/projects"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-surface text-ink" : "text-steel hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Avatar initials="U" />
      </div>
    </header>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary">
      {initials}
    </span>
  );
}
