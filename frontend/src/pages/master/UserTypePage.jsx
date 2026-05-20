import { useCrudPage } from "../../hooks/useCrudPage";
import {
  fetchUserTypes,
  createUserType,
  updateUserType,
  deleteUserType,
} from "../../api/userTypeApi";
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
  const {
    items: userTypes,
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
    fetchFn: fetchUserTypes,
    createFn: createUserType,
    updateFn: updateUserType,
    deleteFn: deleteUserType,
    entityName: "User type",
  });

  const columns = [
    {
      key: "#",
      header: "#",
      cellClassName: "w-12 text-sm text-gray-500",
      render: (_, i) => i + 1,
    },
    {
      key: "name",
      header: "Name",
      cellClassName: "text-sm font-medium text-gray-900",
      render: (ut) => ut.name,
    },
    {
      key: "description",
      header: "Description",
      cellClassName: "text-sm text-gray-500 hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      render: (ut) => ut.description || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (ut) => <Badge active={ut.isActive} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (ut) => (
        <ActionButtons
          onEdit={() => openEdit(ut)}
          onDelete={() => setDeleteTarget(ut)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Type"
        subtitle="Manage user type classifications"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add User Type
          </Button>
        }
      />

      <DataTable
        loading={loading}
        data={userTypes}
        columns={columns}
        emptyMessage="No user types found. Create one to get started."
      />

      {modalOpen && (
        <Modal
          title={editTarget ? "Edit User Type" : "Add User Type"}
          onClose={closeModal}
        >
          <UserTypeForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
