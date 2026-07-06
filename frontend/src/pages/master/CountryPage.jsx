import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchCountries, createCountry, updateCountry, deleteCountry } from "../../api/countryApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CountryForm from "../../components/forms/CountryForm";
import { MdAdd } from "react-icons/md";

export default function CountryPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchCountries, createFn: createCountry, updateFn: updateCountry, deleteFn: deleteCountry, entityName: "Country",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "name", header: "Country Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm font-mono text-gray-600", searchValue: (r) => r.code || "", render: (r) => r.code || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Countries" subtitle="Manage countries" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Country</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No countries found." exportFileName="countries" />
      {modalOpen && <Modal title={editTarget ? "Edit Country" : "Add Country"} onClose={closeModal} wide><CountryForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete country "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
