import { useState, useEffect, useCallback } from "react";
import { fetchOrders, fetchOrder, approveOrder, rejectOrder } from "../../api/orderApi";
import { createSecondarySale } from "../../api/secondarySaleApi";
import { fetchActiveDealers } from "../../api/dealerApi";
import { fetchStocks } from "../../api/stockApi";
import PageHeader from "../../components/common/PageHeader";
import DataTable from "../../components/common/DataTable";
import Modal from "../../components/common/Modal";
import OrderApprovalForm from "../../components/forms/OrderApprovalForm";
import SecondarySaleForm from "../../components/forms/SecondarySaleForm";
import toast from "react-hot-toast";
import { MdCheckCircle, MdCancel, MdLocalShipping, MdVisibility } from "react-icons/md";

const TABS = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "dispatched", label: "Dispatched" },
  { value: "delivered", label: "Delivered" },
];

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [dealers, setDealers] = useState([]);

  // Modal control
  const [verificationTarget, setVerificationTarget] = useState(null);
  const [verifyingOrderData, setVerifyingOrderData] = useState(null);
  const [loadingVerification, setLoadingVerification] = useState(false);

  // Dispatch modal control
  const [dispatchTarget, setDispatchTarget] = useState(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = activeTab === "all" ? {} : { status: activeTab };
      const { data } = await fetchOrders(params);
      setOrders(data || []);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadOrders();
    fetchActiveDealers().then((r) => setDealers(r.data || [])).catch(() => {});
  }, [loadOrders]);

  const handleOpenVerification = async (order) => {
    setVerificationTarget(order);
    setLoadingVerification(true);
    try {
      const { data } = await fetchOrder(order._id);
      setVerifyingOrderData(data);
    } catch {
      toast.error("Failed to load verification details");
      setVerificationTarget(null);
    } finally {
      setLoadingVerification(false);
    }
  };

  const handleApprove = async () => {
    if (!verificationTarget) return;
    try {
      await approveOrder(verificationTarget._id);
      toast.success("Order approved successfully");
      setVerificationTarget(null);
      setVerifyingOrderData(null);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve order");
    }
  };

  const handleReject = async (reason) => {
    if (!verificationTarget) return;
    try {
      await rejectOrder(verificationTarget._id, reason);
      toast.success("Order rejected");
      setVerificationTarget(null);
      setVerifyingOrderData(null);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject order");
    }
  };

  const handleDispatchSave = async (payload) => {
    try {
      await createSecondarySale(payload);
      toast.success("Secondary sale created & dispatch confirmed!");
      setDispatchTarget(null);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to dispatch order");
    }
  };

  const getDealerName = (dealerId) => {
    const d = dealers.find((dl) => dl._id === dealerId);
    return d ? d.dealerName : "—";
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
      key: "orderNumber",
      header: "Order No",
      cellClassName: "text-sm font-semibold text-gray-900 font-mono",
      searchValue: (r) => r.orderNumber,
      render: (r) => r.orderNumber,
    },
    {
      key: "orderDate",
      header: "Order Date",
      cellClassName: "text-sm text-gray-600",
      render: (r) =>
        new Date(r.orderDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "dealer",
      header: "Dealer",
      cellClassName: "text-sm text-gray-700 font-medium",
      searchValue: (r) => getDealerName(r.dealerId),
      render: (r) => getDealerName(r.dealerId),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      cellClassName: "text-sm font-bold text-gray-900 font-mono text-right",
      render: (r) => `₹${(r.totalAmount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (r) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
            r.status === "approved"
              ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
              : r.status === "rejected"
              ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
              : r.status === "dispatched"
              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
              : r.status === "delivered"
              ? "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
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
            onClick={() => handleOpenVerification(r)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            title="Verify & Review Order"
          >
            <MdVisibility size={14} /> Review
          </button>
          {r.status === "approved" && (
            <button
              onClick={() => setDispatchTarget(r)}
              className="inline-flex items-center gap-1 rounded-lg border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
              title="Create Dispatch / Secondary Sale"
            >
              <MdLocalShipping size={14} /> Dispatch
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Order Verification Management"
        subtitle="Verify stocks, manage order workflows, and trigger secondary sales dispatch"
      />

      {/* Tabs Filter Bar */}
      <div className="mb-5 border-b border-gray-200 bg-white p-1 rounded-xl shadow-sm flex flex-wrap gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 ${
              activeTab === tab.value
                ? "bg-primary text-white shadow-button"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        loading={loading}
        data={orders}
        columns={columns}
        emptyMessage="No orders found."
        exportFileName="orders_management"
      />

      {/* Order Verification / Review Modal */}
      {verificationTarget && (
        <Modal
          title={
            loadingVerification
              ? "Reviewing Order..."
              : `Order Review: ${verificationTarget.orderNumber}`
          }
          onClose={() => {
            setVerificationTarget(null);
            setVerifyingOrderData(null);
          }}
          extraWide
        >
          {loadingVerification ? (
            <div className="flex flex-col items-center justify-center h-48">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
              <span className="text-xs text-gray-500 font-medium">Performing real-time stock checks...</span>
            </div>
          ) : verifyingOrderData ? (
            <OrderApprovalForm
              orderData={verifyingOrderData}
              onApprove={handleApprove}
              onReject={handleReject}
              onCancel={() => {
                setVerificationTarget(null);
                setVerifyingOrderData(null);
              }}
            />
          ) : (
            <p className="text-sm text-red-500">Failed to load order data.</p>
          )}
        </Modal>
      )}

      {/* Dispatch Modal */}
      {dispatchTarget && (
        <Modal
          title={`Confirm Dispatch: ${dispatchTarget.orderNumber}`}
          onClose={() => setDispatchTarget(null)}
          extraWide
        >
          <SecondarySaleForm
            onSave={handleDispatchSave}
            onCancel={() => setDispatchTarget(null)}
          />
        </Modal>
      )}
    </div>
  );
}
