import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import { fetchActiveCountries } from "../../api/countryApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function StateForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    countryId: initialData?.countryId?._id || initialData?.countryId || "",
    name: initialData?.name || "",
    code: initialData?.code || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    fetchActiveCountries().then((r) => setCountries(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.countryId) errs.countryId = "Country is required";
    if (!form.name.trim()) errs.name = "State name is required";
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
      <SelectField label="Country" required name="countryId" options={countries.map((c) => ({ value: c._id, label: c.name }))} value={form.countryId} onChange={handleChange} error={errors.countryId} placeholder="Select country" />
      <InputField label="State Name" required name="name" placeholder="Enter state name" value={form.name} onChange={handleChange} error={errors.name} />
      <InputField label="State Code" name="code" placeholder="Enter state code (optional)" value={form.code} onChange={handleChange} />
      <SelectField label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} placeholder="" />
      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
