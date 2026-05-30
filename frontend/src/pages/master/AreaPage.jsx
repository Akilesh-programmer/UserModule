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
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Area Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "pincode", header: "Pincode", cellClassName: "text-sm text-gray-500", render: (r) => r.pincodeId?.code || "—" },
    { key: "city", header: "City", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", render: (r) => r.cityId?.name || "—" },
    { key: "state", header: "State", cellClassName: "text-sm text-gray-500 hidden lg:table-cell", headerClassName: "hidden lg:table-cell", render: (r) => r.stateId?.name || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Areas" subtitle="Manage areas" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Area</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No areas found." />
      {modalOpen && <Modal title={editTarget ? "Edit Area" : "Add Area"} onClose={closeModal}><AreaForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete area "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
