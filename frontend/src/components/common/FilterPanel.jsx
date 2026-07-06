import { MdFilterAlt, MdClose } from "react-icons/md";

/**
 * FilterPanel — Per-column text filters for DataTable.
 * Renders a grid of filter inputs for each filterable column.
 */
export default function FilterPanel({ columns, colFilters, onChange, onClear }) {
  const filterableCols = columns.filter(
    (c) => c.key !== "actions" && c.key !== "#" && c.key !== "photo" && c.searchValue,
  );
  if (!filterableCols.length) return null;

  return (
    <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
          <MdFilterAlt size={14} /> Column Filters
        </span>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-danger transition-colors"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filterableCols.map((col) => (
          <div key={col.key} className="flex flex-col gap-0.5">
            <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {col.header}
            </label>
            <input
              type="text"
              value={colFilters[col.key] || ""}
              onChange={(e) => onChange(col.key, e.target.value)}
              placeholder={`Filter ${col.header}...`}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
