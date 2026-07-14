import { useState, useEffect } from "react";
import SearchSelect from "../common/SearchSelect";
import TextAreaField from "../common/TextAreaField";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import { fetchOrders, fetchOrder } from "../../api/orderApi";
import { fetchStocks } from "../../api/stockApi";

export default function SecondarySaleForm({ onSave, onCancel }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [orderDetail, setOrderDetail] = useState(null);
  const [stockEntries, setStockEntries] = useState([]);
  const [selectedStockEntryId, setSelectedStockEntryId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loadingOrder, setLoadingOrder] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load approved orders on mount
    fetchOrders({ status: "approved" })
      .then((r) => setOrders(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedOrderId) {
      setLoadingOrder(true);
      setOrderDetail(null);
      setStockEntries([]);
      setSelectedStockEntryId("");
      
      fetchOrder(selectedOrderId)
        .then((r) => {
          const detail = r.data;
          setOrderDetail(detail);
          setLoadingOrder(false);

          // Find active stock entries for this dealer
          if (detail.dealerId) {
            const dealerId = detail.dealerId._id || detail.dealerId;
            fetchStocks({ dealerId, status: "active" })
              .then((stockRes) => {
                setStockEntries(stockRes.data || []);
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          setLoadingOrder(false);
        });
    } else {
      setOrderDetail(null);
      setStockEntries([]);
      setSelectedStockEntryId("");
    }
  }, [selectedOrderId]);

  const validate = () => {
    const errs = {};
    if (!selectedOrderId) errs.orderId = "Order selection is required";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = {
        orderId: selectedOrderId,
        stockEntryId: selectedStockEntryId || null,
        remarks: remarks.trim(),
      };
      await onSave(payload);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to confirm dispatch" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Controls */}
        <div className="lg:col-span-1 space-y-4">
          <FormSection title="Dispatch Configuration">
            <div className="space-y-3.5">
              <SearchSelect
                label="Select Approved Order"
                required
                name="orderId"
                options={orders.map((o) => ({
                  value: o._id,
                  label: `${o.orderNumber} - ${o.dealerId?.dealerName || "Dealer"} (₹${o.totalAmount?.toLocaleString("en-IN")})`,
                }))}
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setErrors({});
                }}
                error={errors.orderId}
                placeholder="Choose Approved Order"
              />

              <SearchSelect
                label="Stock Entry Source (Optional)"
                name="stockEntryId"
                options={stockEntries.map((s) => ({
                  value: s._id,
                  label: `${s.stockNumber} (${new Date(s.stockDate).toLocaleDateString("en-IN")})`,
                }))}
                value={selectedStockEntryId}
                onChange={(e) => setSelectedStockEntryId(e.target.value)}
                placeholder="Auto-select from active stocks"
                disabled={!selectedOrderId || stockEntries.length === 0}
              />
              {selectedOrderId && stockEntries.length === 0 && (
                <p className="text-[10px] text-amber-600 font-medium">
                  Note: No specific stock entries found. Deduction will pull from any active dealer stock.
                </p>
              )}

              <TextAreaField
                label="Dispatch Notes / Remarks"
                name="remarks"
                placeholder="Enter remarks (optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
              />
            </div>
          </FormSection>
        </div>

        {/* Right Side: Order Details (Annotated Read-only) */}
        <div className="lg:col-span-2">
          {loadingOrder && (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
              <span className="text-xs text-gray-500 font-medium">Fetching order lines...</span>
            </div>
          )}

          {!selectedOrderId && !loadingOrder && (
            <div className="flex flex-col items-center justify-center h-48 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <span className="text-sm text-gray-400 font-medium">Select an approved order to view items for dispatch</span>
            </div>
          )}

          {orderDetail && (
            <FormSection title={`Order Summary: ${orderDetail.orderNumber}`}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <div>
                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Dealer</span>
                    <span className="text-gray-800 font-bold">{orderDetail.dealerId?.dealerName || "Dealer"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Date Placed</span>
                    <span className="text-gray-800 font-bold">
                      {new Date(orderDetail.orderDate).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Total Items</span>
                    <span className="text-gray-800 font-bold">{orderDetail.items?.length || 0} Products</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5 uppercase tracking-wide font-medium">Order Value</span>
                    <span className="text-gray-800 font-bold font-mono text-sm text-primary">
                      ₹{orderDetail.totalAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                        <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Order Boxes</th>
                        <th className="px-3 py-2 text-center text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Order Pieces</th>
                        <th className="px-3 py-2 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider w-28">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {orderDetail.items?.map((item, index) => (
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
              </div>
            </FormSection>
          )}
        </div>
      </div>

      {errors.form && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 mt-4 font-semibold">
          {errors.form}
        </p>
      )}

      <div className="flex justify-between pt-4 mt-6 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={!selectedOrderId}>
          Confirm Dispatch
        </Button>
      </div>
    </form>
  );
}
