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
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "name", header: "State Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm font-mono text-gray-600", searchValue: (r) => r.code || "", render: (r) => r.code || "—" },
    { key: "country", header: "Country", cellClassName: "text-sm text-gray-600 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.countryId?.name || "", render: (r) => r.countryId?.name || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="States" subtitle="Manage states" action={<Button onClick={openCreate}><MdAdd size={16} /> Add State</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No states found." exportFileName="states" />
      {modalOpen && <Modal title={editTarget ? "Edit State" : "Add State"} onClose={closeModal} wide><StateForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete state "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
