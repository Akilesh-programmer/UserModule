import { cn } from "../../lib/cn";

export default function InputField({
  label,
  error,
  required,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-1", wrapperClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-gray-300 focus:border-primary focus:ring-primary/20",
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
