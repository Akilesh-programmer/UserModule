import { useCrudPage } from "../../hooks/useCrudPage";
import {
  fetchSchemes,
  createScheme,
  updateScheme,
  deleteScheme,
} from "../../api/schemeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SchemeForm from "../../components/forms/SchemeForm";
import { MdAdd } from "react-icons/md";

export default function SchemePage() {
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
    fetchFn: fetchSchemes,
    createFn: createScheme,
    updateFn: updateScheme,
    deleteFn: deleteScheme,
    entityName: "Scheme",
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
      key: "schemeName",
      header: "Scheme Name",
      cellClassName: "text-sm font-semibold text-gray-900",
      searchValue: (r) => r.schemeName,
      render: (r) => r.schemeName,
    },
    {
      key: "group",
      header: "Group",
      cellClassName: "text-sm text-gray-500 hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      searchValue: (r) => r.groupId?.name || "",
      render: (r) => r.groupId?.name || "—",
    },
    {
      key: "item",
      header: "Item",
      cellClassName: "text-sm text-gray-500 hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      searchValue: (r) => r.itemId?.itemName || "",
      render: (r) => r.itemId?.itemName || "—",
    },
    {
      key: "boxQuantity",
      header: "Box Qty",
      cellClassName: "text-sm text-gray-600",
      sortValue: (r) => r.boxQuantity,
      render: (r) => r.boxQuantity ?? "—",
    },
    {
      key: "hsnCode",
      header: "HSN Code",
      cellClassName:
        "text-sm font-mono text-gray-500 hidden lg:table-cell",
      headerClassName: "hidden lg:table-cell",
      searchValue: (r) => r.hsnCode || "",
      render: (r) => r.hsnCode || "—",
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
        title="Schemes"
        subtitle="Manage product schemes"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add Scheme
          </Button>
        }
      />
      <DataTable
        loading={loading}
        data={items}
        columns={columns}
        emptyMessage="No schemes found. Create one to get started."
        exportFileName="schemes"
      />
      {modalOpen && (
        <Modal
          title={editTarget ? "Edit Scheme" : "Add Scheme"}
          onClose={closeModal}
          extraWide
        >
          <SchemeForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete scheme "${deleteTarget.schemeName}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
