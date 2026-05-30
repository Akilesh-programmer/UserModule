import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchDealers, createDealer, updateDealer, deleteDealer } from "../../api/dealerApi";
import { MdAdd } from "react-icons/md";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import AvatarCell from "../../components/common/AvatarCell";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DealerForm from "../../components/forms/DealerForm";

export default function DealerPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchDealers, createFn: createDealer, updateFn: updateDealer, deleteFn: deleteDealer, entityName: "Dealer",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Dealer Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.dealerName },
    { key: "phone", header: "Phone", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", render: (r) => r.phoneNumber },
    { key: "market", header: "Market", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", render: (r) => r.marketId?.name || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "photo", header: "Photo", cellClassName: "w-16", render: (r) => <AvatarCell src={r.image} alt={r.dealerName} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Dealers" subtitle="Manage dealers" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Dealer</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No dealers found." />
      {modalOpen && (
        <Modal title={editTarget ? "Edit Dealer" : "Add Dealer"} onClose={closeModal} extraWide>
          <DealerForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {deleteTarget && <ConfirmDialog message={`Delete dealer "${deleteTarget.dealerName}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
