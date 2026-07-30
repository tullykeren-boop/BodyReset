"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, MessageCircle, Users } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/coach", label: "Coach", icon: MessageCircle },
  { href: "/team", label: "Team", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center justify-around border-t border-mist bg-white/90 py-2 backdrop-blur">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 px-3 py-1">
            <tab.icon size={19} className={active ? "text-moss" : "text-[#A6AFA1]"} />
            <span className={`text-[10px] ${active ? "font-medium text-moss" : "text-[#A6AFA1]"}`}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
