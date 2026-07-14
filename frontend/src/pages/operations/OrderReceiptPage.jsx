import { useState, useEffect } from "react";
import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchOrders, createOrder, updateOrder, deleteOrder } from "../../api/orderApi";
import { fetchActiveDealers } from "../../api/dealerApi";
import { fetchSchemes } from "../../api/schemeApi";
import { MdAdd } from "react-icons/md";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import OrderReceiptForm from "../../components/forms/OrderReceiptForm";

export default function OrderReceiptPage() {
  const {
    items,
    loading,
    modalOpen,
    editTarget,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleDelete,
  } = useCrudPage({
    fetchFn: fetchOrders,
    createFn: createOrder,
    updateFn: updateOrder,
    deleteFn: deleteOrder,
    entityName: "Order",
  });

  const [dealers, setDealers] = useState([]);
  const [schemes, setSchemes] = useState([]);

  useEffect(() => {
    fetchActiveDealers().then((r) => setDealers(r.data || [])).catch(() => {});
    fetchSchemes().then((r) => setSchemes(r.data || [])).catch(() => {});
  }, []);

  const getDealerName = (dealerId) => {
    const d = dealers.find((dl) => dl._id === dealerId);
    return d ? d.dealerName : "—";
  };

  const getSchemeName = (schemeId) => {
    if (!schemeId) return "—";
    const s = schemes.find((sc) => sc._id === schemeId);
    return s ? s.schemeName : "—";
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
      key: "scheme",
      header: "Scheme",
      cellClassName: "text-xs text-gray-500 hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      render: (r) => getSchemeName(r.schemeId),
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
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
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
        <ActionButtons
          onEdit={r.status === "pending" ? () => openEdit(r) : undefined}
          onDelete={r.status === "pending" ? () => setDeleteTarget(r) : undefined}
        />
      ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Order Receipts"
        subtitle="Manage and place dealer orders"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Place Order
          </Button>
        }
      />
      <DataTable
        loading={loading}
        data={items}
        columns={columns}
        emptyMessage="No orders found."
        exportFileName="order_receipts"
      />
      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Order" : "Place New Order"}
          onClose={closeModal}
          extraWide
        >
          <OrderReceiptForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete order "${deleteTarget.orderNumber}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
