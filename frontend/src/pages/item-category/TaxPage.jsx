import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchTaxes, createTax, updateTax, deleteTax } from "../../api/taxApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import TaxForm from "../../components/forms/TaxForm";
import { MdAdd } from "react-icons/md";

export default function TaxPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchTaxes, createFn: createTax, updateFn: updateTax, deleteFn: deleteTax, entityName: "Tax",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "taxType", header: "Tax Type", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.taxType, render: (r) => r.taxType },
    { key: "percentage", header: "Percentage (%)", cellClassName: "text-sm font-medium text-gray-700", sortValue: (r) => r.percentage, render: (r) => `${r.percentage}%` },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.description || "", render: (r) => r.description || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Taxes" subtitle="Manage tax rates" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Tax</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No taxes found." exportFileName="taxes" />
      {modalOpen && <Modal title={editTarget ? "Edit Tax" : "Add Tax"} onClose={closeModal} wide><TaxForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete tax "${deleteTarget.taxType} (${deleteTarget.percentage}%)"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
