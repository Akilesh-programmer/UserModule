import { useCrudPage } from "../../hooks/useCrudPage";
import {
  fetchApplicationPdfs,
  createApplicationPdf,
  updateApplicationPdf,
  deleteApplicationPdf,
} from "../../api/applicationPdfApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ApplicationPdfForm from "../../components/forms/ApplicationPdfForm";
import { MdAdd } from "react-icons/md";

export default function ApplicationPdfPage() {
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
    fetchFn: fetchApplicationPdfs,
    createFn: createApplicationPdf,
    updateFn: updateApplicationPdf,
    deleteFn: deleteApplicationPdf,
    entityName: "Application PDF",
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
      key: "formType",
      header: "Form Type",
      cellClassName: "text-sm font-semibold text-gray-900",
      searchValue: (r) => r.formType,
      render: (r) => r.formType,
    },
    {
      key: "description",
      header: "Description",
      cellClassName:
        "text-sm text-gray-500 hidden md:table-cell max-w-[200px] truncate",
      headerClassName: "hidden md:table-cell",
      searchValue: (r) => r.description || "",
      render: (r) => r.description || "—",
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
        title="Application & Terms PDFs"
        subtitle="Manage application and terms PDF documents"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add PDF
          </Button>
        }
      />
      <DataTable
        loading={loading}
        data={items}
        columns={columns}
        emptyMessage="No application PDFs found. Create one to get started."
        exportFileName="application-pdfs"
      />
      {modalOpen && (
        <Modal
          title={
            editTarget
              ? "Edit Application PDF"
              : "Add Application & Terms PDF"
          }
          onClose={closeModal}
          wide
        >
          <ApplicationPdfForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.formType}" PDF?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
