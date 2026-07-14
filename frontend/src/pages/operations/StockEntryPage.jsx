import { useState, useEffect } from "react";
import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchStocks, createStock, updateStock, deleteStock } from "../../api/stockApi";
import { fetchActiveSalesReps } from "../../api/salesRepApi";
import { fetchActiveDealers } from "../../api/dealerApi";
import { MdAdd } from "react-icons/md";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StockEntryForm from "../../components/forms/StockEntryForm";

export default function StockEntryPage() {
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
    fetchFn: fetchStocks,
    createFn: createStock,
    updateFn: updateStock,
    deleteFn: deleteStock,
    entityName: "Stock Entry",
  });

  const [salesReps, setSalesReps] = useState([]);
  const [dealers, setDealers] = useState([]);

  useEffect(() => {
    fetchActiveSalesReps().then((r) => setSalesReps(r.data || [])).catch(() => {});
    fetchActiveDealers().then((r) => setDealers(r.data || [])).catch(() => {});
  }, []);

  const getRepName = (salesRepId) => {
    const rep = salesReps.find((s) => s._id === salesRepId);
    return rep ? rep.name : "—";
  };

  const getDealerNames = (dealerIds) => {
    if (!dealerIds || !Array.isArray(dealerIds)) return "—";
    return (
      dealerIds
        .map((id) => dealers.find((d) => d._id === id)?.dealerName)
        .filter(Boolean)
        .join(", ") || "—"
    );
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
      key: "stockNumber",
      header: "Stock No",
      cellClassName: "text-sm font-semibold text-gray-900 font-mono",
      searchValue: (r) => r.stockNumber,
      render: (r) => r.stockNumber,
    },
    {
      key: "stockDate",
      header: "Entry Date",
      cellClassName: "text-sm text-gray-600",
      render: (r) =>
        new Date(r.stockDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "salesRep",
      header: "Sales Rep",
      cellClassName: "text-sm text-gray-700 font-medium",
      searchValue: (r) => getRepName(r.salesRepId),
      render: (r) => getRepName(r.salesRepId),
    },
    {
      key: "dealers",
      header: "Allocated Dealers",
      cellClassName: "text-xs text-gray-500 max-w-xs truncate hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      searchValue: (r) => getDealerNames(r.dealerIds),
      render: (r) => getDealerNames(r.dealerIds),
    },
    {
      key: "itemsCount",
      header: "Total Items",
      cellClassName: "text-sm text-center text-gray-600 font-mono",
      render: (r) => r.items?.length || 0,
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (r) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
            r.status === "active"
              ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
              : "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20"
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
          onEdit={r.status === "active" ? () => openEdit(r) : undefined}
          onDelete={() => setDeleteTarget(r)}
        />
      ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Stock Opening (Party)"
        subtitle="Manage assigned dealer opening stocks"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Open Stock
          </Button>
        }
      />
      <DataTable
        loading={loading}
        data={items}
        columns={columns}
        emptyMessage="No stock opening records found."
        exportFileName="stock_entries"
      />
      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Stock Entry" : "New Stock Entry"}
          onClose={closeModal}
          extraWide
        >
          <StockEntryForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete stock entry "${deleteTarget.stockNumber}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
