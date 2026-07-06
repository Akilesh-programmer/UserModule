import { useState } from "react";
import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";

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
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Packing Type Details">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Packing Type Name" required name="name" placeholder="Enter packing type name" value={form.name} onChange={handleChange} error={errors.name} />
          <InputField label="Units Per Pack" required name="unitsPerPack" type="number" min="1" placeholder="e.g. 12" value={form.unitsPerPack} onChange={handleChange} error={errors.unitsPerPack} />
          <SearchSelect label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} />
          <TextAreaField label="Description" name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />
        </div>
      </FormSection>
      <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
