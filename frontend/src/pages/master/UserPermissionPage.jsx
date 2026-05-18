import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchUserTypes } from "../../api/userTypeApi";
import {
  fetchPermissionByUserType,
  savePermission,
} from "../../api/permissionApi";
import { useAuth } from "../../context/AuthContext";
import SelectField from "../../components/common/SelectField";
import Button from "../../components/common/Button";
import styles from "./MasterPage.module.css";
import permStyles from "./UserPermissionPage.module.css";

const FORMS = [
  { key: "userType", label: "User Type" },
  { key: "userCreation", label: "User Creation" },
  { key: "userPermission", label: "User Permission" },
  { key: "manager", label: "Manager" },
  { key: "salesRep", label: "Sales Rep" },
];

const ACTIONS = ["create", "read", "update", "delete"];

const buildEmptyPermissions = () => ({
  userType: { create: false, read: false, update: false, delete: false },
  userCreation: { create: false, read: false, update: false, delete: false },
  userPermission: { create: false, read: false, update: false, delete: false },
  manager: { create: false, read: false, update: false, delete: false },
  salesRep: { create: false, read: false, update: false, delete: false },
});

export default function UserPermissionPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserTypeId, setSelectedUserTypeId] = useState("");
  const [permissions, setPermissions] = useState(buildEmptyPermissions());
  const [loadingUserTypes, setLoadingUserTypes] = useState(true);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadUserTypes = useCallback(async () => {
    try {
      const { data } = await fetchUserTypes();
      // Exclude Admin and the current user's own type (can't edit own permissions)
      setUserTypes(
        data.filter(
          (ut) => ut.name !== "Admin" && ut.name !== currentUser?.userType,
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
        toast.error("Failed to load user types");
      }
    } finally {
      setLoadingUserTypes(false);
    }
  }, [navigate, currentUser?.userType]);

  useEffect(() => {
    loadUserTypes();
  }, [loadUserTypes]);

  const handleUserTypeChange = async (e) => {
    const userTypeId = e.target.value;
    setSelectedUserTypeId(userTypeId);
    setPermissions(buildEmptyPermissions());
    if (!userTypeId) return;
    setLoadingPerms(true);
    try {
      const { data } = await fetchPermissionByUserType(userTypeId);
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
    if (!selectedUserTypeId) {
      toast.error("Please select a user type");
      return;
    }
    setSaving(true);
    try {
      await savePermission({ userTypeId: selectedUserTypeId, permissions });
      toast.success("Permissions saved successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const userTypeOptions = userTypes.map((ut) => ({
    value: ut._id,
    label: ut.name,
  }));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.pageTitle}>User Permission</h2>
          <p className={styles.pageSubtitle}>
            Assign CRUD access per module to user types (you cannot edit your
            own type's permissions)
          </p>
        </div>
      </div>

      <div className={permStyles.card}>
        <div className={permStyles.selectSection}>
          <SelectField
            label="Select User Type"
            options={userTypeOptions}
            value={selectedUserTypeId}
            onChange={handleUserTypeChange}
            placeholder={
              loadingUserTypes
                ? "Loading user types..."
                : "Select a user type..."
            }
            disabled={loadingUserTypes}
          />
        </div>

        {selectedUserTypeId && (
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
