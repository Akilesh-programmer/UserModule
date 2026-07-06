import { useState, useMemo, useCallback } from "react";
import {
  MdSearch, MdFileDownload, MdFilterList,
} from "react-icons/md";
import { cn } from "../../lib/cn";
import Spinner from "./Spinner";
import FilterPanel from "./FilterPanel";
import SortIcon from "./SortIcon";
import { PaginationBtn, getPageNumbers } from "./Pagination";
import * as XLSX from "xlsx";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/* ─── Main DataTable ────────────────────────────────────────── */
export default function DataTable({
  loading,
  data = [],
  columns,
  emptyMessage = "No records found.",
  exportFileName = "export",
  searchable = true,
}) {
  const [search, setSearch]           = useState("");
  const [colFilters, setColFilters]   = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(10);
  const [sortCol, setSortCol]         = useState(null);
  const [sortDir, setSortDir]         = useState("asc");

  const activeFilterCount = Object.values(colFilters).filter(Boolean).length;

  /* ── filter by global search ── */
  const globalFiltered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.key === "actions" || col.key === "#" || col.key === "photo") return false;
        const val = col.searchValue ? col.searchValue(row) : "";
        return val != null && String(val).toLowerCase().includes(q);
      }),
    );
  }, [data, search, columns]);

  /* ── filter by column filters ── */
  const colFiltered = useMemo(() => {
    const active = Object.entries(colFilters).filter(([, v]) => v.trim());
    if (!active.length) return globalFiltered;
    return globalFiltered.filter((row) =>
      active.every(([key, val]) => {
        const col = columns.find((c) => c.key === key);
        if (!col || !col.searchValue) return true;
        return String(col.searchValue(row) ?? "").toLowerCase().includes(val.toLowerCase());
      }),
    );
  }, [globalFiltered, colFilters, columns]);

  /* ── sort ── */
  const sorted = useMemo(() => {
    if (!sortCol) return colFiltered;
    const col = columns.find((c) => c.key === sortCol);
    if (!col) return colFiltered;
    return [...colFiltered].sort((a, b) => {
      const av = col.sortValue ? col.sortValue(a) : col.searchValue ? col.searchValue(a) : "";
      const bv = col.sortValue ? col.sortValue(b) : col.searchValue ? col.searchValue(b) : "";
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [colFiltered, sortCol, sortDir, columns]);

  /* ── paginate ── */
  const total     = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const curPage   = Math.min(page, pageCount);
  const startIdx  = (curPage - 1) * pageSize;
  const paginated = sorted.slice(startIdx, startIdx + pageSize);

  const handleSort = useCallback((key) => {
    setSortCol((prev) => {
      if (prev === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else { setSortDir("asc"); }
      return key;
    });
    setPage(1);
  }, []);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };

  const handleColFilter = (key, val) => {
    setColFilters((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const clearColFilters = () => { setColFilters({}); setPage(1); };

  const handleExport = () => {
    const exportCols = columns.filter((c) => c.key !== "actions" && c.key !== "photo");
    const rows = sorted.map((row) =>
      Object.fromEntries(
        exportCols.map((col) => [
          col.header,
          col.exportValue
            ? col.exportValue(row)
            : col.searchValue
            ? col.searchValue(row)
            : col.key === "#" ? "" : String(col.render?.(row) ?? ""),
        ]),
      ),
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const isSortable = (col) =>
    col.sortable !== false && col.key !== "actions" && col.key !== "#" && col.key !== "photo";

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* ── Toolbar ── */}
      {searchable && (
        <div className="flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          {/* Global search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search records..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Column filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                showFilters || activeFilterCount > 0
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
              )}
              title="Column filters"
            >
              <MdFilterList size={16} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Rows per page */}
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg pl-3 pr-8 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s} rows</option>
              ))}
            </select>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={sorted.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Export to Excel"
            >
              <MdFileDownload size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Column Filters Panel ── */}
      {showFilters && (
        <div className="flex-shrink-0">
          <FilterPanel
            columns={columns}
            colFilters={colFilters}
            onChange={handleColFilter}
            onClear={clearColFilters}
          />
        </div>
      )}

      {/* ── Table Card ── */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-gray-100 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <Spinner />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
              <MdSearch size={24} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      onClick={isSortable(col) ? () => handleSort(col.key) : undefined}
                      className={cn(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 whitespace-nowrap",
                        col.headerClassName,
                        isSortable(col) ? "cursor-pointer hover:text-gray-700 hover:bg-gray-100/50 transition-colors select-none" : "",
                      )}
                    >
                      <div className="flex items-center">
                        {col.header}
                        {isSortable(col) && (
                          <SortIcon colKey={col.key} sortCol={sortCol} sortDir={sortDir} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-12 text-center text-sm text-gray-400"
                    >
                      No matching records found
                    </td>
                  </tr>
                ) : (
                  paginated.map((row, index) => (
                    <tr key={row._id || index} className="data-table-row">
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={cn("px-4 py-3", col.cellClassName)}
                        >
                          {col.render(row, startIdx + index)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 flex-wrap gap-2 flex-shrink-0">
          <span>
            Showing{" "}
            <span className="font-medium text-gray-700">{startIdx + 1}</span>–
            <span className="font-medium text-gray-700">{Math.min(startIdx + pageSize, total)}</span>
            {" "}of{" "}
            <span className="font-medium text-gray-700">{total}</span> records
            {activeFilterCount > 0 && (
              <button
                onClick={() => { clearColFilters(); setSearch(""); }}
                className="ml-2 text-xs text-primary hover:underline"
              >
                (clear filters)
              </button>
            )}
          </span>
          <div className="flex items-center gap-1">
            <PaginationBtn onClick={() => setPage(1)} disabled={curPage === 1} label="«" />
            <PaginationBtn onClick={() => setPage((p) => p - 1)} disabled={curPage === 1} label="‹" />
            {getPageNumbers(curPage, pageCount).map((p, i) =>
              p === "..." ? (
                <span key={`e-${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <PaginationBtn
                  key={p}
                  onClick={() => setPage(p)}
                  active={p === curPage}
                  label={p}
                />
              ),
            )}
            <PaginationBtn onClick={() => setPage((p) => p + 1)} disabled={curPage === pageCount} label="›" />
            <PaginationBtn onClick={() => setPage(pageCount)} disabled={curPage === pageCount} label="»" />
          </div>
        </div>
      )}
    </div>
  );
}
