import { cn } from "../../lib/cn";

const FORMS = [
  { key: "userType", label: "User Type" },
  { key: "userCreation", label: "User Creation" },
  { key: "userPermission", label: "User Permission" },
  { key: "manager", label: "Manager" },
  { key: "salesRep", label: "Sales Rep" },
  { key: "category", label: "Categories" },
  { key: "group", label: "Groups" },
  { key: "tax", label: "Taxes" },
  { key: "unitOfMeasure", label: "Units of Measure" },
  { key: "packingType", label: "Packing Types" },
  { key: "item", label: "Items" },
];

const ACTIONS = ["create", "read", "update", "delete"];

export default function PermissionMatrix({ permissions, onToggle }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-40 px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
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
          {FORMS.map(({ key, label }) => (
            <tr key={key} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-sm font-medium text-gray-700">
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
        </tbody>
      </table>
    </div>
  );
}
