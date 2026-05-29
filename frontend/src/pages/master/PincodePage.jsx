import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchPincodes, createPincode, updatePincode, deletePincode } from "../../api/pincodeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import PincodeForm from "../../components/forms/PincodeForm";
import { MdAdd } from "react-icons/md";

export default function PincodePage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchPincodes, createFn: createPincode, updateFn: updatePincode, deleteFn: deletePincode, entityName: "Pincode",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "code", header: "Pincode", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.code },
    { key: "city", header: "City", cellClassName: "text-sm text-gray-500", render: (r) => r.cityId?.name || "—" },
    { key: "state", header: "State", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", render: (r) => r.stateId?.name || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Pincodes" subtitle="Manage pincodes" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Pincode</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No pincodes found." />
      {modalOpen && <Modal title={editTarget ? "Edit Pincode" : "Add Pincode"} onClose={closeModal}><PincodeForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete pincode "${deleteTarget.code}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
