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
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserCreationForm from "../../components/master/UserCreationForm";
import styles from "./MasterPage.module.css";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

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

  const openCreateModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
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
        const typesRes = await fetchActiveUserTypes();
        setUserTypes(typesRes.data.filter((t) => t.name !== "Admin"));
        setUsers((prev) => [
          {
            ...data,
            userTypeId:
              userTypes.find((t) => t._id === data.userTypeId) ||
              data.userTypeId,
          },
          ...prev,
        ]);
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
        throw err; // Let the form's catch handle validation/duplicate errors
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
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>User Creation</h2>
          <p className={styles.pageSubtitle}>Manage system users</p>
        </div>
        <Button onClick={openCreateModal}>
          <MdAdd /> Add User
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            No users found. Create one to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>User Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user._id}>
                  <td>{index + 1}</td>
                  <td>{user.username}</td>
                  <td>{user.userTypeId?.name || "—"}</td>
                  <td>{user.description || "—"}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${user.isActive ? styles.active : styles.inactive}`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(user)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(user)}
                        title="Delete"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
          message={`Are you sure you want to delete user "${deleteTarget.username}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
