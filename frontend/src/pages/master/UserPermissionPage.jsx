import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchUsersForPermissions } from "../../api/userApi";
import { fetchPermissionByUser, savePermission } from "../../api/permissionApi";
import { useAuth } from "../../context/AuthContext";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import styles from "./MasterPage.module.css";
import permStyles from "./UserPermissionPage.module.css";

const FORMS = [
  { key: "userType", label: "User Type" },
  { key: "userCreation", label: "User Creation" },
  { key: "userPermission", label: "User Permission" },
];

const ACTIONS = ["create", "read", "update", "delete"];

const buildEmptyPermissions = () => ({
  userType: { create: false, read: false, update: false, delete: false },
  userCreation: { create: false, read: false, update: false, delete: false },
  userPermission: { create: false, read: false, update: false, delete: false },
});

export default function UserPermissionPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [permissions, setPermissions] = useState(buildEmptyPermissions());
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const { data } = await fetchUsersForPermissions();
      setUsers(
        data.filter(
          (u) =>
            u.userTypeId?.name !== "Admin" &&
            String(u._id) !== String(currentUser?.id),
        ),
      );
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to access this page",
        );
        navigate("/");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoadingUsers(false);
    }
  }, [currentUser?.id, navigate]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setPermissions(buildEmptyPermissions());
    if (!userId) return;
    setLoadingPerms(true);
    try {
      const { data } = await fetchPermissionByUser(userId);
      // Merge fetched permissions with empty defaults to ensure all keys exist
      const merged = buildEmptyPermissions();
      for (const form of FORMS) {
        for (const action of ACTIONS) {
          if (data.permissions?.[form.key]?.[action] === true) {
            merged[form.key][action] = true;
          }
        }
      }
      setPermissions(merged);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(
          err.response.data?.message ||
            "You are not allowed to access this page",
        );
        navigate("/");
      } else {
        toast.error("Failed to load permissions");
      }
    } finally {
      setLoadingPerms(false);
    }
  };

  const togglePermission = (formKey, action) => {
    setPermissions((prev) => ({
      ...prev,
      [formKey]: { ...prev[formKey], [action]: !prev[formKey][action] },
    }));
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
          <p className={styles.pageSubtitle}>
            Assign CRUD access per module to users
          </p>
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
                  <h4 className={permStyles.permHeading}>Module Permissions</h4>
                  {FORMS.map(({ key, label }) => (
                    <div key={key} className={permStyles.permSection}>
                      <p className={permStyles.permSectionTitle}>{label}</p>
                      <div className={permStyles.crudRow}>
                        {ACTIONS.map((action) => (
                          <label key={action} className={permStyles.crudItem}>
                            <input
                              type="checkbox"
                              checked={permissions[key]?.[action] === true}
                              onChange={() => togglePermission(key, action)}
                            />
                            <span>
                              {action.charAt(0).toUpperCase() + action.slice(1)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
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
