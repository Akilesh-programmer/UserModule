import { cn } from "../../lib/cn";

export default function Badge({ active }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600",
      )}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
