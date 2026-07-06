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

export default function PermissionMatrix({ permissions, onToggle, onSelectAll, onSelectGroup }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-card">
      <table className="min-w-full divide-y divide-gray-100">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-white">
            <th className="w-48 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Module
            </th>
            {ACTIONS.map((action) => (
              <th
                key={action}
                className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                  {/* Select All for action column */}
                  <button
                    type="button"
                    onClick={() => onSelectAll?.(action)}
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                    title={`Select all ${action}`}
                  >
                    All
                  </button>
                </div>
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
              Full Row
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {MODULE_GROUPS.map((group) => (
            <GroupRows
              key={group.label}
              group={group}
              permissions={permissions}
              onToggle={onToggle}
              onSelectGroup={onSelectGroup}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GroupRows({ group, permissions, onToggle, onSelectGroup }) {
  // Check if all actions in this group are selected
  const isGroupAllSelected = group.modules.every((mod) =>
    ACTIONS.every((a) => permissions[mod.key]?.[a] === true)
  );

  return (
    <>
      {/* Group header row */}
      <tr className="bg-gradient-to-r from-primary/5 to-transparent">
        <td colSpan={5} className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-primary/80">
          {group.label}
        </td>
        <td className="px-4 py-2 text-center">
          <button
            type="button"
            onClick={() => onSelectGroup?.(group.modules, !isGroupAllSelected)}
            className={cn(
              "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded transition-colors whitespace-nowrap",
              isGroupAllSelected
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            {isGroupAllSelected ? "Unselect" : "Select"} All
          </button>
        </td>
      </tr>

      {/* Module rows */}
      {group.modules.map(({ key, label }) => {
        const isRowAll = ACTIONS.every((a) => permissions[key]?.[a] === true);
        return (
          <tr key={key} className="hover:bg-blue-50/30 transition-colors">
            <td className="px-5 py-2.5 text-sm font-medium text-gray-700 pl-8">
              {label}
            </td>
            {ACTIONS.map((action) => (
              <td key={action} className="px-4 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={permissions[key]?.[action] === true}
                  onChange={() => onToggle(key, action)}
                  className={cn(
                    "h-4 w-4 cursor-pointer rounded border-gray-300",
                    "accent-indigo-600 focus:ring-indigo-500",
                  )}
                />
              </td>
            ))}
            {/* Row-level Select All */}
            <td className="px-4 py-2.5 text-center">
              <button
                type="button"
                onClick={() => onSelectGroup?.([{ key }], !isRowAll)}
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors",
                  isRowAll
                    ? "bg-success/20 text-success hover:bg-success/30"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {isRowAll ? "✓ All" : "All"}
              </button>
            </td>
          </tr>
        );
      })}
    </>
  );
}
