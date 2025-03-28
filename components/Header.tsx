"use client"

import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, User, PieChart, LayoutDashboard, Clock, Activity, FileText, Menu, Shield } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useState } from "react"

const pageNames: { [key: string]: string } = {
  "/": "KPI Dashboard",
  "/dashboard": "Production Dashboard",
  "/reports": "Reports",
  "/servo-monitoring": "Servo Monitoring",
  "/downtime-tracker": "Downtime Tracker",
  "/data-entry": "Data Entry",
  // "/safe-days": "Safe Days",
  "/settings": "Settings",
  "/login": "Login"
}

const menuItems = [
  { name: "Plant Performance", icon: PieChart, path: "/", feature: "kpiDashboard" },
  { name: "Production Dashboard", icon: LayoutDashboard, path: "/dashboard", feature: "productionDashboard" },
  { name: "Downtime Tracker", icon: Clock, path: "/downtime-tracker", feature: "downtimeTracker" },
  { name: "Data Entry", icon: FileText, path: "/data-entry", feature: "dataEntry" },
  { name: "Servo Monitoring", icon: Activity, path: "/servo-monitoring", feature: "servoMonitoring" },
  // { name: "Safe Days", icon: Shield, path: "/safe-days", feature: "safeDays" }, 
  { name: "Reports", icon: FileText, path: "/reports", feature: "reports" },

]

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const { logout, checkAccess } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Hide header on login page
  if (pathname === "/login") return null

  // Check if the current page is accessible
  const pageName = pageNames[pathname]
  const isKpiDashboard = pathname === "/"
  const hasKpiAccess = checkAccess("kpiDashboard")

  // If on KPI dashboard but no access, don't show header
  if (isKpiDashboard && !hasKpiAccess) return null

  const authorizedMenuItems = menuItems.filter(item => checkAccess(item.feature))

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Error logging out')
    }
  }

  const NavItems = () => (
    <nav className="flex items-center space-x-4">
      {authorizedMenuItems.map((item) => (
        <Link 
          key={item.path} 
          href={item.path}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            pathname === item.path
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.name}</span>
        </Link>
      ))}
    </nav>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20(1)%20(1)-Gp2IRlutxcfRET7C0Zeo7LmzdxZcV0.png"
            alt="PixWingAI Logo"
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-bold hidden md:inline-block">PixWingAI</span>
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col space-y-4 py-4">
              {authorizedMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex flex-1 justify-center">
          <nav className="flex items-center space-x-1">
            {authorizedMenuItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
              >
                {/* <item.icon className="h-4 w-4" /> */}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9"
          >
            {theme === 'dark' ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
