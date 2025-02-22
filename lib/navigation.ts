import { AccessRights } from "@/types/auth"

interface MenuItem {
  path: string
  feature: keyof AccessRights
}

const menuItems: MenuItem[] = [
  { path: "/", feature: "kpiDashboard" },
  { path: "/dashboard", feature: "productionDashboard" },
  { path: "/servo-monitoring", feature: "servoMonitoring" },
  { path: "/downtime-tracker", feature: "downtimeTracker" },
  { path: "/reports", feature: "reports" },
]

export function getFirstAccessiblePage(checkAccess: (feature: keyof AccessRights) => boolean | string): string {
  const accessibleItem = menuItems.find(item => checkAccess(item.feature))
  return accessibleItem?.path || "/login"
}
