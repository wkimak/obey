"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Archive,
  TrendingUp,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Daily Discipline Report",
    href: "/report",
    icon: ClipboardCheck,
  },
  {
    title: "Archives",
    href: "/archives",
    icon: Archive,
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
            <TrendingUp className="size-5 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Obey
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        {/* Strategy Reference - Highlighted Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/strategy"}
                  className="h-12 bg-primary/10 hover:bg-primary/15 border border-primary/20"
                >
                  <Link href="/strategy">
                    <BookOpen className="size-5 text-primary" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Strategy Reference</span>
                      <span className="text-[10px] text-muted-foreground">Your trading rules</span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    className="h-10"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Track your trading discipline
          </p>
          <UserButton />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
