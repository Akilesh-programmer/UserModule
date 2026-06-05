import { useState } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import AddressFields from "./fields/AddressFields";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const buildInitialForm = (data) => ({
  name: data?.name || "",
  code: data?.code || "",
  contactPerson: data?.contactPerson || "",
  phone: data?.phone || "",
  email: data?.email || "",
  gstNo: data?.gstNo || "",
  panNo: data?.panNo || "",
  isActive: data ? String(data.isActive) : "true",
  countryId: data?.address?.countryId?._id || data?.address?.countryId || "",
  stateId: data?.address?.stateId?._id || data?.address?.stateId || "",
  cityId: data?.address?.cityId?._id || data?.address?.cityId || "",
  pincodeId: data?.address?.pincodeId?._id || data?.address?.pincodeId || "",
  areaId: data?.address?.areaId?._id || data?.address?.areaId || "",
  street: data?.address?.street || "",
});

export default function CompanyForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => buildInitialForm(initialData));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Company name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        contactPerson: form.contactPerson.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        gstNo: form.gstNo.trim(),
        panNo: form.panNo.trim(),
        isActive: form.isActive === "true",
        address: {
          countryId: form.countryId || null,
          stateId: form.stateId || null,
          cityId: form.cityId || null,
          pincodeId: form.pincodeId || null,
          areaId: form.areaId || null,
          street: form.street.trim(),
        },
      };
      await onSave(payload);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Company Info */}
        <div className="space-y-3">
          <FormSection title="Company Info">
            <div className="space-y-2">
              <InputField label="Company Name" required name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Enter company name" />
              <InputField label="Company Code" name="code" value={form.code} onChange={handleChange} placeholder="e.g. ABC" />
              <InputField label="Contact Person" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Contact person name" />
              <SelectField label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} placeholder="" />
            </div>
          </FormSection>
        </div>

        {/* Column 2: Contact & Documents */}
        <div className="space-y-3">
          <FormSection title="Contact & Documents">
            <div className="space-y-2">
              <InputField label="Phone" required name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="Phone number" />
              <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
              <InputField label="GST No" name="gstNo" value={form.gstNo} onChange={handleChange} placeholder="GST number" style={{ textTransform: "uppercase" }} />
              <InputField label="PAN No" name="panNo" value={form.panNo} onChange={handleChange} placeholder="PAN number" style={{ textTransform: "uppercase" }} />
            </div>
          </FormSection>
        </div>

        {/* Column 3: Address */}
        <div className="space-y-3">
          <FormSection title="Address">
            <div className="space-y-2 flex flex-col">
              <AddressFields form={form} onChange={handleChange} errors={errors} />
            </div>
          </FormSection>
        </div>
      </div>

      {errors.form && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 mt-4">{errors.form}</p>
      )}

      <div className="flex justify-between pt-4 mt-auto">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
