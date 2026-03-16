"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Newspaper,
  MessageCircle,
  Mic,
  Users,
  Trophy,
  Tv,
  Award,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useSettings } from "@/components/settings/settings-context";
import { useTutorial } from "@/components/tutorial/tutorial-context";

interface NavbarProps {
  dynastyId: string;
}

const navItems = [
  { label: "Front Page", slug: "", icon: Newspaper },
  { label: "Social", slug: "social", icon: MessageCircle },
  { label: "Press Conference", slug: "press-conference", icon: Mic },
  { label: "Recruiting", slug: "recruiting", icon: Users },
  { label: "Rankings", slug: "rankings", icon: Trophy },
  { label: "Shows", slug: "shows", icon: Tv },
  { label: "Trophy Room", slug: "trophy-room", icon: Award },
] as const;

export default function Navbar({ dynastyId }: NavbarProps) {
  const pathname = usePathname();
  const { toggle } = useSettings();
  const { showTutorial } = useTutorial();

  function isActive(slug: string): boolean {
    const base = `/${dynastyId}`;
    if (slug === "") {
      return pathname === base || pathname === `${base}/`;
    }
    return pathname === `${base}/${slug}` || pathname.startsWith(`${base}/${slug}/`);
  }

  return (
    <nav
      className={cn(
        "w-full bg-paper2 border-t border-b border-dw-border",
        "overflow-x-auto scrollbar-hide"
      )}
    >
      <ul
        className={cn(
          "flex items-center gap-0",
          "md:justify-center md:gap-1",
          "min-w-max md:min-w-0",
          "px-2 md:px-4"
        )}
      >
        {navItems.map(({ label, slug, icon: Icon }) => {
          const active = isActive(slug);
          const href = slug === "" ? `/${dynastyId}` : `/${dynastyId}/${slug}`;

          return (
            <li key={slug}>
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-3 md:px-4 md:py-3",
                  "font-sans text-xs md:text-sm uppercase tracking-wider",
                  "transition-colors duration-200 whitespace-nowrap",
                  "border-b-2",
                  active
                    ? "text-dw-accent border-dw-accent"
                    : "text-ink2 border-transparent hover:text-ink hover:border-ink3"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}

        {/* Help button */}
        <li className="ml-auto">
          <button
            type="button"
            onClick={showTutorial}
            className={cn(
              "flex items-center gap-1.5 px-3 py-3 md:px-4 md:py-3",
              "font-sans text-xs md:text-sm uppercase tracking-wider",
              "transition-colors duration-200 whitespace-nowrap",
              "border-b-2 border-transparent",
              "text-ink2 hover:text-ink hover:border-ink3"
            )}
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
          </button>
        </li>

        {/* Settings gear — always last */}
        <li>
          <button
            type="button"
            onClick={toggle}
            className={cn(
              "flex items-center gap-1.5 px-3 py-3 md:px-4 md:py-3",
              "font-sans text-xs md:text-sm uppercase tracking-wider",
              "transition-colors duration-200 whitespace-nowrap",
              "border-b-2 border-transparent",
              "text-ink2 hover:text-ink hover:border-ink3"
            )}
            aria-label="Settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
