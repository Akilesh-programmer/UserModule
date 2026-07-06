import { cn } from "../../lib/cn";

export default function TextAreaField({
  label,
  error,
  required,
  wrapperClassName,
  rows = 5,
  maxLength = 200,
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
      <textarea
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "w-full rounded-md border bg-white px-3 py-[7px] text-sm text-gray-900 placeholder:text-gray-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-150",
          "hover:border-gray-400",
          error
            ? "border-red-400 focus:border-red-400 focus:ring-red-200"
            : "border-gray-300 focus:border-primary focus:ring-primary/20",
          props.disabled && "opacity-50 bg-gray-50 cursor-not-allowed",
        )}
        {...props}
      />
      <div className="flex justify-between">
        {error ? (
          <span className="text-xs text-red-500 mt-0.5">{error}</span>
        ) : (
          <span />
        )}
        {maxLength && (
          <span className="text-[10px] text-gray-400 mt-0.5">
            {(props.value || "").length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
