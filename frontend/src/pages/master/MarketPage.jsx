import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchMarkets, createMarket, updateMarket, deleteMarket } from "../../api/marketApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import MarketForm from "../../components/forms/MarketForm";
import { MdAdd } from "react-icons/md";

export default function MarketPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchMarkets, createFn: createMarket, updateFn: updateMarket, deleteFn: deleteMarket, entityName: "Market",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Market Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "district", header: "District", cellClassName: "text-sm text-gray-500", render: (r) => r.districtId?.name || "—" },
    { key: "state", header: "State", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", render: (r) => r.stateId?.name || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Markets" subtitle="Manage markets" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Market</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No markets found." />
      {modalOpen && <Modal title={editTarget ? "Edit Market" : "Add Market"} onClose={closeModal}><MarketForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete market "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
