"use client";

import {
  BarChart3,
  BookOpen,
  Boxes,
  FlaskConical,
  Gauge,
  MessageSquareText,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { MetricsCard } from "@/components/metrics-card";
import { navigationItems } from "@/data/navigation";
import type { NavigationItem } from "@/lib/types";

const icons = {
  message: MessageSquareText,
  book: BookOpen,
  evaluation: Gauge,
  playground: FlaskConical,
  analytics: BarChart3,
  settings: Settings,
};

function NavigationLink({
  item,
  active,
}: {
  item: NavigationItem;
  active: boolean;
}) {
  const Icon = icons[item.icon];

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-xl border px-3 py-3 transition",
        active
          ? "border-blue-500/60 bg-blue-500/20 text-white"
          : "border-transparent text-slate-200 hover:border-white/10 hover:bg-white/5",
      ].join(" ")}
    >
      <Icon className="h-5 w-5 shrink-0 text-blue-300" />

      <span className="min-w-0">
        <span className="block text-sm font-semibold">{item.label}</span>

        <span className="block truncate text-xs text-slate-400">
          {item.description}
        </span>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-full flex-col bg-[#061a3a] px-4 py-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[320px]">
      <div className="flex items-start gap-3 px-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-500/15">
          <Boxes className="h-7 w-7 text-blue-400" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold leading-tight">
              Engineering
              <br />
              Onboarding Copilot
            </h1>

            <span className="rounded-md bg-white/10 px-2 py-1 text-[11px] text-slate-300">
              v0.4.0
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Grounded AI assistant for engineering knowledge.
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-1">
        {navigationItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return <NavigationLink key={item.href} item={item} active={active} />;
        })}
      </nav>

      <div className="my-6 border-t border-white/10" />

      <section className="px-2">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-300">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]" />
          System status
        </div>

        <p className="mt-3 text-sm font-semibold">Operational</p>
        <p className="mt-1 text-xs text-slate-400">All systems healthy</p>
      </section>

      <div className="mt-5">
        <MetricsCard />
      </div>

      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/3 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-200">
            SD
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold">Seif Dorani</p>
            <p className="truncate text-xs text-slate-400">
              AI Transformation Leader
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
