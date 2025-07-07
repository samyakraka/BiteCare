"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { LayoutDashboard, Users, ShoppingBag, MenuIcon, Settings, LogOut } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Menu Management", href: "/admin/menu", icon: MenuIcon },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-card border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Admin Panel</h1>
        </div>
        <Separator />
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <div className="p-4 mt-auto">
          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/">
              <LogOut className="h-4 w-4 mr-2" />
              Back to Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Back to Site</Link>
          </Button>
        </div>
        <nav className="p-2 overflow-x-auto flex">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center p-2 min-w-[80px] text-center text-sm"
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 md:p-8 p-4 md:pt-8 pt-32">{children}</div>
    </div>
  )
}
