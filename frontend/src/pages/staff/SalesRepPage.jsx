import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaUserCircle } from "react-icons/fa";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import {
  fetchSalesReps,
  createSalesRep,
  updateSalesRep,
  deleteSalesRep,
} from "../../api/salesRepApi";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import SalesRepForm from "../../components/staff/SalesRepForm";
import styles from "./StaffPage.module.css";

export default function SalesRepPage() {
  const navigate = useNavigate();
  const [salesReps, setSalesReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSalesReps = useCallback(async () => {
    try {
      const { data } = await fetchSalesReps();
      setSalesReps(data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to access this page",
        );
        navigate("/");
      } else {
        toast.error("Failed to load sales reps");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadSalesReps();
  }, [loadSalesReps]);

  const openCreateModal = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEditModal = (rep) => {
    setEditTarget(rep);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editTarget) {
        const { data } = await updateSalesRep(editTarget._id, formData);
        setSalesReps((prev) =>
          prev.map((r) => (r._id === data._id ? data : r)),
        );
        toast.success("Sales rep updated successfully");
      } else {
        const { data } = await createSalesRep(formData);
        setSalesReps((prev) => [data, ...prev]);
        toast.success("Sales rep created successfully");
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
      await deleteSalesRep(deleteTarget._id);
      setSalesReps((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      toast.success("Sales rep deleted successfully");
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
          <h2 className={styles.pageTitle}>Sales Representatives</h2>
          <p className={styles.pageSubtitle}>Manage sales representatives</p>
        </div>
        <Button onClick={openCreateModal}>
          <MdAdd /> Add Sales Rep
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        {loading ? (
          <div className={styles.loader}>Loading...</div>
        ) : salesReps.length === 0 ? (
          <div className={styles.empty}>
            No sales reps found. Add one to get started.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Pic</th>
                <th>Name</th>
                <th>Manager</th>
                <th>Mobile</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesReps.map((r, i) => (
                <tr key={r._id}>
                  <td>{i + 1}</td>
                  <td>
                    {r.profilePic ? (
                      <img
                        src={`/uploads/${r.profilePic}`}
                        alt={r.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <FaUserCircle className={styles.thumbIcon} />
                    )}
                  </td>
                  <td>{r.name}</td>
                  <td>
                    {r.managerId
                      ? `${r.managerId.name} (${r.managerId.area})`
                      : "—"}
                  </td>
                  <td>{r.mobile}</td>
                  <td>
                    <span
                      className={`${styles.badge} ${r.isActive ? styles.active : styles.inactive}`}
                    >
                      {r.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.iconBtn}
                        onClick={() => openEditModal(r)}
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        className={`${styles.iconBtn} ${styles.danger}`}
                        onClick={() => setDeleteTarget(r)}
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
          title={editTarget ? "Edit Sales Rep" : "Add Sales Rep"}
          onClose={closeModal}
          wide
        >
          <SalesRepForm
            initialData={editTarget}
            onSave={handleSave}
            onCancel={closeModal}
          />
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Sales Rep"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
