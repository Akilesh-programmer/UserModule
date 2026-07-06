export default function FormSection({ title, children }) {
  return (
    <div className="form-section">
      {title && (
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-indigo-100/60">
          <div className="w-1 h-3.5 rounded-full bg-gradient-to-b from-primary to-primary-dark" />
          <h4 className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
            {title}
          </h4>
        </div>
      )}
      {children}
    </div>
  );
}