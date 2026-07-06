import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchManagers, createManager, updateManager, deleteManager } from "../../api/managerApi";
import { MdAdd } from "react-icons/md";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import AvatarCell from "../../components/common/AvatarCell";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ManagerForm from "../../components/forms/ManagerForm";

export default function ManagerPage() {
  const { items: managers, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchManagers, createFn: createManager, updateFn: updateManager, deleteFn: deleteManager, entityName: "Manager",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "photo", header: "Photo", cellClassName: "w-14", sortable: false, render: (r) => <AvatarCell src={r.profilePic} alt={r.name} /> },
    { key: "name", header: "Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "mobile", header: "Mobile", cellClassName: "text-sm text-gray-600 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.mobile, render: (r) => r.mobile },
    { key: "email", header: "Email", cellClassName: "text-sm text-gray-500 hidden lg:table-cell", headerClassName: "hidden lg:table-cell", searchValue: (r) => r.email || "", render: (r) => r.email || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Managers" subtitle="Manage field managers" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Manager</Button>} />
      <DataTable loading={loading} data={managers} columns={columns} emptyMessage="No managers found." exportFileName="managers" />
      {modalOpen && (
        <Modal title={editTarget ? "Edit Manager" : "Add Manager"} onClose={closeModal} extraWide>
          <ManagerForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {deleteTarget && <ConfirmDialog message={`Delete manager "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
