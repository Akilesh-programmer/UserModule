import { useState } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function PackingTypeForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initialData?.name || "",
    unitsPerPack: initialData?.unitsPerPack ?? 1,
    description: initialData?.description || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.unitsPerPack || Number(form.unitsPerPack) < 1) errs.unitsPerPack = "Must be at least 1";
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
      await onSave({ ...form, unitsPerPack: Number(form.unitsPerPack), isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ name: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <InputField label="Name" required name="name" placeholder="Enter packing type name" value={form.name} onChange={handleChange} error={errors.name} />
      <InputField label="Units Per Pack" required name="unitsPerPack" type="number" min="1" placeholder="Enter units per pack" value={form.unitsPerPack} onChange={handleChange} error={errors.unitsPerPack} />
      <SelectField label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} placeholder="" />
      <InputField label="Description" name="description" placeholder="Enter description (optional)" value={form.description} onChange={handleChange} />
      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
