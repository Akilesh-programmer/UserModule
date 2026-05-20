import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function useCrudPage({
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  entityName,
}) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const { data } = await fetchFn();
      setItems(data);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to access this page",
        );
        navigate("/");
      } else {
        toast.error(`Failed to load ${entityName}`);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFn, navigate, entityName]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreate = () => {
    setEditTarget(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditTarget(item);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditTarget(null);
  }, []);

  const handleSave = useCallback(
    async (formData) => {
      try {
        if (editTarget) {
          const { data } = await updateFn(editTarget._id, formData);
          setItems((prev) => prev.map((i) => (i._id === data._id ? data : i)));
          toast.success(`${entityName} updated successfully`);
        } else {
          const { data } = await createFn(formData);
          setItems((prev) => [data, ...prev]);
          toast.success(`${entityName} created successfully`);
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
    },
    [editTarget, createFn, updateFn, entityName, closeModal],
  );

  const handleDelete = useCallback(async () => {
    setDeleteLoading(true);
    try {
      await deleteFn(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      toast.success(`${entityName} deleted successfully`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteFn, deleteTarget, entityName]);

  return {
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
  };
}
