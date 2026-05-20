import { useCrudPage } from "../../hooks/useCrudPage";
import {
  fetchManagers,
  createManager,
  updateManager,
  deleteManager,
} from "../../api/managerApi";
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
  const {
    items: managers,
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
    fetchFn: fetchManagers,
    createFn: createManager,
    updateFn: updateManager,
    deleteFn: deleteManager,
    entityName: "Manager",
  });

  const columns = [
    {
      key: "#",
      header: "#",
      cellClassName: "w-12 text-sm text-gray-500",
      render: (_, i) => i + 1,
    },
    {
      key: "photo",
      header: "Photo",
      cellClassName: "w-16",
      render: (mgr) => <AvatarCell src={mgr.profilePic} alt={mgr.name} />,
    },
    {
      key: "name",
      header: "Name",
      cellClassName: "text-sm font-medium text-gray-900",
      render: (mgr) => mgr.name,
    },
    {
      key: "mobile",
      header: "Mobile",
      cellClassName: "text-sm text-gray-500 hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      render: (mgr) => mgr.mobile,
    },
    {
      key: "area",
      header: "Area",
      cellClassName: "text-sm text-gray-500 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      render: (mgr) => mgr.area || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (mgr) => <Badge active={mgr.isActive} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (mgr) => (
        <ActionButtons
          onEdit={() => openEdit(mgr)}
          onDelete={() => setDeleteTarget(mgr)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manager"
        subtitle="Manage field managers"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add Manager
          </Button>
        }
      />

      <DataTable
        loading={loading}
        data={managers}
        columns={columns}
        emptyMessage="No managers found."
      />

      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Manager" : "Add Manager"}
          onClose={closeModal}
          wide
        >
          <ManagerForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={
            "Are you sure you want to delete manager " + deleteTarget.name + "?"
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
