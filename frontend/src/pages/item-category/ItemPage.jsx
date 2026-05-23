import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchItems, createItem, updateItem, deleteItem } from "../../api/itemApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ItemForm from "../../components/forms/ItemForm";
import { MdAdd } from "react-icons/md";

export default function ItemPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchItems, createFn: createItem, updateFn: updateItem, deleteFn: deleteItem, entityName: "Item",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "itemName", header: "Item Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.itemName },
    { key: "itemCode", header: "Code", cellClassName: "text-sm text-gray-700", render: (r) => r.itemCode },
    { key: "category", header: "Category", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", render: (r) => r.categoryId?.name || "—" },
    { key: "price", header: "Price", cellClassName: "text-sm text-gray-700", render: (r) => `₹${r.itemPrice?.toFixed(2) || "0.00"}` },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Items" subtitle="Manage product items" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Item</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No items found. Create one to get started." />
      {modalOpen && <Modal title={editTarget ? "Edit Item" : "Add Item"} onClose={closeModal} extraWide><ItemForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Are you sure you want to delete "${deleteTarget.itemName}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
