import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchShopTypes, createShopType, updateShopType, deleteShopType } from "../../api/shopTypeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ShopTypeForm from "../../components/forms/ShopTypeForm";
import { MdAdd } from "react-icons/md";

export default function ShopTypePage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchShopTypes, createFn: createShopType, updateFn: updateShopType, deleteFn: deleteShopType, entityName: "Shop Type",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-700", render: (r) => r.description || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Shop Types" subtitle="Manage shop types" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Shop Type</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No shop types found." />
      {modalOpen && <Modal title={editTarget ? "Edit Shop Type" : "Add Shop Type"} onClose={closeModal}><ShopTypeForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete shop type "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
