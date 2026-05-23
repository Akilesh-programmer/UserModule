export default function FormSection({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {title}
      </p>
      {children}
    </div>
  );
}