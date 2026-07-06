import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchUserTypes } from "../../api/userTypeApi";
import {
  fetchPermissionByUserType,
  savePermission,
} from "../../api/permissionApi";
import { useAuth } from "../../context/AuthContext";
import SearchSelect from "../../components/common/SearchSelect";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import PageHeader from "../../components/common/PageHeader";
import PermissionMatrix from "./PermissionMatrix";

const PERMISSION_MODULES = [
  { key: "userType", label: "User Types" },
  { key: "userCreation", label: "User Creation" },
  { key: "userPermission", label: "User Permission" },
  { key: "manager", label: "Managers" },
  { key: "salesRep", label: "Sales Reps" },
  { key: "country", label: "Countries" },
  { key: "state", label: "States" },
  { key: "city", label: "Cities" },
  { key: "pincode", label: "Pincodes" },
  { key: "area", label: "Areas" },
  { key: "market", label: "Markets" },
  { key: "dealer", label: "Dealers" },
  { key: "expenseType", label: "Expense Types" },
  { key: "company", label: "Companies" },
  { key: "shopType", label: "Shop Types" },
  { key: "category", label: "Categories" },
  { key: "group", label: "Groups" },
  { key: "tax", label: "Taxes" },
  { key: "unitOfMeasure", label: "Units of Measure" },
  { key: "packingType", label: "Packing Types" },
  { key: "item", label: "Items" },
];

const ACTIONS = ["create", "read", "update", "delete"];

const buildEmptyPermissions = () => {
  const perms = {};
  for (const mod of PERMISSION_MODULES) {
    perms[mod.key] = { create: false, read: false, update: false, delete: false };
  }
  return perms;
};

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
      setUserTypes(
        data.filter(
          (ut) => ut.name !== "Admin" && ut.name !== currentUser?.userType,
        ),
      );
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response.data?.message || "You are not allowed to access this page");
        navigate("/");
      } else {
        toast.error("Failed to load user types");
      }
    } finally {
      setLoadingUserTypes(false);
    }
  }, [navigate, currentUser?.userType]);

  useEffect(() => { loadUserTypes(); }, [loadUserTypes]);

  const handleUserTypeChange = async (e) => {
    const userTypeId = e.target.value;
    setSelectedUserTypeId(userTypeId);
    setPermissions(buildEmptyPermissions());
    if (!userTypeId) return;
    setLoadingPerms(true);
    try {
      const { data } = await fetchPermissionByUserType(userTypeId);
      const merged = buildEmptyPermissions();
      for (const mod of PERMISSION_MODULES) {
        for (const action of ACTIONS) {
          if (data.permissions?.[mod.key]?.[action] === true) {
            merged[mod.key][action] = true;
          }
        }
      }
      setPermissions(merged);
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error(err.response.data?.message || "You are not allowed to access this page");
        navigate("/");
      } else {
        toast.error("Failed to load permissions");
      }
    } finally {
      setLoadingPerms(false);
    }
  };

  const togglePermission = (moduleKey, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleKey]: { ...prev[moduleKey], [action]: !prev[moduleKey][action] },
    }));
  };

  // Select All for a specific action across ALL modules
  const handleSelectAll = (action) => {
    const allChecked = PERMISSION_MODULES.every(
      (mod) => permissions[mod.key]?.[action] === true,
    );
    setPermissions((prev) => {
      const next = { ...prev };
      for (const mod of PERMISSION_MODULES) {
        next[mod.key] = { ...next[mod.key], [action]: !allChecked };
      }
      return next;
    });
  };

  // Select All for a group of modules (all actions)
  const handleSelectGroup = (modules, value) => {
    setPermissions((prev) => {
      const next = { ...prev };
      for (const mod of modules) {
        next[mod.key] = { create: value, read: value, update: value, delete: value };
      }
      return next;
    });
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

  const userTypeOptions = userTypes.map((ut) => ({ value: ut._id, label: ut.name }));

  return (
    <div className="page-enter">
      <PageHeader
        title="User Permission"
        subtitle="Assign CRUD access per module to user types"
      />

      <div className="flex-1 min-h-0 rounded-xl bg-white p-6 shadow-card ring-1 ring-gray-100 flex flex-col overflow-hidden">
        {/* User type selector */}
        <div className="flex items-end gap-4 mb-4 pb-4 border-b border-gray-100 flex-shrink-0">
          <div className="w-72">
            <SearchSelect
              label="Select User Type"
              name="userTypeId"
              options={userTypeOptions}
              value={selectedUserTypeId}
              onChange={handleUserTypeChange}
              placeholder={loadingUserTypes ? "Loading..." : "Select a user type..."}
              disabled={loadingUserTypes}
            />
          </div>
          {selectedUserTypeId && !loadingPerms && (
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  const allOn = PERMISSION_MODULES.every((m) =>
                    ACTIONS.every((a) => permissions[m.key]?.[a])
                  );
                  setPermissions(() => {
                    const next = buildEmptyPermissions();
                    if (!allOn) {
                      for (const mod of PERMISSION_MODULES) {
                        next[mod.key] = { create: true, read: true, update: true, delete: true };
                      }
                    }
                    return next;
                  });
                }}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-button"
              >
                Select All Permissions
              </button>
              <button
                type="button"
                onClick={() => setPermissions(buildEmptyPermissions())}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {selectedUserTypeId && (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {loadingPerms ? (
              <Spinner />
            ) : (
              <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 flex-shrink-0">
                  Module Permissions
                </p>

                <div className="flex-1 min-h-0 overflow-y-auto modal-scroll">
                  <PermissionMatrix
                    permissions={permissions}
                    onToggle={togglePermission}
                    onSelectAll={handleSelectAll}
                    onSelectGroup={handleSelectGroup}
                  />
                </div>

                <div className="flex justify-end pt-2 border-t border-gray-100 flex-shrink-0">
                  <Button onClick={handleSave} loading={saving} size="lg">
                    Save Permissions
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
