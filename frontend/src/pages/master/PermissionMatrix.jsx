import { cn } from "../../lib/cn";

const MODULE_GROUPS = [
  {
    label: "Admin",
    modules: [
      { key: "userType", label: "User Types" },
      { key: "userCreation", label: "User Creation" },
      { key: "userPermission", label: "User Permission" },
    ],
  },
  {
    label: "Master — Staff",
    modules: [
      { key: "manager", label: "Managers" },
      { key: "salesRep", label: "Sales Reps" },
    ],
  },
  {
    label: "Master — Location",
    modules: [
      { key: "country", label: "Countries" },
      { key: "state", label: "States" },
      { key: "city", label: "Cities" },
      { key: "pincode", label: "Pincodes" },
      { key: "area", label: "Areas" },
      { key: "market", label: "Markets" },
      { key: "dealer", label: "Dealers" },
    ],
  },
  {
    label: "Master — General",
    modules: [
      { key: "expenseType", label: "Expense Types" },
      { key: "company", label: "Companies" },
      { key: "shopType", label: "Shop Types" },
    ],
  },
  {
    label: "Item Category",
    modules: [
      { key: "category", label: "Categories" },
      { key: "group", label: "Groups" },
      { key: "tax", label: "Taxes" },
      { key: "unitOfMeasure", label: "Units of Measure" },
      { key: "packingType", label: "Packing Types" },
      { key: "item", label: "Items" },
    ],
  },
];

const ACTIONS = ["create", "read", "update", "delete"];

export default function PermissionMatrix({ permissions, onToggle }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-48 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Module
            </th>
            {ACTIONS.map((action) => (
              <th
                key={action}
                className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {MODULE_GROUPS.map((group) => (
            <GroupRows
              key={group.label}
              group={group}
              permissions={permissions}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({ group, permissions, onToggle }) {
  return (
    <>
      {/* Group header row */}
      <tr className="bg-gray-50/70">
        <td
          colSpan={5}
          className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary/80"
        >
          {group.label}
        </td>
      </tr>
      {/* Module rows */}
      {group.modules.map(({ key, label }) => (
        <tr key={key} className="hover:bg-gray-50 transition-colors">
          <td className="px-5 py-3 text-sm font-medium text-gray-700 pl-8">
            {label}
          </td>
          {ACTIONS.map((action) => (
            <td key={action} className="px-5 py-3 text-center">
              <input
                type="checkbox"
                checked={permissions[key]?.[action] === true}
                onChange={() => onToggle(key, action)}
                className={cn(
                  "h-4 w-4 cursor-pointer rounded border-gray-300",
                  "text-primary focus:ring-primary",
                )}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
