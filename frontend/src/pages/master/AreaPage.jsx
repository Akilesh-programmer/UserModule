import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchAreas, createArea, updateArea, deleteArea } from "../../api/areaApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AreaForm from "../../components/forms/AreaForm";
import { MdAdd } from "react-icons/md";

export default function AreaPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchAreas, createFn: createArea, updateFn: updateArea, deleteFn: deleteArea, entityName: "Area",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "name", header: "Area Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "pincode", header: "Pincode", cellClassName: "text-sm font-mono text-gray-600 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.pincodeId?.code || "", render: (r) => r.pincodeId?.code || "—" },
    { key: "city", header: "City", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", searchValue: (r) => r.cityId?.name || "", render: (r) => r.cityId?.name || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Areas" subtitle="Manage areas" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Area</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No areas found." exportFileName="areas" />
      {modalOpen && <Modal title={editTarget ? "Edit Area" : "Add Area"} onClose={closeModal} wide><AreaForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete area "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
