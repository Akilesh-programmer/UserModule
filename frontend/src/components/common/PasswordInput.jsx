import { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { cn } from "../../lib/cn";

export default function PasswordInput({
  label,
  error,
  required,
  wrapperClassName,
  ...props
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("flex flex-col gap-0.5", wrapperClassName)}>
      {label && (
        <label className="text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-md border bg-white px-2.5 py-1 pr-10 text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors",
            error
              ? "border-red-400 focus:border-red-400 focus:ring-red-200"
              : "border-gray-300 focus:border-primary focus:ring-primary/20",
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          tabIndex={-1}
        >
          {visible ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
        </button>
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
