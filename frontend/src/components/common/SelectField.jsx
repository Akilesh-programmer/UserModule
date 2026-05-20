import { cn } from "../../lib/cn";

export default function SelectField({
  label,
  error,
  options = [],
  placeholder = "Select...",
  ...props
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-gray-300 focus:border-primary focus:ring-primary/20",
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
