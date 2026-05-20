import { useCrudPage } from "../../hooks/useCrudPage";
import {
  fetchSalesReps,
  createSalesRep,
  updateSalesRep,
  deleteSalesRep,
} from "../../api/salesRepApi";
import { MdAdd } from "react-icons/md";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import AvatarCell from "../../components/common/AvatarCell";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SalesRepForm from "../../components/forms/SalesRepForm";

export default function SalesRepPage() {
  const {
    items: salesReps,
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
    fetchFn: fetchSalesReps,
    createFn: createSalesRep,
    updateFn: updateSalesRep,
    deleteFn: deleteSalesRep,
    entityName: "Sales rep",
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
      render: (rep) => <AvatarCell src={rep.profilePic} alt={rep.name} />,
    },
    {
      key: "name",
      header: "Name",
      cellClassName: "text-sm font-medium text-gray-900",
      render: (rep) => rep.name,
    },
    {
      key: "mobile",
      header: "Mobile",
      cellClassName: "text-sm text-gray-500 hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      render: (rep) => rep.mobile,
    },
    {
      key: "manager",
      header: "Manager",
      cellClassName: "text-sm text-gray-500 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      render: (rep) => rep.managerId?.name || "—",
    },
    {
      key: "status",
      header: "Status",
      render: (rep) => <Badge active={rep.isActive} />,
    },
    {
      key: "actions",
      header: "Actions",
      render: (rep) => (
        <ActionButtons
          onEdit={() => openEdit(rep)}
          onDelete={() => setDeleteTarget(rep)}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sales Rep"
        subtitle="Manage sales representatives"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add Sales Rep
          </Button>
        }
      />

      <DataTable
        loading={loading}
        data={salesReps}
        columns={columns}
        emptyMessage="No sales reps found."
      />

      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Sales Rep" : "Add Sales Rep"}
          onClose={closeModal}
          wide
        >
          <SalesRepForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={
            "Are you sure you want to delete sales rep " +
            deleteTarget.name +
            "?"
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
