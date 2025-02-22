"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, PieChart, Clock, Activity, FileText, ChevronRight, Menu, ChevronLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

interface MenuItem {
  name: string
  icon: any
  path: string
  feature: string
}

const menuItems: MenuItem[] = [
  { name: "KPI Dashboard", icon: PieChart, path: "/", feature: "kpiDashboard" },
  { name: "Production Dashboard", icon: LayoutDashboard, path: "/dashboard", feature: "productionDashboard" },
  { name: "Downtime Tracker", icon: Clock, path: "/downtime-tracker", feature: "downtimeTracker" },
  { name: "Servo Monitoring", icon: Activity, path: "/servo-monitoring", feature: "servoMonitoring" },
  { name: "Reports", icon: FileText, path: "/reports", feature: "reports" },
]

// Get the stored sidebar state or default to true
const getSavedSidebarState = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('sidebarExpanded')
    return saved !== null ? saved === 'true' : true
  }
  return true
}

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const pathname = usePathname()
  const { checkAccess } = useAuth()

  // Initialize sidebar state from localStorage
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      setIsExpanded(getSavedSidebarState())
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('sidebarExpanded', isExpanded.toString())
    }
  }, [isExpanded, isInitialized])

  // Filter menu items based on user permissions
  const authorizedMenuItems = menuItems.filter(item => checkAccess(item.feature))

  // If user has no authorized items, don't render the sidebar
  if (authorizedMenuItems.length === 0) return null

  // Don't render until initialized to prevent flash
  if (!isInitialized) return null

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col transition-all duration-300 ease-in-out border-r bg-background",
          isExpanded ? "w-64" : "w-[70px]"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className={cn("flex items-center gap-2", !isExpanded && "justify-center")}>
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20(1)%20(1)-Gp2IRlutxcfRET7C0Zeo7LmzdxZcV0.png"
                alt="PixWingAI Logo"
                className="h-8 w-8 object-contain"
              />
              {isExpanded && <span className="text-lg font-bold">PixWingAI</span>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn("h-8 w-8", !isExpanded && "mx-auto")}
            >
              {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {authorizedMenuItems.map((item) => (
                <li key={item.path}>
                  <Link href={item.path}>
                    <span
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                        pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted",
                        !isExpanded && "justify-center px-2"
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {isExpanded && <span>{item.name}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-3 left-3 z-40">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 p-4 border-b">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20(1)%20(1)-Gp2IRlutxcfRET7C0Zeo7LmzdxZcV0.png"
                alt="PixWingAI Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold">PixWingAI</span>
            </div>

            <nav className="flex-1 p-2">
              <ul className="space-y-1">
                {authorizedMenuItems.map((item) => (
                  <li key={item.path}>
                    <Link href={item.path} onClick={() => setIsMobileOpen(false)}>
                      <span
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
                          pathname === item.path
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
