import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { fetchUsers } from "../../api/userApi";
import { fetchPermissionByUser, savePermission } from "../../api/permissionApi";
import { useAuth } from "../../context/AuthContext";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import styles from "./MasterPage.module.css";
import permStyles from "./UserPermissionPage.module.css";

const PERMISSION_KEYS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "master", label: "Master" },
  { key: "userType", label: "User Type" },
  { key: "userCreation", label: "User Creation" },
  { key: "userPermission", label: "User Permission" },
];

export default function UserPermissionPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissions, setPermissions] = useState({
    dashboard: false,
    master: false,
    userType: false,
    userCreation: false,
    userPermission: false,
  });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await fetchUsers();
      setUsers(
        data.filter(
          (u) =>
            u.userTypeId?.name !== "Admin" &&
            String(u._id) !== String(currentUser?.id),
        ),
      );
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const emptyPermissions = {
    dashboard: false,
    master: false,
    userType: false,
    userCreation: false,
    userPermission: false,
  };

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setPermissions(emptyPermissions);
    if (!userId) return;
    setLoadingPerms(true);
    try {
      const { data } = await fetchPermissionByUser(userId);
      setPermissions({ ...emptyPermissions, ...(data.permissions || {}) });
    } catch {
      toast.error("Failed to load permissions");
    } finally {
      setLoadingPerms(false);
    }
  };

  const togglePermission = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }
    setSaving(true);
    try {
      await savePermission({ userId: selectedUserId, permissions });
      toast.success("Permissions saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const userOptions = users.map((u) => ({ value: u._id, label: u.username }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>User Permission</h2>
          <p className={styles.pageSubtitle}>Assign module access to users</p>
        </div>
      </div>

      <div className={permStyles.card}>
        <div className={permStyles.selectSection}>
          <SelectField
            label="Select User"
            options={userOptions}
            value={selectedUserId}
            onChange={handleUserChange}
            placeholder={loadingUsers ? "Loading users..." : "Select a user..."}
            disabled={loadingUsers}
          />
        </div>

        {selectedUserId && (
          <>
            {loadingPerms ? (
              <div className={styles.loader}>Loading permissions...</div>
            ) : (
              <>
                <div className={permStyles.permList}>
                  <h4 className={permStyles.permHeading}>Module Access</h4>
                  {PERMISSION_KEYS.map(({ key, label }) => (
                    <label key={key} className={permStyles.permRow}>
                      <span className={permStyles.permLabel}>{label}</span>
                      <input
                        type="checkbox"
                        className={permStyles.checkbox}
                        checked={permissions[key] === true}
                        onChange={() => togglePermission(key)}
                      />
                    </label>
                  ))}
                </div>
                <div className={permStyles.saveSection}>
                  <Button onClick={handleSave} loading={saving}>
                    Save Permissions
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
