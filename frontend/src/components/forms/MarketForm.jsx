import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import { fetchActiveCountries } from "../../api/countryApi";
import { fetchActiveStates } from "../../api/stateApi";
import { fetchActiveCities } from "../../api/cityApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function MarketForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    countryId: initialData?.stateId?.countryId?._id || initialData?.stateId?.countryId || "",
    stateId: initialData?.stateId?._id || initialData?.stateId || "",
    districtId: initialData?.districtId?._id || initialData?.districtId || "",
    name: initialData?.name || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchActiveCountries().then((r) => setCountries(r.data || [])).catch((err) => console.error("Failed to load countries:", err));
  }, []);

  useEffect(() => {
    if (form.countryId) {
      fetchActiveStates(form.countryId).then((r) => setStates(r.data || [])).catch((err) => console.error("Failed to load states:", err));
    } else { setStates([]); }
  }, [form.countryId]);

  useEffect(() => {
    if (form.stateId) {
      fetchActiveCities(form.stateId).then((r) => setCities(r.data || [])).catch((err) => console.error("Failed to load cities:", err));
    } else { setCities([]); }
  }, [form.stateId]);

  const validate = () => {
    const errs = {};
    if (!form.stateId) errs.stateId = "State is required";
    if (!form.districtId) errs.districtId = "District is required";
    if (!form.name.trim()) errs.name = "Market name is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "countryId") { next.stateId = ""; next.districtId = ""; }
      if (name === "stateId") next.districtId = "";
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSave({ stateId: form.stateId, districtId: form.districtId, name: form.name.trim(), isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ name: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Market Details">
        <div className="grid grid-cols-2 gap-3">
          <SearchSelect label="Country" name="countryId" options={countries.map((c) => ({ value: c._id, label: c.name }))} value={form.countryId} onChange={handleChange} placeholder="Select country" />
          <SearchSelect label="State" required name="stateId" options={states.map((s) => ({ value: s._id, label: s.name }))} value={form.stateId} onChange={handleChange} error={errors.stateId} placeholder="Select state" />
          <SearchSelect label="District" required name="districtId" options={cities.map((c) => ({ value: c._id, label: c.name }))} value={form.districtId} onChange={handleChange} error={errors.districtId} placeholder="Select district" />
          <InputField label="Market Name" required name="name" placeholder="Enter market name" value={form.name} onChange={handleChange} error={errors.name} />
          <SearchSelect label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} />
        </div>
      </FormSection>

      <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
