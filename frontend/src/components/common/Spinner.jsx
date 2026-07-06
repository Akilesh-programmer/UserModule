export default function Spinner({ size = "md" }) {
  const sizes = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizes[size]} rounded-full border-primary/20 border-t-primary animate-spin`}
      />
    </div>
  );
}
