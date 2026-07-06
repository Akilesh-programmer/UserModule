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
        <label className="text-xs font-semibold text-gray-600 tracking-wide">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-md border bg-white px-3 py-[7px] text-sm text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-150",
          "hover:border-gray-400",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-gray-300 focus:border-primary focus:ring-primary/20",
          props.disabled && "opacity-50 bg-gray-50 cursor-not-allowed",
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
    </div>
  );
}
