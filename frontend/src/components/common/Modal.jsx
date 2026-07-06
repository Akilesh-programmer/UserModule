import { useEffect } from "react";
import { MdClose } from "react-icons/md";
import { cn } from "../../lib/cn";

/**
 * Modal — Dialog overlay.
 * Closes ONLY via the X button (or Escape key).
 * Clicking the backdrop does NOT close the modal.
 *
 * The modal fills nearly the full viewport. For extraWide / fullWidth
 * modals the content area is tall enough that 3-column forms fit
 * without any internal scroll.
 *
 * Sizing: wide (max-w-3xl) | extraWide (max-w-6xl) | fullWidth (98vw)
 */
export default function Modal({ title, onClose, children, wide, extraWide, fullWidth }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-3 py-2 lg:pl-[268px] animate-fade-in"
      style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className={cn(
          "relative w-full rounded-2xl bg-white shadow-modal flex flex-col animate-scale-in",
          "max-h-[calc(100vh-1rem)]",
          fullWidth ? "max-w-[98vw]"
            : extraWide ? "max-w-6xl"
            : wide ? "max-w-3xl"
            : "max-w-lg",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — compact */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-all"
            aria-label="Close"
          >
            <MdClose size={16} />
          </button>
        </div>

        {/* Content — fills remaining space */}
        <div className="flex-1 min-h-0 overflow-y-auto modal-scroll px-5 py-3">
          {children}
        </div>
      </div>
    </div>
  );
}
