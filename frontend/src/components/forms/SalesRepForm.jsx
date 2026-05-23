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
const AADHAAR_RE = /^\d{12}$/;
const PAN_RE = /^[A-Z]{5}\d{4}[A-Z]$/;

const buildInitialForm = (data) => ({
  name: data?.name || "",
  mobile: data?.mobile || "",
  aadhaarNo: data?.aadhaarNo || "",
  drivingLicenseNo: data?.drivingLicenseNo || "",
  panCardNo: data?.panCardNo || "",
  managerId: data?.managerId?._id || data?.managerId || "",
  isActive: data ? String(data.isActive) : "true",
  username: "",
  password: "",
  confirmPassword: "",
  street: data?.address?.street || "",
  city: data?.address?.city || "",
  state: data?.address?.state || "",
  pincode: data?.address?.pincode || "",
});

const validate = (form, isEdit) => {
  const errs = {};
  if (!form.name.trim()) errs.name = "Name is required";
  if (!MOBILE_RE.test(form.mobile)) errs.mobile = "Mobile must be 10 digits";
  if (!AADHAAR_RE.test(form.aadhaarNo))
    errs.aadhaarNo = "Aadhaar must be 12 digits";
  if (!form.drivingLicenseNo.trim())
    errs.drivingLicenseNo = "Driving license is required";
  if (!PAN_RE.test(form.panCardNo))
    errs.panCardNo = "Invalid PAN format (e.g. ABCDE1234F)";
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
  const [areaFilter, setAreaFilter] = useState("");

  useEffect(() => {
    fetchActiveManagers()
      .then((res) => setManagers(res.data))
      .catch(() => {});
  }, []);

  const areas = [...new Set(managers.map((m) => m.area).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
  const filteredManagers = areaFilter
    ? managers.filter((m) => m.area === areaFilter)
    : managers;
  const managerOptions = filteredManagers.map((m) => ({
    value: m._id,
    label: `${m.name} (${m.area})`,
  }));
  const areaOptions = areas.map((a) => ({ value: a, label: a }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handleAreaFilter = (e) => {
    setAreaFilter(e.target.value);
    setForm((prev) => ({ ...prev, managerId: "" }));
  };

  const handlePicChange = (file) => {
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form, !!initialData);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("mobile", form.mobile.trim());
      fd.append("aadhaarNo", form.aadhaarNo.trim());
      fd.append("drivingLicenseNo", form.drivingLicenseNo.trim());
      fd.append("panCardNo", form.panCardNo.trim());
      fd.append("managerId", form.managerId);
      fd.append("isActive", form.isActive);
      if (!initialData) {
        fd.append("username", form.username.trim());
        fd.append("password", form.password);
      }
      fd.append(
        "address",
        JSON.stringify({
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }),
      );
      if (picFile) fd.append("profilePic", picFile);
      await onSave(fd);
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.errors?.[0]?.msg ||
          err.response?.data?.message ||
          "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormSection title="Profile Picture">
        <ProfilePicUpload preview={picPreview} onChange={handlePicChange} />
      </FormSection>

      <FormSection title="Personal Info">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <InputField
            label="Full Name"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter full name"
          />
          <InputField
            label="Mobile"
            required
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            error={errors.mobile}
            placeholder="10-digit number"
            maxLength={10}
          />
          <SelectField
            label="Status"
            name="isActive"
            options={STATUS_OPTIONS}
            value={form.isActive}
            onChange={handleChange}
            placeholder=""
          />
        </div>
      </FormSection>

      <FormSection title="Assign Manager">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="Filter by Area"
            value={areaFilter}
            onChange={handleAreaFilter}
            options={areaOptions}
            placeholder="All areas"
          />
          <SelectField
            label="Manager"
            required
            name="managerId"
            value={form.managerId}
            onChange={handleChange}
            options={managerOptions}
            error={errors.managerId}
            placeholder="Select manager"
            wrapperClassName="sm:col-span-2"
          />
        </div>
      </FormSection>

      {!initialData && (
        <FormSection title="Login Credentials">
          <CredentialFields
            form={form}
            errors={errors}
            onChange={handleChange}
          />
        </FormSection>
      )}

      <FormSection title="Documents">
        <DocumentFields form={form} errors={errors} onChange={handleChange} />
      </FormSection>

      <FormSection title="Address">
        <AddressFields form={form} onChange={handleChange} />
      </FormSection>

      {errors.form && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
          {errors.form}
        </p>
      )}

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
