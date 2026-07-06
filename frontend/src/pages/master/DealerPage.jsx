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
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "photo", header: "Photo", cellClassName: "w-14", sortable: false, render: (r) => <AvatarCell src={r.image} alt={r.dealerName} /> },
    { key: "name", header: "Dealer Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.dealerName, render: (r) => r.dealerName },
    { key: "phone", header: "Phone", cellClassName: "text-sm text-gray-600 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.phoneNumber || "", render: (r) => r.phoneNumber || "—" },
    { key: "market", header: "Market", cellClassName: "text-sm text-gray-500 hidden md:table-cell", headerClassName: "hidden md:table-cell", searchValue: (r) => r.marketId?.name || "", render: (r) => r.marketId?.name || "—" },
    { key: "shopType", header: "Shop Type", cellClassName: "text-sm text-gray-500 hidden lg:table-cell", headerClassName: "hidden lg:table-cell", searchValue: (r) => r.shopTypeId?.name || "", render: (r) => r.shopTypeId?.name || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Dealers" subtitle="Manage dealers" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Dealer</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No dealers found." exportFileName="dealers" />
      {modalOpen && (
        <Modal title={editTarget ? "Edit Dealer" : "Add Dealer"} onClose={closeModal} extraWide>
          <DealerForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {deleteTarget && <ConfirmDialog message={`Delete dealer "${deleteTarget.dealerName}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
