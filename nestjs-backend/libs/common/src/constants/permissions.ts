/**
 * Permission module definitions for the RBAC system.
 * Each module has 4 CRUD actions: create, read, update, delete.
 */

export const PERMISSION_MODULES = [
  "userType",
  "userCreation",
  "userPermission",
  "manager",
  "salesRep",
  "category",
  "group",
  "tax",
  "unitOfMeasure",
  "packingType",
  "item",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const CRUD_ACTIONS = ["create", "read", "update", "delete"] as const;

export type CrudAction = (typeof CRUD_ACTIONS)[number];

export interface CrudPermissions {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export type PermissionMap = Record<PermissionModule, CrudPermissions>;

/** Human-readable labels for permission modules (used in error messages) */
export const MODULE_LABELS: Record<PermissionModule, string> = {
  userType: "User Types",
  userCreation: "User Creation",
  userPermission: "User Permission",
  manager: "Managers",
  salesRep: "Sales Reps",
  category: "Categories",
  group: "Groups",
  tax: "Taxes",
  unitOfMeasure: "Units of Measure",
  packingType: "Packing Types",
  item: "Items",
};

/** Build a permission map with all flags set to false (default for non-admin users) */
export function buildEmptyPermissions(): PermissionMap {
  const permissions = {} as Record<string, CrudPermissions>;
  for (const module of PERMISSION_MODULES) {
    permissions[module] = {
      create: false,
      read: false,
      update: false,
      delete: false,
    };
  }
  return permissions as PermissionMap;
}

/** Build a permission map with all flags set to true (for Admin users) */
export function buildFullPermissions(): PermissionMap {
  const permissions = {} as Record<string, CrudPermissions>;
  for (const module of PERMISSION_MODULES) {
    permissions[module] = {
      create: true,
      read: true,
      update: true,
      delete: true,
    };
  }
  return permissions as PermissionMap;
}
