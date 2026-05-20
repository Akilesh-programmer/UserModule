import { cn } from "../../lib/cn";

export default function Spinner({ className }) {
  return (
    <div className={cn("flex items-center justify-center py-16", className)}>
      <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-gray-200 border-t-primary" />
    </div>
  );
}
