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
    <div>
      <PageHeader
        title="User Permission"
        subtitle="Assign CRUD access per module to user types"
      />

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
        <div className="max-w-xs">
          <SelectField
            label="Select User Type"
            options={userTypeOptions}
            value={selectedUserTypeId}
            onChange={handleUserTypeChange}
            placeholder={
              loadingUserTypes ? "Loading..." : "Select a user type..."
            }
            disabled={loadingUserTypes}
          />
        </div>

        {selectedUserTypeId && (
          <>
            {loadingPerms ? (
              <Spinner />
            ) : (
              <div className="mt-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Module Permissions
                </p>

                <PermissionMatrix
                  permissions={permissions}
                  onToggle={togglePermission}
                />

                <div className="flex justify-end pt-2">
                  <Button onClick={handleSave} loading={saving}>
                    Save Permissions
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
