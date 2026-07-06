import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import { fetchActiveStates } from "../../api/stateApi";
import { fetchActiveCities } from "../../api/cityApi";
import { fetchActivePincodes } from "../../api/pincodeApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function AreaForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    stateId: initialData?.stateId?._id || initialData?.stateId || "",
    cityId: initialData?.cityId?._id || initialData?.cityId || "",
    pincodeId: initialData?.pincodeId?._id || initialData?.pincodeId || "",
    name: initialData?.name || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [pincodes, setPincodes] = useState([]);

  useEffect(() => {
    fetchActiveStates().then((r) => setStates(r.data || [])).catch((err) => console.error("Failed to load states:", err));
  }, []);

  useEffect(() => {
    if (form.stateId) {
      fetchActiveCities(form.stateId).then((r) => setCities(r.data || [])).catch((err) => console.error("Failed to load cities:", err));
    } else { setCities([]); }
  }, [form.stateId]);

  useEffect(() => {
    if (form.cityId) {
      fetchActivePincodes(form.cityId).then((r) => setPincodes(r.data || [])).catch((err) => console.error("Failed to load pincodes:", err));
    } else { setPincodes([]); }
  }, [form.cityId]);

  const validate = () => {
    const errs = {};
    if (!form.stateId) errs.stateId = "State is required";
    if (!form.cityId) errs.cityId = "City is required";
    if (!form.pincodeId) errs.pincodeId = "Pincode is required";
    if (!form.name.trim()) errs.name = "Area name is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "stateId") { next.cityId = ""; next.pincodeId = ""; }
      if (name === "cityId") { next.pincodeId = ""; }
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
      await onSave({ ...form, isActive: form.isActive === "true" });
    } catch (err) {
      setErrors({ name: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Area Details">
        <div className="grid grid-cols-2 gap-3">
          <SearchSelect label="State" required name="stateId" options={states.map((s) => ({ value: s._id, label: s.name }))} value={form.stateId} onChange={handleChange} error={errors.stateId} placeholder="Select state" />
          <SearchSelect label="City / District" required name="cityId" options={cities.map((c) => ({ value: c._id, label: c.name }))} value={form.cityId} onChange={handleChange} error={errors.cityId} placeholder="Select city" />
          <SearchSelect label="Pincode" required name="pincodeId" options={pincodes.map((p) => ({ value: p._id, label: p.code }))} value={form.pincodeId} onChange={handleChange} error={errors.pincodeId} placeholder="Select pincode" />
          <InputField label="Area Name" required name="name" placeholder="Enter area name" value={form.name} onChange={handleChange} error={errors.name} />
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
