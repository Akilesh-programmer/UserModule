import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchStates, createState, updateState, deleteState } from "../../api/stateApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import StateForm from "../../components/forms/StateForm";
import { MdAdd } from "react-icons/md";

export default function StatePage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchStates, createFn: createState, updateFn: updateState, deleteFn: deleteState, entityName: "State",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm text-gray-700", render: (r) => r.code || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="States" subtitle="Manage states" action={<Button onClick={openCreate}><MdAdd size={16} /> Add State</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No states found." />
      {modalOpen && <Modal title={editTarget ? "Edit State" : "Add State"} onClose={closeModal}><StateForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete state "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
