import { useState, useEffect, useCallback } from "react";
import { fetchSecondarySales, createSecondarySale, markDelivered, markReturned } from "../../api/secondarySaleApi";
import { fetchActiveDealers } from "../../api/dealerApi";
import { fetchOrders } from "../../api/orderApi";
import { MdAdd, MdCheck, MdAssignmentReturn, MdVisibility } from "react-icons/md";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import SecondarySaleForm from "../../components/forms/SecondarySaleForm";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import InputField from "../../components/common/InputField";
import toast from "react-hot-toast";

export default function SecondarySalePage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState([]);
  const [orders, setOrders] = useState([]);

  // Modal controls
  const [createOpen, setCreateOpen] = useState(false);
  const [deliveryTarget, setDeliveryTarget] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  // Return modal controls
  const [returnTarget, setReturnTarget] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  // View details modal
  const [viewTarget, setViewTarget] = useState(null);

  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchSecondarySales();
      setSales(data || []);
    } catch {
      toast.error("Failed to load secondary sales list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
    fetchActiveDealers().then((r) => setDealers(r.data || [])).catch(() => {});
    fetchOrders().then((r) => setOrders(r.data || [])).catch(() => {});
  }, [loadSales]);

  const handleCreateSave = async (payload) => {
    try {
      await createSecondarySale(payload);
      toast.success("Dispatch confirmed & secondary sale created");
      setCreateOpen(false);
      loadSales();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create secondary sale");
    }
  };

  const handleConfirmDelivery = async () => {
    if (!deliveryTarget) return;
    setDeliveryLoading(true);
    try {
      await markDelivered(deliveryTarget._id);
      toast.success("Secondary sale marked as delivered");
      setDeliveryTarget(null);
      loadSales();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update delivery status");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleConfirmReturn = async (e) => {
    e.preventDefault();
    if (!returnTarget) return;
    setReturnLoading(true);
    try {
      await markReturned(returnTarget._id, returnReason.trim());
      toast.success("Sale returned & stock restored successfully!");
      setReturnTarget(null);
      setReturnReason("");
      loadSales();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process return");
    } finally {
      setReturnLoading(false);
    }
  };

  const getDealerName = (dealerId) => {
    const d = dealers.find((dl) => dl._id === dealerId);
    return d ? d.dealerName : "—";
  };

  const getOrderNumber = (orderId) => {
    const o = orders.find((ord) => ord._id === orderId);
    return o ? o.orderNumber : "—";
  };

  const columns = [
    {
      key: "#",
      header: "#",
      cellClassName: "w-10 text-sm text-gray-500",
      sortable: false,
      render: (_, i) => i + 1,
    },
    {
      key: "saleNumber",
      header: "Dispatch No",
      cellClassName: "text-sm font-semibold text-gray-900 font-mono",
      searchValue: (r) => r.saleNumber,
      render: (r) => r.saleNumber,
    },
    {
      key: "saleDate",
      header: "Dispatch Date",
      cellClassName: "text-sm text-gray-600",
      render: (r) =>
        new Date(r.saleDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "order",
      header: "Order Reference",
      cellClassName: "text-sm text-gray-700 font-mono font-medium",
      searchValue: (r) => getOrderNumber(r.orderId),
      render: (r) => getOrderNumber(r.orderId),
    },
    {
      key: "dealer",
      header: "Dealer",
      cellClassName: "text-sm text-gray-600",
      searchValue: (r) => getDealerName(r.dealerId),
      render: (r) => getDealerName(r.dealerId),
    },
    {
      key: "totalAmount",
      header: "Grand Total",
      cellClassName: "text-sm font-bold text-gray-900 font-mono text-right",
      render: (r) => `₹${(r.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
            r.status === "delivered"
              ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
              : r.status === "returned"
              ? "bg-rose-50 text-rose-700 ring-1 ring-rose-600/20"
              : "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
          }`}
        >
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setViewTarget(r)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            title="View Details"
          >
            <MdVisibility size={14} /> Details
          </button>
          {r.status === "dispatched" && (
            <>
              <button
                onClick={() => setDeliveryTarget(r)}
                className="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-700 shadow-sm hover:bg-green-100 transition-colors"
                title="Mark Delivered"
              >
                <MdCheck size={14} /> Deliver
              </button>
              <button
                onClick={() => setReturnTarget(r)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 shadow-sm hover:bg-rose-100 transition-colors"
                title="Mark Returned"
              >
                <MdAssignmentReturn size={14} /> Return
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Secondary Sales (Dispatches)"
        subtitle="Manage stock dispatches, verify dealer delivery, and track customer returns"
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <MdAdd size={16} /> New Dispatch
          </Button>
        }
      />

      <DataTable
        loading={loading}
        data={sales}
        columns={columns}
        emptyMessage="No dispatch records found."
        exportFileName="secondary_sales"
      />

      {/* New Dispatch Modal */}
      {createOpen && (
        <Modal
          title="New Dispatch (Secondary Sale)"
          onClose={() => setCreateOpen(false)}
          extraWide
        >
          <SecondarySaleForm
            onSave={handleCreateSave}
            onCancel={() => setCreateOpen(false)}
          />
        </Modal>
      )}

      {/* View Detail Modal */}
      {viewTarget && (
        <Modal
          title={`Dispatch Invoice: ${viewTarget.saleNumber}`}
          onClose={() => setViewTarget(null)}
          extraWide
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Dealer</span>
                <span className="text-gray-800 font-bold text-sm">{getDealerName(viewTarget.dealerId)}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Dispatch Date</span>
                <span className="text-gray-800 font-bold text-sm">
                  {new Date(viewTarget.saleDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Order Ref</span>
                <span className="text-gray-800 font-bold text-sm font-mono">{getOrderNumber(viewTarget.orderId)}</span>
              </div>
              <div>
                <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Status</span>
                <span className="text-gray-800 font-bold text-sm uppercase">{viewTarget.status}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Boxes</th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Pieces</th>
                    <th className="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {viewTarget.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2.5 text-xs font-semibold text-gray-900 leading-tight">
                        {item.itemName}
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-gray-600">
                        {item.boxQuantity} bx
                      </td>
                      <td className="px-3 py-2.5 text-center text-xs font-mono text-gray-600">
                        {item.pieceQuantity} pcs
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-bold text-gray-900 font-mono">
                        ₹{item.lineTotal?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewTarget.remarks && (
              <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100 text-xs text-gray-700 italic">
                <strong>Remarks:</strong> "{viewTarget.remarks}"
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-gray-400 text-xs">Generated by SalesForce Operations Module</span>
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-2">Grand Total:</span>
                <span className="text-lg font-extrabold text-gray-900 font-mono">
                  ₹{viewTarget.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 mt-2 border-t border-gray-100">
              <Button type="button" variant="secondary" onClick={() => setViewTarget(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Delivery Modal */}
      {deliveryTarget && (
        <ConfirmDialog
          message={`Are you sure you want to mark dispatch "${deliveryTarget.saleNumber}" as DELIVERED to dealer? This will finalize the order process.`}
          onConfirm={handleConfirmDelivery}
          onCancel={() => setDeliveryTarget(null)}
          loading={deliveryLoading}
        />
      )}

      {/* Confirm Return Modal */}
      {returnTarget && (
        <Modal
          title={`Return Dispatch: ${returnTarget.saleNumber}`}
          onClose={() => {
            setReturnTarget(null);
            setReturnReason("");
          }}
        >
          <form onSubmit={handleConfirmReturn} className="space-y-4">
            <p className="text-sm text-gray-600">
              Warning: Returning this sale will restore the dispatched box and piece quantities back to its source stock entry (<strong>{getOrderNumber(returnTarget.orderId)}</strong>).
            </p>
            <InputField
              label="Reason for Return"
              required
              placeholder="e.g. Dealer rejected delivery, wrong product"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setReturnTarget(null);
                  setReturnReason("");
                }}
                disabled={returnLoading}
              >
                Cancel
              </Button>
              <button
                type="submit"
                disabled={returnLoading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                Confirm Return
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
