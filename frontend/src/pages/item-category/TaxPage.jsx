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
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "taxType", header: "Tax Type", cellClassName: "text-sm text-gray-700", render: (r) => r.taxType },
    { key: "percentage", header: "Percentage", cellClassName: "text-sm text-gray-700", render: (r) => `${r.percentage}%` },
    { key: "hsnCode", header: "HSN Code", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", render: (r) => r.hsnCode || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Taxes" subtitle="Manage tax configurations" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Tax</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No taxes found. Create one to get started." />
      {modalOpen && <Modal title={editTarget ? "Edit Tax" : "Add Tax"} onClose={closeModal}><TaxForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Are you sure you want to delete "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
