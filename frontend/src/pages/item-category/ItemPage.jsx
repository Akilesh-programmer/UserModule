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
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "itemName", header: "Item Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.itemName, render: (r) => r.itemName },
    { key: "itemCode", header: "Code", cellClassName: "text-sm font-mono text-gray-600", searchValue: (r) => r.itemCode, render: (r) => r.itemCode },
    { key: "hsnCode", header: "HSN Code", cellClassName: "text-sm font-mono text-gray-500 hidden lg:table-cell", headerClassName: "hidden lg:table-cell", searchValue: (r) => r.hsnCode, render: (r) => r.hsnCode || "—" },
    { key: "category", header: "Category", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.categoryId?.name || "", render: (r) => r.categoryId?.name || "—" },
    { key: "price", header: "Price", cellClassName: "text-sm font-medium text-gray-800", sortValue: (r) => r.itemPrice, render: (r) => `₹${r.itemPrice?.toFixed(2) || "0.00"}` },
    { key: "piecesPerBox", header: "Pcs/Box", cellClassName: "text-sm text-gray-600 hidden md:table-cell", headerClassName: "hidden md:table-cell", sortValue: (r) => r.itemsPerBox, render: (r) => r.itemsPerBox ?? "—" },
    { key: "pieceRate", header: "Piece Rate", cellClassName: "text-sm text-gray-600 hidden md:table-cell", headerClassName: "hidden md:table-cell", sortValue: (r) => r.boxRate, render: (r) => r.boxRate != null ? `₹${r.boxRate.toFixed(2)}` : "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Items" subtitle="Manage product items" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Item</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No items found. Create one to get started." exportFileName="items" />
      {modalOpen && <Modal title={editTarget ? "Edit Item" : "Add Item"} onClose={closeModal} extraWide><ItemForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete item "${deleteTarget.itemName}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
