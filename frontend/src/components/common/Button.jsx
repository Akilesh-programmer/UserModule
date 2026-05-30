import { cn } from "../../lib/cn";

const variants = {
  primary: "bg-primary text-white hover:bg-primary-dark focus:ring-primary",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400",
  danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
  ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-1.5 text-sm",
  lg: "px-5 py-2 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  ...props
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
}
