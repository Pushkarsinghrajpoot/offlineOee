"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { useAuth } from "@/context/auth-context"
import { getFirstAccessiblePage } from "@/lib/navigation"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, checkAccess } = useAuth()
  const [mounted, setMounted] = useState(false)
  
  // Don't show sidebar on login page
  const isLoginPage = pathname === "/login"
  const showSidebar = !isLoginPage && user

  // Handle hydration and mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!user && !isLoginPage) {
      // If not logged in and not on login page, redirect to login
      window.location.href = '/login'
      return
    }

    if (user && !isLoginPage) {
      // Special handling for root path (KPI Dashboard)
      if (pathname === "/") {
        const hasKpiAccess = checkAccess("kpiDashboard")
        if (!hasKpiAccess) {
          const redirectPath = getFirstAccessiblePage(checkAccess)
          window.location.href = redirectPath
          return
        }
      }

      // Get the feature required for the current path
      const menuItems = [
        { path: "/", feature: "kpiDashboard" },
        { path: "/dashboard", feature: "productionDashboard" },
        { path: "/servo-monitoring", feature: "servoMonitoring" },
        { path: "/downtime-tracker", feature: "downtimeTracker" },
        { path: "/reports", feature: "reports" },
      ]

      const currentPage = menuItems.find(item => item.path === pathname)
      
      // If this is a protected page and user doesn't have access
      if (currentPage && !checkAccess(currentPage.feature)) {
        // Redirect to the first page they do have access to
        const redirectPath = getFirstAccessiblePage(checkAccess)
        window.location.href = redirectPath
      }
    }
  }, [user, pathname, router, checkAccess, isLoginPage, mounted])

  // Don't render anything until mounted
  if (!mounted) return null

  return (
    <div className="flex h-screen">
      {showSidebar && <Sidebar key={user?.role} />}
      <div className="flex flex-col flex-1 overflow-hidden">
        {!isLoginPage && <Header />}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
