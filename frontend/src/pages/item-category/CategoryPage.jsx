import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "../../api/categoryApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CategoryForm from "../../components/forms/CategoryForm";
import { MdAdd } from "react-icons/md";

export default function CategoryPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchCategories, createFn: createCategory, updateFn: updateCategory, deleteFn: deleteCategory, entityName: "Category",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm text-gray-700", render: (r) => r.code },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", render: (r) => r.description || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Categories" subtitle="Manage item categories" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Category</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No categories found. Create one to get started." />
      {modalOpen && <Modal title={editTarget ? "Edit Category" : "Add Category"} onClose={closeModal}><CategoryForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Are you sure you want to delete "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
