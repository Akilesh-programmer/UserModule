import { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowDown, MdClose, MdSearch } from "react-icons/md";
import { cn } from "../../lib/cn";

/**
 * SearchSelect — a fully searchable dropdown replacing <select>
 * Props identical to SelectField: label, error, required, options, placeholder, value, onChange, name, disabled
 * options: [{ value, label }]
 * onChange fires a synthetic event-like object: { target: { name, value } }
 */
export default function SearchSelect({
  label,
  error,
  required,
  options = [],
  placeholder = "Select...",
  value = "",
  onChange,
  name,
  disabled = false,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.toLowerCase()),
  );

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleSelect = (opt) => {
    onChange?.({ target: { name, value: opt.value } });
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange?.({ target: { name, value: "" } });
    setQuery("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
    }
    if (e.key === "Enter" && filtered.length === 1) {
      handleSelect(filtered[0]);
    }
  };

  return (
    <div className={cn("flex flex-col gap-0.5", className)} ref={containerRef}>
      {label && (
        <label className="text-xs font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => !disabled && setOpen((p) => !p)}
        className={cn(
          "relative flex items-center w-full min-w-[140px] rounded-md border bg-white px-2.5 py-[7px] text-sm cursor-pointer transition-all duration-150 select-none",
          disabled && "opacity-50 cursor-not-allowed bg-gray-50",
          !disabled && "hover:border-primary/50",
          open
            ? "border-primary ring-2 ring-primary/20"
            : error
            ? "border-red-400 ring-2 ring-red-200"
            : "border-gray-300",
        )}
      >
        <span className={cn("flex-1 truncate min-w-0 text-left", !selected && "text-gray-400")}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
          {selected && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MdClose size={13} />
            </button>
          )}
          <MdKeyboardArrowDown
            size={16}
            className={cn(
              "text-gray-400 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="relative z-50">
          <div className="absolute top-1 left-0 min-w-full w-max max-w-xs search-select-dropdown bg-white border border-gray-200 rounded-lg overflow-hidden z-50">
            {/* Search input */}
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50">
              <MdSearch size={15} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <MdClose size={13} />
                </button>
              )}
            </div>

            {/* Options list */}
            <ul
              role="listbox"
              className="max-h-48 overflow-y-auto modal-scroll py-1"
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-2.5 text-sm text-gray-400 text-center">
                  No options found
                </li>
              ) : (
                filtered.map((opt) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={String(opt.value) === String(value)}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "px-3 py-2 text-sm cursor-pointer transition-colors duration-100",
                      String(opt.value) === String(value)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-50",
                    )}
                  >
                    {opt.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
