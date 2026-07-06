import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchUoms, createUom, updateUom, deleteUom } from "../../api/uomApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UnitOfMeasureForm from "../../components/forms/UnitOfMeasureForm";
import { MdAdd } from "react-icons/md";

export default function UnitOfMeasurePage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchUoms, createFn: createUom, updateFn: updateUom, deleteFn: deleteUom, entityName: "Unit of Measure",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "abbreviation", header: "Abbreviation", cellClassName: "text-sm font-semibold font-mono text-gray-900", searchValue: (r) => r.abbreviation, render: (r) => r.abbreviation },
    { key: "description", header: "Description", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.description || "", render: (r) => r.description || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Units of Measure" subtitle="Manage units of measure" action={<Button onClick={openCreate}><MdAdd size={16} /> Add UoM</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No units of measure found." exportFileName="units-of-measure" />
      {modalOpen && <Modal title={editTarget ? "Edit Unit of Measure" : "Add Unit of Measure"} onClose={closeModal} wide><UnitOfMeasureForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete unit "${deleteTarget.abbreviation}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
