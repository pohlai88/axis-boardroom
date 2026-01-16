"use client"

import { usePathname } from "next/navigation"
import * as React from "react"
import { Command } from "lucide-react"

import { NavFavorites } from "./nav-favorites"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { NavWorkspaces } from "./nav-workspaces"
import { TeamSwitcher } from "./team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/_internal/ui/sidebar"
import { getNavigationConfig, isRouteActive } from "@/lib/config/navigation"

// User data - in production, this would come from auth context or API
const defaultUser = {
  name: "AXIS User",
  email: "user@axis.com",
  avatar: "/avatars/default.jpg",
}

// Team/Workspace data - can be extended later
const teams = [
  {
    name: "AXIS BoardRoom",
    logo: Command,
    plan: "Enterprise",
  },
]

// Favorites - can be populated from user preferences
const favorites = [
  {
    name: "Dashboard Overview",
    url: "/dashboard",
    emoji: "📊",
  },
  {
    name: "My Tasks",
    url: "/tasks",
    emoji: "✅",
  },
]

// Workspaces - can be extended with actual workspace data
const workspaces = [
  {
    name: "Main Workspace",
    emoji: "🏢",
    url: "/dashboard",
    pages: [
      {
        name: "Dashboard",
        url: "/dashboard",
        emoji: "📊",
      },
      {
        name: "Tasks",
        url: "/tasks",
        emoji: "✅",
      },
    ],
  },
]

export const AppSidebar = React.memo(function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  // Memoize navigation config to prevent recalculation on every render
  const navigationConfig = React.useMemo(
    () => getNavigationConfig(pathname),
    [pathname]
  )

  // Add active states to navigation items
  const navMainWithActive = React.useMemo(
    () =>
      navigationConfig.navMain.map((item) => ({
        ...item,
        isActive: isRouteActive(pathname, item.url),
      })),
    [navigationConfig.navMain, pathname]
  )

  return (
    <Sidebar
      className="top-[--header-height] !h-[calc(100svh-var(--header-height))] border-r-0"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
        <NavMain items={navMainWithActive} />
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={favorites} />
        <NavWorkspaces workspaces={workspaces} />
        <NavSecondary items={navigationConfig.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={defaultUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
})

AppSidebar.displayName = "AppSidebar"
