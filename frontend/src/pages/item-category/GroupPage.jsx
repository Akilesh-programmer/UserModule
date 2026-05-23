import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchGroups, createGroup, updateGroup, deleteGroup } from "../../api/groupApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import GroupForm from "../../components/forms/GroupForm";
import { MdAdd } from "react-icons/md";

export default function GroupPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchGroups, createFn: createGroup, updateFn: updateGroup, deleteFn: deleteGroup, entityName: "Group",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm text-gray-700", render: (r) => r.code },
    { key: "category", header: "Category", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", render: (r) => r.categoryId?.name || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Groups" subtitle="Manage item groups" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Group</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No groups found. Create one to get started." />
      {modalOpen && <Modal title={editTarget ? "Edit Group" : "Add Group"} onClose={closeModal}><GroupForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Are you sure you want to delete "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
