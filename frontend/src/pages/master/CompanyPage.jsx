import { useCrudPage } from "../../hooks/useCrudPage";
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "../../api/companyApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import CompanyForm from "../../components/forms/CompanyForm";
import { MdAdd } from "react-icons/md";

export default function CompanyPage() {
  const { items, loading, modalOpen, editTarget, openCreate, openEdit, closeModal, handleSave, deleteTarget, setDeleteTarget, deleteLoading, handleDelete } = useCrudPage({
    fetchFn: fetchCompanies, createFn: createCompany, updateFn: updateCompany, deleteFn: deleteCompany, entityName: "Company",
  });

  const columns = [
    { key: "#", header: "#", cellClassName: "w-12 text-sm text-gray-500", render: (_, i) => i + 1 },
    { key: "name", header: "Name", cellClassName: "text-sm font-medium text-gray-900", render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm text-gray-700", render: (r) => r.code || "—" },
    { key: "contactPerson", header: "Contact Person", cellClassName: "text-sm text-gray-700", render: (r) => r.contactPerson || "—" },
    { key: "phone", header: "Phone", cellClassName: "text-sm text-gray-700", render: (r) => r.phone || "—" },
    { key: "status", header: "Status", render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div>
      <PageHeader title="Companies" subtitle="Manage companies" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Company</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No companies found." />
      {modalOpen && (
        <Modal title={editTarget ? "Edit Company" : "Add Company"} onClose={closeModal} extraWide>
          <CompanyForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {deleteTarget && <ConfirmDialog message={`Delete company "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
