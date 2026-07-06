import { useState } from "react";
import InputField from "../common/InputField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import ProfilePicUpload from "../common/ProfilePicUpload";
import AddressFields from "./fields/AddressFields";
import DocumentFields from "./fields/DocumentFields";
import CredentialFields from "./fields/CredentialFields";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

const MOBILE_RE = /^\d{10}$/;

const buildInitialForm = (data) => ({
  name: data?.name || "",
  mobile: data?.mobile || "",
  email: data?.email || "",
  aadhaarNo: data?.aadhaarNo || "",
  drivingLicenseNo: data?.drivingLicenseNo || "",
  panCardNo: data?.panCardNo || "",
  isActive: data ? String(data.isActive) : "true",
  username: "",
  password: "",
  confirmPassword: "",
  countryId: data?.address?.countryId?._id || data?.address?.countryId || "",
  stateId: data?.address?.stateId?._id || data?.address?.stateId || "",
  cityId: data?.address?.cityId?._id || data?.address?.cityId || "",
  pincodeId: data?.address?.pincodeId?._id || data?.address?.pincodeId || "",
  areaId: data?.address?.areaId?._id || data?.address?.areaId || "",
  street: data?.address?.street || "",
});

const validate = (form, isEdit) => {
  const errs = {};
  if (!form.name.trim()) errs.name = "Name is required";
  if (!MOBILE_RE.test(form.mobile)) errs.mobile = "Mobile must be 10 digits";
  if (!isEdit) {
    if (!form.username.trim()) errs.username = "Username is required";
    if (!form.password) {
      errs.password = "Password is required";
    } else if (form.password.length < 8) {
      errs.password = "Min 8 characters";
    } else if (!/[A-Z]/.test(form.password)) {
      errs.password = "Must include an uppercase letter";
    } else if (!/[0-9]/.test(form.password)) {
      errs.password = "Must include a number";
    }
    if (form.password && form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
  }
  return errs;
};

export default function ManagerForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => buildInitialForm(initialData));
  const [errors, setErrors] = useState({});
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(
    initialData?.profilePic ? `/uploads/${initialData.profilePic}` : null,
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handlePicChange = (file) => {
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, !!initialData);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("mobile", form.mobile.trim());
      fd.append("email", form.email.trim());
      fd.append("aadhaarNo", form.aadhaarNo.trim());
      fd.append("drivingLicenseNo", form.drivingLicenseNo.trim());
      fd.append("panCardNo", form.panCardNo.trim());
      fd.append("isActive", form.isActive);
      if (!initialData) {
        fd.append("username", form.username.trim());
        fd.append("password", form.password);
      }
      fd.append("address", JSON.stringify({
        countryId: form.countryId || null,
        stateId: form.stateId || null,
        cityId: form.cityId || null,
        pincodeId: form.pincodeId || null,
        areaId: form.areaId || null,
        street: form.street.trim(),
      }));
      if (picFile) fd.append("profilePic", picFile);
      await onSave(fd);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Column 1: Personal Info */}
        <FormSection title="Personal Info">
          <div className="space-y-1.5">
            <InputField label="Full Name" required name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Enter full name" />
            <InputField label="Mobile" required name="mobile" value={form.mobile} onChange={handleChange} error={errors.mobile} placeholder="10-digit number" maxLength={10} />
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
            <SearchSelect label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} />
            {!initialData && (
              <>
                <div className="pt-0.5 border-t border-gray-100">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Login Credentials</p>
                </div>
                <CredentialFields form={form} errors={errors} onChange={handleChange} />
              </>
            )}
          </div>
        </FormSection>

        {/* Column 2: Address */}
        <FormSection title="Address & Area">
          <AddressFields form={form} onChange={handleChange} errors={errors} />
        </FormSection>

        {/* Column 3: Documents & Picture */}
        <FormSection title="Documents & Photo">
          <div className="space-y-1.5">
            <DocumentFields form={form} errors={errors} onChange={handleChange} />
            <div className="pt-1">
              <ProfilePicUpload preview={picPreview} onChange={handlePicChange} />
            </div>
          </div>
        </FormSection>
      </div>

      {errors.form && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 mt-4">{errors.form}</p>
      )}

      <div className="flex justify-between pt-3 mt-3 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
