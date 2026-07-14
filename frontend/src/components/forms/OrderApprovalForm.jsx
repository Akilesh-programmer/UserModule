import { useState } from "react";
import Button from "../common/Button";
import InputField from "../common/InputField";
import FormSection from "../common/FormSection";
import { MdCheck, MdClose } from "react-icons/md";

export default function OrderApprovalForm({ orderData, onApprove, onReject, onCancel }) {
  const [rejectReason, setRejectReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setSubmitting(true);
    setError("");
    try {
      await onApprove();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError("Please specify a reason for rejection");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await onReject(rejectReason.trim());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject order");
    } finally {
      setSubmitting(false);
    }
  };

  const isPending = orderData.status === "pending";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Header Summary */}
        <div className="md:col-span-1">
          <FormSection title="Order Details">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Order Number:</span>
                <span className="font-semibold text-gray-900 font-mono">{orderData.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Order Date:</span>
                <span className="font-semibold text-gray-900">
                  {new Date(orderData.orderDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Dealer:</span>
                <span className="font-semibold text-gray-900">{orderData.dealerId?.dealerName || "Dealer"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 font-medium">Status:</span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                    orderData.status === "approved"
                      ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                      : orderData.status === "rejected"
                      ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                      : orderData.status === "dispatched"
                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                      : orderData.status === "delivered"
                      ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
                      : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                  }`}
                >
                  {orderData.status}
                </span>
              </div>
              {orderData.remarks && (
                <div className="pt-2">
                  <span className="text-gray-500 font-medium block mb-1">Remarks:</span>
                  <p className="text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs italic">
                    "{orderData.remarks}"
                  </p>
                </div>
              )}
            </div>
          </FormSection>
        </div>

        {/* Line Items with Stock Checks */}
        <div className="md:col-span-2">
          <FormSection title="Items Verification & Stock Status">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-16">Boxes</th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-16">Pieces</th>
                    <th className="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">Amount</th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Area Stock</th>
                    <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {orderData.items?.map((item, index) => {
                    const stock = item.availableQuantity || { boxes: 0, pieces: 0, totalPieces: 0 };
                    const hasStock = item.stockAvailable;

                    return (
                      <tr key={index} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3 text-xs font-semibold text-gray-900 leading-tight">
                          {item.itemName}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-gray-600 font-mono">
                          {item.boxQuantity}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-gray-600 font-mono">
                          {item.pieceQuantity}
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-gray-900 font-bold font-mono">
                          ₹{item.lineTotal?.toFixed(2)}
                        </td>
                        <td className="px-3 py-3 text-center text-xs font-mono whitespace-nowrap text-gray-600">
                          {stock.boxes} bx, {stock.pieces} pcs
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
                              hasStock
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800 animate-pulse"
                            }`}
                          >
                            {hasStock ? "✅ Stock OK" : "❌ Low Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-2 mt-1">Total Order Value:</span>
              <span className="text-xl font-extrabold text-gray-900 font-mono">
                ₹{orderData.totalAmount?.toFixed(2)}
              </span>
            </div>
          </FormSection>
        </div>
      </div>

      {isPending && (
        <form onSubmit={handleReject} className="border-t border-gray-100 pt-4 space-y-4">
          <InputField
            label="Rejection Reason"
            placeholder="Type reason here (required only if rejecting)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            error={error}
          />
          <div className="flex justify-between items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </Button>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
              >
                <MdClose size={16} /> Reject Order
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-transparent bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <MdCheck size={16} /> Approve Order
              </button>
            </div>
          </div>
        </form>
      )}

      {!isPending && (
        <div className="flex justify-between border-t border-gray-100 pt-4">
          <div>
            {orderData.status === "rejected" && orderData.rejectedReason && (
              <span className="text-xs font-medium text-red-600">Rejection Reason: "{orderData.rejectedReason}"</span>
            )}
          </div>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}
