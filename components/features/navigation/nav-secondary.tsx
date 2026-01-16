"use client"

import Link from "next/link"
import * as React from "react"
import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/_internal/ui/sidebar"

export const NavSecondary = React.memo(function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                size="sm"
                tooltip={item.title}
              >
                {item.url === "#" || item.url.startsWith("http") ? (
                  <a href={item.url} aria-label={item.title}>
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <Link href={item.url} aria-label={item.title}>
                    <item.icon aria-hidden="true" />
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
})

NavSecondary.displayName = "NavSecondary"
