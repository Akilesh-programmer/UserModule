export const PERMISSION_MODULES = [
  "userType",
  "userCreation",
  "userPermission",
  "manager",
  "salesRep",
  "country",
  "state",
  "city",
  "pincode",
  "area",
  "market",
  "dealer",
  "expenseType",
  "company",
  "shopType",
  "category",
  "group",
  "tax",
  "unitOfMeasure",
  "packingType",
  "item",
  "scheme",
  "schemePdf",
  "applicationPdf",
  "stockEntry",
  "order",
  "secondarySale",
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
  country: "Countries",
  state: "States",
  city: "Cities",
  pincode: "Pincodes",
  area: "Areas",
  market: "Markets",
  dealer: "Dealers",
  expenseType: "Expense Types",
  company: "Companies",
  shopType: "Shop Types",
  category: "Categories",
  group: "Groups",
  tax: "Taxes",
  unitOfMeasure: "Units of Measure",
  packingType: "Packing Types",
  item: "Items",
  scheme: "Schemes",
  schemePdf: "Scheme PDFs",
  applicationPdf: "Application PDFs",
  stockEntry: "Stock Entries",
  order: "Orders",
  secondarySale: "Secondary Sales",
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
