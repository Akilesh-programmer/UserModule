import { useState } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function UserCreationForm({
  initialData,
  userTypes,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    userTypeId: initialData?.userTypeId?._id || initialData?.userTypeId || "",
    username: initialData?.username || "",
    password: "",
    confirmPassword: "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.userTypeId) errs.userTypeId = "User type is required";
    if (!form.username.trim()) errs.username = "Username is required";
    if (!initialData && !form.password) errs.password = "Password is required";
    if (form.password) {
      if (form.password.length < 8) {
        errs.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(form.password)) {
        errs.password = "Password must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(form.password)) {
        errs.password = "Password must contain at least one number";
      }
    }
    if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, isActive: form.isActive === "true" };
      if (!payload.password) {
        delete payload.password;
        delete payload.confirmPassword;
      }
      await onSave(payload);
    } catch (err) {
      setErrors({ username: err.response?.data?.message || "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  const isStaffRecord =
    initialData?._type === "manager" || initialData?._type === "salesRep";

  const userTypeOptions = userTypes.map((ut) => ({
    value: ut._id,
    label: ut.name,
  }));

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <SelectField
        label="User Type"
        required
        name="userTypeId"
        options={userTypeOptions}
        value={form.userTypeId}
        onChange={handleChange}
        placeholder="Select user type"
        error={errors.userTypeId}
        disabled={isStaffRecord}
      />
      <InputField
        label="Username"
        required
        name="username"
        placeholder="Enter username"
        value={form.username}
        onChange={handleChange}
        error={errors.username}
        autoComplete="off"
      />
      <PasswordInput
        label={
          initialData
            ? "New Password (leave blank to keep current)"
            : "Password"
        }
        required={!initialData}
        name="password"
        placeholder={
          initialData ? "Leave blank to keep current" : "Enter password"
        }
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
      />
      <PasswordInput
        label="Confirm Password"
        required={!initialData}
        name="confirmPassword"
        placeholder="Confirm password"
        value={form.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
      <SelectField
        label="Status"
        name="isActive"
        options={STATUS_OPTIONS}
        value={form.isActive}
        onChange={handleChange}
        placeholder=""
      />
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
