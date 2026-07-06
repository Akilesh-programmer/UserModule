import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import { fetchActiveCategories } from "../../api/categoryApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function GroupForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    categoryId: initialData?.categoryId?._id || initialData?.categoryId || "",
    name: initialData?.name || "",
    code: initialData?.code || "",
    description: initialData?.description || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchActiveCategories().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.categoryId) errs.categoryId = "Category is required";
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.code.trim()) errs.code = "Code is required";
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
      await onSave({ ...form, code: form.code.toUpperCase(), isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ name: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  const categoryOptions = categories.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Group Details">
        <div className="grid grid-cols-2 gap-3">
          <SearchSelect label="Category" required name="categoryId" options={categoryOptions} value={form.categoryId} onChange={handleChange} error={errors.categoryId} placeholder="Select a category" className="col-span-2" />
          <InputField label="Group Name" required name="name" placeholder="Enter group name" value={form.name} onChange={handleChange} error={errors.name} />
          <InputField label="Group Code" required name="code" placeholder="Enter group code" value={form.code} onChange={handleChange} error={errors.code} />
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
