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

const TAX_TYPE_OPTIONS = [
  { value: "GST", label: "GST" },
  { value: "IGST", label: "IGST" },
  { value: "CGST", label: "CGST" },
  { value: "SGST", label: "SGST" },
  { value: "VAT", label: "VAT" },
  { value: "CESS", label: "CESS" },
  { value: "OTHER", label: "OTHER" },
];

export default function TaxForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    taxType: initialData?.taxType || "",
    percentage: initialData?.percentage ?? "",
    description: initialData?.description || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.taxType) errs.taxType = "Tax type is required";
    if (form.percentage === "" || form.percentage === null) errs.percentage = "Percentage is required";
    else if (Number(form.percentage) < 0 || Number(form.percentage) > 100) errs.percentage = "Must be 0-100";
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
      await onSave({ ...form, percentage: Number(form.percentage), isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ taxType: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Tax Details">
        <div className="grid grid-cols-2 gap-3">
          <SearchSelect label="Tax Type" required name="taxType" options={TAX_TYPE_OPTIONS} value={form.taxType} onChange={handleChange} error={errors.taxType} placeholder="Select tax type" />
          <InputField label="Percentage (%)" required name="percentage" type="number" min="0" max="100" step="0.01" placeholder="e.g. 18" value={form.percentage} onChange={handleChange} error={errors.percentage} />
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
