import { cn } from "../../lib/cn";

export default function InputField({
  label,
  error,
  required,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-md border bg-white px-2.5 py-1 text-sm text-gray-900 placeholder:text-gray-400",
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
