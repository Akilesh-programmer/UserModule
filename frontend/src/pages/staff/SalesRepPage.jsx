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
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "photo", header: "Photo", cellClassName: "w-14", sortable: false, render: (r) => <AvatarCell src={r.profilePic} alt={r.name} /> },
    { key: "name", header: "Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "mobile", header: "Mobile", cellClassName: "text-sm text-gray-600 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.mobile, render: (r) => r.mobile },
    { key: "manager", header: "Manager", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", searchValue: (r) => r.managerId?.name || "", render: (r) => r.managerId?.name || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Sales Reps" subtitle="Manage sales representatives" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Sales Rep</Button>} />
      <DataTable loading={loading} data={salesReps} columns={columns} emptyMessage="No sales reps found." exportFileName="sales-reps" />

      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Sales Rep" : "Add Sales Rep"}
          onClose={closeModal}
          extraWide
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
