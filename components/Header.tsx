"use client"

import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, User } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

const pageNames: { [key: string]: string } = {
  "/": "KPI Dashboard",
  "/dashboard": "Production Dashboard",
  "/reports": "Reports",
  "/servo-monitoring": "Servo Monitoring",
  "/downtime-tracker": "Downtime Tracker",
  "/settings": "Settings",
  "/login": "Login"
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const router = useRouter()
  const { logout, checkAccess } = useAuth()

  // Hide header on login page
  if (pathname === "/login") return null

  // Check if the current page is accessible
  const pageName = pageNames[pathname]
  const isKpiDashboard = pathname === "/"
  const hasKpiAccess = checkAccess("kpiDashboard")

  // If on KPI dashboard but no access, don't show header
  if (isKpiDashboard && !hasKpiAccess) return null

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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <h1 className="text-xl font-semibold">{pageName}</h1>
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
