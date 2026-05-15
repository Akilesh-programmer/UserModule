import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import {
  fetchUserTypes,
  createUserType,
  updateUserType,
  deleteUserType,
} from "../../api/userTypeApi";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import UserTypeForm from "../../components/master/UserTypeForm";
import styles from "./MasterPage.module.css";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";

export default function UserTypePage() {
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUserTypes = useCallback(async () => {
    try {
      const { data } = await fetchUserTypes();
      setUserTypes(data);
    } catch {
      toast.error("Failed to load user types");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserTypes();
  }, [loadUserTypes]);

  const openCreateModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (userType) => {
    setEditTarget(userType);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSave = async (formData) => {
    if (editTarget) {
      const { data } = await updateUserType(editTarget._id, formData);
      setUserTypes((prev) =>
        prev.map((ut) => (ut._id === data._id ? data : ut)),
      );
      toast.success("User type updated successfully");
    } else {
      const { data } = await createUserType(formData);
      setUserTypes((prev) => [data, ...prev]);
      toast.success("User type created successfully");
    }
    closeModal();
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteUserType(deleteTarget._id);
      setUserTypes((prev) => prev.filter((ut) => ut._id !== deleteTarget._id));
      toast.success("User type deleted successfully");
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
          <h2 className={styles.pageTitle}>User Type</h2>
          <p className={styles.pageSubtitle}>
            Manage user type classifications
          </p>
        </div>
        <Button onClick={openCreateModal}>
          <MdAdd /> Add User Type
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : userTypes.length === 0 ? (
          <div className={styles.empty}>
            No user types found. Create one to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userTypes.map((ut, index) => (
                <tr key={ut._id}>
                  <td>{index + 1}</td>
                  <td>{ut.name}</td>
                  <td>{ut.description || "—"}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${ut.isActive ? styles.active : styles.inactive}`}
                    >
                      {ut.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(ut)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(ut)}
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
          title={editTarget ? "Edit User Type" : "Add User Type"}
          onClose={closeModal}
        >
          <UserTypeForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
