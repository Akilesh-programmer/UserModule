import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchPackingTypes, createPackingType, updatePackingType, deletePackingType } from "../../api/packingTypeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PackingTypeForm from "../../components/forms/PackingTypeForm";
import { MdAdd } from "react-icons/md";

export default function PackingTypePage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchPackingTypes, createFn: createPackingType, updateFn: updatePackingType, deleteFn: deletePackingType, entityName: "Packing Type",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "name", header: "Packing Type", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "unitsPerPack", header: "Units / Pack", cellClassName: "text-sm font-medium text-gray-700", sortValue: (r) => r.unitsPerPack, render: (r) => r.unitsPerPack },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.description || "", render: (r) => r.description || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Packing Types" subtitle="Manage packing types" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Packing Type</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No packing types found." exportFileName="packing-types" />
      {modalOpen && <Modal title={editTarget ? "Edit Packing Type" : "Add Packing Type"} onClose={closeModal} wide><PackingTypeForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete packing type "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
