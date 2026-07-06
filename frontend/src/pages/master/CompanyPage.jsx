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
    { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
    { key: "name", header: "Company Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (r) => r.name, render: (r) => r.name },
    { key: "code", header: "Code", cellClassName: "text-sm font-mono text-gray-600", searchValue: (r) => r.code || "", render: (r) => r.code || "—" },
    { key: "contactPerson", header: "Contact Person", cellClassName: "text-sm text-gray-600 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (r) => r.contactPerson || "", render: (r) => r.contactPerson || "—" },
    { key: "phone", header: "Phone", cellClassName: "text-sm text-gray-600 hidden md:table-cell", headerClassName: "hidden md:table-cell", searchValue: (r) => r.phone || "", render: (r) => r.phone || "—" },
    { key: "status", header: "Status", sortable: false, render: (r) => <Badge active={r.isActive} /> },
    { key: "actions", header: "Actions", sortable: false, render: (r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => setDeleteTarget(r)} /> },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="Companies" subtitle="Manage companies" action={<Button onClick={openCreate}><MdAdd size={16} /> Add Company</Button>} />
      <DataTable loading={loading} data={items} columns={columns} emptyMessage="No companies found." exportFileName="companies" />
      {modalOpen && (
        <Modal title={editTarget ? "Edit Company" : "Add Company"} onClose={closeModal} extraWide>
          <CompanyForm initialData={editTarget} onSave={handleSave} onCancel={closeModal} />
        </Modal>
      )}
      {deleteTarget && <ConfirmDialog message={`Delete company "${deleteTarget.name}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}
