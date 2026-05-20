import { cn } from "../../lib/cn";
import Spinner from "./Spinner";

export default function DataTable({
  loading,
  data,
  columns,
  emptyMessage = "No records found.",
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
      {loading ? (
        <Spinner />
      ) : data.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500",
                      col.headerClassName,
                    )}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, index) => (
                <tr
                  key={row._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-5 py-3.5", col.cellClassName)}
                    >
                      {col.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
