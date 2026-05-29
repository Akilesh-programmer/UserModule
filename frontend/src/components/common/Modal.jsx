import { MdClose } from "react-icons/md";
import { cn } from "../../lib/cn";

export default function Modal({ title, onClose, children, wide, extraWide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={cn(
          "relative w-full rounded-2xl bg-white shadow-2xl flex flex-col",
          extraWide ? "max-w-5xl" : wide ? "max-w-3xl" : "max-w-md",
          "max-h-[90vh]",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 flex-shrink-0">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
