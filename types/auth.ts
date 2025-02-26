export type UserRole = 'plant_head' | 'operator' | 'production_manager' | 'engineer' | 'admin';

export interface User {
  username: string;
  password: string;
  role: UserRole;
}

export type AccessLevel = 'none' | 'read' | 'edit' | 'full';

export interface AccessRights {
  kpiDashboard: boolean;
  productionDashboard: boolean;
  downtimeTracker: AccessLevel;
  servoMonitoring: boolean;
  reports: boolean;
  accountSettings: AccessLevel;
  safeDays: boolean;
}

export const roleAccessMap: Record<UserRole, AccessRights> = {
  plant_head: {
    kpiDashboard: true,
    productionDashboard: true,
    downtimeTracker: 'read',
    servoMonitoring: true,
    reports: true,
    accountSettings: 'read',
    safeDays: true
  },
  operator: {
    kpiDashboard: false,
    productionDashboard: true,
    downtimeTracker: 'read',
    servoMonitoring: true,
    reports: false,
    accountSettings: 'none',
    safeDays: true
  },
  production_manager: {
    kpiDashboard: true,
    productionDashboard: true,
    downtimeTracker: 'read',
    servoMonitoring: true,
    reports: true,
    accountSettings: 'none',
    safeDays: true
  },
  engineer: {
    kpiDashboard: false,
    productionDashboard: true,
    downtimeTracker: 'edit',
    servoMonitoring: true,
    reports: true,
    accountSettings: 'none',
    safeDays: true
  },
  admin: {
    kpiDashboard: true,
    productionDashboard: true,
    downtimeTracker: 'edit',
    servoMonitoring: true,
    reports: true,
    accountSettings: 'full',
    safeDays: true
  }
};
