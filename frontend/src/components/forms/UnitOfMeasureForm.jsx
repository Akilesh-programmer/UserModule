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

export default function UnitOfMeasureForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    abbreviation: initialData?.abbreviation || "",
    description: initialData?.description || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.abbreviation.trim()) errs.abbreviation = "Abbreviation is required";
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
      await onSave({ ...form, abbreviation: form.abbreviation.toUpperCase(), isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ abbreviation: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Unit of Measure Details">
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Abbreviation" required name="abbreviation" placeholder="e.g. KG, PCS, LTR" value={form.abbreviation} onChange={handleChange} error={errors.abbreviation} />
          <SearchSelect label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} />
          <TextAreaField label="Description" name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} wrapperClassName="col-span-2" />
        </div>
      </FormSection>
      <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
