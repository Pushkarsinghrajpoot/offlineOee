"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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
  
  const isLoginPage = pathname === "/login"
  
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!user && !isLoginPage) {
      window.location.href = '/login'
      return
    }

    if (user && !isLoginPage) {
      if (pathname === "/") {
        const hasKpiAccess = checkAccess("kpiDashboard")
        if (!hasKpiAccess) {
          const redirectPath = getFirstAccessiblePage(checkAccess)
          window.location.href = redirectPath
          return
        }
      }

      const menuItems = [
        { path: "/", feature: "kpiDashboard" },
        { path: "/dashboard", feature: "productionDashboard" },
        { path: "/servo-monitoring", feature: "servoMonitoring" },
        { path: "/downtime-tracker", feature: "downtimeTracker" },
        { path: "/reports", feature: "reports" },
      ]

      const currentPage = menuItems.find(item => item.path === pathname)
      
      if (currentPage && !checkAccess(currentPage.feature)) {
        const redirectPath = getFirstAccessiblePage(checkAccess)
        window.location.href = redirectPath
      }
    }
  }, [user, pathname, router, checkAccess, isLoginPage, mounted])

  if (!mounted) return null

  return (
    <div className="flex flex-col h-screen">
      {!isLoginPage && <Header />}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
