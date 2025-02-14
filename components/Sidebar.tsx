"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, PieChart, Clock, Activity, FileText, ChevronRight, Menu } from "lucide-react"

const menuItems = [
  { name: "KPI Dashboard", icon: PieChart, path: "/" },
  { name: "Production Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Downtime Tracker", icon: Clock, path: "/downtime-tracker" },
  { name: "Servo Monitoring", icon: Activity, path: "/servo-monitoring" },
  { name: "Reports", icon: FileText, path: "/reports" },
]

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col transition-all duration-300 ease-in-out ${
          isExpanded ? "w-64" : "w-20"
        } min-h-screen bg-gray-800 text-white p-4`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center gap-2 ${isExpanded ? "" : "justify-center"}`}>
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
            className="text-white hover:bg-gray-700"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link href={item.path}>
                  <span
                    className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 ${
                      pathname === item.path ? "bg-gray-700" : ""
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    {isExpanded && <span>{item.name}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-full bg-gray-800 text-white p-4">
            <div className="flex items-center gap-2 mb-6">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Untitled%20(1)%20(1)-Gp2IRlutxcfRET7C0Zeo7LmzdxZcV0.png"
                alt="PixWingAI Logo"
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-bold">PixWingAI</span>
            </div>
            <nav>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link href={item.path}>
                      <span
                        className={`flex items-center gap-2 p-2 rounded-md hover:bg-gray-700 ${
                          pathname === item.path ? "bg-gray-700" : ""
                        }`}
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

