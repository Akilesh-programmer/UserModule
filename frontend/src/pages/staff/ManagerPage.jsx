import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import {
  fetchManagers,
  createManager,
  updateManager,
  deleteManager,
} from "../../api/managerApi";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import ManagerForm from "../../components/staff/ManagerForm";
import styles from "./StaffPage.module.css";

export default function ManagerPage() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadManagers = useCallback(async () => {
    try {
      const { data } = await fetchManagers();
      setManagers(data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to access this page",
        );
        navigate("/");
      } else {
        toast.error("Failed to load managers");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadManagers();
  }, [loadManagers]);

  const openCreateModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (manager) => {
    setEditTarget(manager);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editTarget) {
        const { data } = await updateManager(editTarget._id, formData);
        setManagers((prev) => prev.map((m) => (m._id === data._id ? data : m)));
        toast.success("Manager updated successfully");
      } else {
        const { data } = await createManager(formData);
        setManagers((prev) => [data, ...prev]);
        toast.success("Manager created successfully");
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
      await deleteManager(deleteTarget._id);
      setManagers((prev) => prev.filter((m) => m._id !== deleteTarget._id));
      toast.success("Manager deleted successfully");
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
          <h2 className={styles.pageTitle}>Managers</h2>
          <p className={styles.pageSubtitle}>Manage field area managers</p>
        </div>
        <Button onClick={openCreateModal}>
          <MdAdd /> Add Manager
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : managers.length === 0 ? (
          <div className={styles.empty}>
            No managers found. Add one to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Pic</th>
                <th>Name</th>
                <th>Area</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m, i) => (
                <tr key={m._id}>
                  <td>{i + 1}</td>
                  <td>
                    {m.profilePic ? (
                      <img
                        src={`/uploads/${m.profilePic}`}
                        alt={m.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <FaUserCircle className={styles.thumbIcon} />
                    )}
                  </td>
                  <td>{m.name}</td>
                  <td>{m.area}</td>
                  <td>{m.mobile}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${m.isActive ? styles.active : styles.inactive}`}
                    >
                      {m.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(m)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(m)}
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
          title={editTarget ? "Edit Manager" : "Add Manager"}
          onClose={closeModal}
          wide
        >
          <ManagerForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Manager"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
