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
    <div>
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
          {
            key: "#",
            header: "#",
            cellClassName: "w-12 text-sm text-gray-500",
            render: (_, i) => i + 1,
          },
          {
            key: "username",
            header: "Username",
            cellClassName: "text-sm font-medium text-gray-900",
            render: (u) => u.username,
          },
          {
            key: "userType",
            header: "User Type",
            cellClassName: "text-sm text-gray-500",
            render: (u) => u.userTypeId?.name || "—",
          },
          {
            key: "name",
            header: "Name",
            cellClassName: "text-sm text-gray-500 hidden sm:table-cell",
            headerClassName: "hidden sm:table-cell",
            render: (u) => u.name || "—",
          },
          {
            key: "status",
            header: "Status",
            render: (u) => <Badge active={u.isActive} />,
          },
          {
            key: "actions",
            header: "Actions",
            render: (u) => (
              <ActionButtons
                onEdit={() => openEdit(u)}
                onDelete={() => setDeleteTarget(u)}
              />
            ),
          },
        ]}
        emptyMessage="No users found."
      />

      {modalOpen && (
        <Modal
          title={editTarget ? "Edit User" : "Add User"}
          onClose={closeModal}
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
