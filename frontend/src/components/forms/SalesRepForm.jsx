import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import ProfilePicUpload from "../common/ProfilePicUpload";
import AddressFields from "./fields/AddressFields";
import DocumentFields from "./fields/DocumentFields";
import CredentialFields from "./fields/CredentialFields";
import { fetchActiveManagers } from "../../api/managerApi";

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
  managerId: data?.managerId?._id || data?.managerId || "",
  isActive: data ? String(data.isActive) : "true",
  username: "",
  password: "",
  confirmPassword: "",
  stateId: data?.address?.stateId?._id || data?.address?.stateId || "",
  cityId: data?.address?.cityId?._id || data?.address?.cityId || "",
  pincodeId: data?.address?.pincodeId?._id || data?.address?.pincodeId || "",
  areaId: data?.address?.areaId?._id || data?.address?.areaId || "",
  street: data?.address?.street || "",
});

const validate = (form, isEdit) => {
  const errs = {};
  if (!form.name.trim()) errs.name = "Sales Rep Name is required";
  if (!MOBILE_RE.test(form.mobile)) errs.mobile = "Mobile must be 10 digits";
  if (!form.managerId) errs.managerId = "Manager is required";
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

export default function SalesRepForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState(() => buildInitialForm(initialData));
  const [errors, setErrors] = useState({});
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(
    initialData?.profilePic ? `/uploads/${initialData.profilePic}` : null,
  );
  const [saving, setSaving] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchActiveManagers().then((res) => setManagers(res.data)).catch(() => {});
  }, []);

  const managerOptions = managers.map((m) => ({ value: m._id, label: m.name }));

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
      fd.append("managerId", form.managerId);
      fd.append("isActive", form.isActive);
      if (!initialData) {
        fd.append("username", form.username.trim());
        fd.append("password", form.password);
      }
      fd.append("address", JSON.stringify({
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Column 1: Manager & Personal Info & Credentials */}
        <div className="space-y-3">
          <FormSection title="Assign Manager">
            <div className="space-y-2">
              <SelectField label="Manager" required name="managerId" value={form.managerId} onChange={handleChange} options={managerOptions} error={errors.managerId} placeholder="Select manager" />
            </div>
          </FormSection>

          <FormSection title="Personal Info">
            <div className="space-y-2">
              <InputField label="Sales Rep Name" required name="name" value={form.name} onChange={handleChange} error={errors.name} placeholder="Enter sales rep name" />
              <InputField label="Mobile" required name="mobile" value={form.mobile} onChange={handleChange} error={errors.mobile} placeholder="10-digit number" maxLength={10} />
              <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
              <SelectField label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} placeholder="" />
            </div>
          </FormSection>

          {!initialData && (
            <FormSection title="Login Credentials">
              <div className="space-y-2">
                <CredentialFields form={form} errors={errors} onChange={handleChange} />
              </div>
            </FormSection>
          )}
        </div>

        {/* Column 2: Address */}
        <div className="space-y-3">
          <FormSection title="Address & Area">
            <div className="space-y-2 flex flex-col">
              <AddressFields form={form} onChange={handleChange} errors={errors} />
            </div>
          </FormSection>
        </div>

        {/* Column 3: Documents & Profile Pic */}
        <div className="space-y-3">
          <FormSection title="Documents">
            <div className="space-y-2">
              <DocumentFields form={form} errors={errors} onChange={handleChange} />
            </div>
          </FormSection>

          <FormSection title="Profile Picture">
            <ProfilePicUpload preview={picPreview} onChange={handlePicChange} />
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
