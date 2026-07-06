import { MdArrowUpward, MdArrowDownward, MdUnfoldMore } from "react-icons/md";

/**
 * SortIcon — Displays the current sort direction indicator for a table column.
 */
export default function SortIcon({ colKey, sortCol, sortDir }) {
  if (sortCol !== colKey) return <MdUnfoldMore size={14} className="opacity-30 ml-1 flex-shrink-0" />;
  return sortDir === "asc"
    ? <MdArrowUpward size={14} className="ml-1 text-primary flex-shrink-0" />
    : <MdArrowDownward size={14} className="ml-1 text-primary flex-shrink-0" />;
}
