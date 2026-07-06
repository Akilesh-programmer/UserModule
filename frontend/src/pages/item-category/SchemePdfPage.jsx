import { useCrudPage } from "../../hooks/useCrudPage";
import {
  fetchSchemePdfs,
  createSchemePdf,
  updateSchemePdf,
  deleteSchemePdf,
} from "../../api/schemePdfApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SchemePdfForm from "../../components/forms/SchemePdfForm";
import { MdAdd } from "react-icons/md";

export default function SchemePdfPage() {
  const {
    items,
    loading,
    modalOpen,
    editTarget,
    openCreate,
    openEdit,
    closeModal,
    handleSave,
    deleteTarget,
    setDeleteTarget,
    deleteLoading,
    handleDelete,
  } = useCrudPage({
    fetchFn: fetchSchemePdfs,
    createFn: createSchemePdf,
    updateFn: updateSchemePdf,
    deleteFn: deleteSchemePdf,
    entityName: "Scheme PDF",
  });

  const columns = [
    {
      key: "#",
      header: "#",
      cellClassName: "w-10 text-sm text-gray-500",
      sortable: false,
      render: (_, i) => i + 1,
    },
    {
      key: "groupName",
      header: "Group Name",
      cellClassName: "text-sm font-semibold text-gray-900",
      searchValue: (r) => r.groupName,
      render: (r) => r.groupName,
    },
    {
      key: "category",
      header: "Category",
      cellClassName: "text-sm text-gray-500 hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      searchValue: (r) => r.categoryId?.name || "",
      render: (r) => r.categoryId?.name || "—",
    },
    {
      key: "pdfFile",
      header: "PDF File",
      cellClassName: "text-sm text-gray-500",
      sortable: false,
      render: (r) =>
        r.pdfFile ? (
          <a
            href={`/uploads/${r.pdfFile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline text-xs font-medium"
          >
            View PDF
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      render: (r) => <Badge active={r.isActive} />,
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      render: (r) => (
        <ActionButtons
          onEdit={() => openEdit(r)}
          onDelete={() => setDeleteTarget(r)}
        />
      ),
    },
  ];

  return (
    <div className="page-enter">
      <PageHeader
        title="Scheme PDFs"
        subtitle="Manage scheme PDF documents"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add Scheme PDF
          </Button>
        }
      />
      <DataTable
        loading={loading}
        data={items}
        columns={columns}
        emptyMessage="No scheme PDFs found. Create one to get started."
        exportFileName="scheme-pdfs"
      />
      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Scheme PDF" : "Add Scheme PDF"}
          onClose={closeModal}
          wide
        >
          <SchemePdfForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete scheme PDF "${deleteTarget.groupName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
