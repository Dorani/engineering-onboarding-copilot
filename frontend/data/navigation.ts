import type { NavigationItem } from "@/lib/types";

export const navigationItems: NavigationItem[] = [
  {
    label: "Ask Copilot",
    description: "Get grounded answers",
    href: "/",
    icon: "message",
  },
  {
    label: "Knowledge",
    description: "Manage documentation",
    href: "/knowledge",
    icon: "book",
  },
  {
    label: "Evaluations",
    description: "Quality & performance",
    href: "/evaluations",
    icon: "evaluation",
  },
  {
    label: "Playground",
    description: "Test & experiment",
    href: "/playground",
    icon: "playground",
  },
  {
    label: "Analytics",
    description: "Usage & insights",
    href: "/analytics",
    icon: "analytics",
  },
  {
    label: "Settings",
    description: "System & preferences",
    href: "/settings",
    icon: "settings",
  },
];
