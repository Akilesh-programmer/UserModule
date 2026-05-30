export const PERMISSION_MODULES = [
  "userType",
  "userCreation",
  "userPermission",
  "manager",
  "salesRep",
  "state",
  "city",
  "pincode",
  "area",
  "market",
  "dealer",
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

export const MODULE_LABELS: Record<PermissionModule, string> = {
  userType: "User Types",
  userCreation: "User Creation",
  userPermission: "User Permission",
  manager: "Managers",
  salesRep: "Sales Reps",
  state: "States",
  city: "Cities",
  pincode: "Pincodes",
  area: "Areas",
  market: "Markets",
  dealer: "Dealers",
  category: "Categories",
  group: "Groups",
  tax: "Taxes",
  unitOfMeasure: "Units of Measure",
  packingType: "Packing Types",
  item: "Items",
};

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
