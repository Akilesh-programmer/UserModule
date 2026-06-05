import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchExpenseTypes, createExpenseType, updateExpenseType, deleteExpenseType } from "../../api/expenseTypeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ExpenseTypeForm from "../../components/forms/ExpenseTypeForm";
import { MdAdd } from "react-icons/md";

export default function ExpenseTypePage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchExpenseTypes, createFn: createExpenseType, updateFn: updateExpenseType, deleteFn: deleteExpenseType, entityName: "Expense Type",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-700", render: (r) => r.description || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Expense Types" subtitle="Manage expense types" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Expense Type</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No expense types found." />
      {modalOpen && <Modal title={editTarget ? "Edit Expense Type" : "Add Expense Type"} onClose={closeModal}><ExpenseTypeForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete expense type "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
