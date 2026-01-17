/**
 * Navigation Configuration
 * 
 * Centralized navigation data for the application sidebar.
 * This makes it easy to update navigation items without modifying components.
 */

import {
  LayoutDashboard,
  CheckSquare2,
  Settings2,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface NavigationConfig {
  navMain: NavItem[];
  navSecondary: NavItem[];
}

/**
 * Get navigation items based on current pathname
 * This allows for dynamic navigation based on route
 */
export function getNavigationConfig(pathname: string): NavigationConfig {
  return {
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare2,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart3,
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/settings", // Fixed: actual route instead of "#"
        icon: Settings2,
      },
    ],
  };
}

/**
 * Check if a route is active
 * Handles nested routes properly (e.g., /tasks/123 matches /tasks)
 */
export function isRouteActive(pathname: string, route: string): boolean {
  if (route === "/") {
    return pathname === "/" || pathname === "/dashboard";
  }
  return pathname === route || pathname.startsWith(`${route}/`);
}
