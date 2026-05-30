import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import { fetchActiveStates } from "../../api/stateApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function CityForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    stateId: initialData?.stateId?._id || initialData?.stateId || "",
    name: initialData?.name || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [states, setStates] = useState([]);

  useEffect(() => {
    fetchActiveStates().then((r) => setStates(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.stateId) errs.stateId = "State is required";
    if (!form.name.trim()) errs.name = "City name is required";
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
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({ ...form, isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ name: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <SelectField label="State" required name="stateId" options={states.map((s) => ({ value: s._id, label: s.name }))} value={form.stateId} onChange={handleChange} error={errors.stateId} placeholder="Select state" />
      <InputField label="City / District Name" required name="name" placeholder="Enter city name" value={form.name} onChange={handleChange} error={errors.name} />
      <SelectField label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} placeholder="" />
      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
