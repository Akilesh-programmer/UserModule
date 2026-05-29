import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchCities, createCity, updateCity, deleteCity } from "../../api/cityApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CityForm from "../../components/forms/CityForm";
import { MdAdd } from "react-icons/md";

export default function CityPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchCities, createFn: createCity, updateFn: updateCity, deleteFn: deleteCity, entityName: "City",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "City Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "state", header: "State", cellClassName: "text-sm text-gray-500", render: (r) => r.stateId?.name || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Cities / Districts" subtitle="Manage cities and districts" action={<Button onClick={openCreate}><MdAdd size={16} /> Add City</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No cities found." />
      {modalOpen && <Modal title={editTarget ? "Edit City" : "Add City"} onClose={closeModal}><CityForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} /></Modal>}
      {deleteTarget && <ConfirmDialog message={`Delete city "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
