import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchUserTypes, createUserType, updateUserType, deleteUserType } from "../../api/userTypeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserTypeForm from "../../components/forms/UserTypeForm";
import { MdAdd } from "react-icons/md";

export default function UserTypePage() {
  const { items: userTypes, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchUserTypes, createFn: createUserType, updateFn: updateUserType, deleteFn: deleteUserType, entityName: "User Type",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "name", header: "User Type", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.description || "", render: (r) => r.description || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="User Types" subtitle="Manage user type classifications" action={<Button onClick={openCreate}><MdAdd size={16} /> Add User Type</Button>} />
      <DataTable loading={loading} data={userTypes} columns={columns} emptyMessage="No user types found." exportFileName="user-types" />
      {modalOpen && (
        <Modal title={editTarget ? "Edit User Type" : "Add User Type"} onClose={closeModal} wide>
          <UserTypeForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {deleteTarget && <ConfirmDialog message={`Delete user type "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
