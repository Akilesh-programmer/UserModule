import { useState } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import styles from "./MasterForm.module.css";

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
    description: initialData?.description || "",
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
    if (form.password && form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
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
      const message = err.response?.data?.message || "Failed to save";
      setErrors({ username: message });
    } finally {
      setSaving(false);
    }
  };

  const userTypeOptions = userTypes.map((ut) => ({
    value: ut._id,
    label: ut.name,
  }));

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <SelectField
        label="User Type"
        name="userTypeId"
        options={userTypeOptions}
        value={form.userTypeId}
        onChange={handleChange}
        placeholder="Select user type"
        error={errors.userTypeId}
      />
      <InputField
        label="Username"
        name="username"
        placeholder="Enter username"
        value={form.username}
        onChange={handleChange}
        error={errors.username}
        autoComplete="off"
      />
      <InputField
        label={
          initialData
            ? "New Password (leave blank to keep current)"
            : "Password"
        }
        name="password"
        type="password"
        placeholder={
          initialData ? "Leave blank to keep current" : "Enter password"
        }
        value={form.password}
        onChange={handleChange}
        error={errors.password}
        autoComplete="new-password"
      />
      <InputField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
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
      <InputField
        label="Description"
        name="description"
        placeholder="Enter description (optional)"
        value={form.description}
        onChange={handleChange}
      />
      <div className={styles.actions}>
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
