import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../api/userApi";
import { fetchActiveUserTypes } from "../../api/userTypeApi";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import DataTable from "../../components/common/DataTable";
import ActionButtons from "../../components/common/ActionButtons";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserCreationForm from "../../components/forms/UserCreationForm";
import { MdAdd } from "react-icons/md";

export default function UserCreationPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, typesRes] = await Promise.all([
        fetchUsers(),
        fetchActiveUserTypes(),
      ]);
      setUsers(usersRes.data);
      setUserTypes(typesRes.data.filter((t) => t.name !== "Admin"));
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to access this page",
        );
        navigate("/");
      } else {
        toast.error("Failed to load data");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };
  const openEdit = (user) => {
    setEditTarget(user);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editTarget) {
        const { data } = await updateUser(editTarget._id, formData);
        setUsers((prev) => prev.map((u) => (u._id === data._id ? data : u)));
        toast.success("User updated successfully");
      } else {
        const { data } = await createUser(formData);
        setUsers((prev) => [data, ...prev]);
        toast.success("User created successfully");
      }
      closeModal();
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to perform this action",
        );
        closeModal();
      } else {
        throw err;
      }
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      toast.success("User deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <PageHeader
        title="User Creation"
        subtitle="Manage system users"
        action={
          <Button onClick={openCreate}>
            <MdAdd size={16} /> Add User
          </Button>
        }
      />

      <DataTable
        loading={loading}
        data={users}
        columns={[
          { key: "#", header: "#", cellClassName: "w-10 text-sm text-gray-500", sortable: false, render: (_, i) => i + 1 },
          { key: "name", header: "Full Name", cellClassName: "text-sm font-semibold text-gray-900", searchValue: (u) => u.name || "", render: (u) => u.name || "—" },
          { key: "username", header: "Username", cellClassName: "text-sm font-mono text-gray-700", searchValue: (u) => u.username, render: (u) => u.username },
          { key: "userType", header: "User Type", cellClassName: "text-sm text-gray-500 hidden sm:table-cell", headerClassName: "hidden sm:table-cell", searchValue: (u) => u.userTypeId?.name || "", render: (u) => u.userTypeId?.name || "—" },
          { key: "status", header: "Status", sortable: false, render: (u) => <Badge active={u.isActive} /> },
          { key: "actions", header: "Actions", sortable: false, render: (u) => <ActionButtons onEdit={() => openEdit(u)} onDelete={() => setDeleteTarget(u)} /> },
        ]}
        emptyMessage="No users found."
        exportFileName="users"
      />

      {modalOpen && (
        <Modal
          title={editTarget ? "Edit User" : "Add User"}
          onClose={closeModal}
          wide
        >
          <UserCreationForm
            initialData={editTarget}
            userTypes={userTypes}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={
            "Are you sure you want to delete user " +
            deleteTarget.username +
            "?"
          }
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
