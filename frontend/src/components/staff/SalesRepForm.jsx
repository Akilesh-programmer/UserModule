import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import { fetchActiveManagers } from "../../api/managerApi";
import styles from "./StaffForm.module.css";

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
  const fileInputRef = useRef(null);

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

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!MOBILE_RE.test(form.mobile)) errs.mobile = "Mobile must be 10 digits";
    if (!AADHAAR_RE.test(form.aadhaarNo))
      errs.aadhaarNo = "Aadhaar must be 12 digits";
    if (!PAN_RE.test(form.panCardNo))
      errs.panCardNo = "Invalid PAN format (e.g. ABCDE1234F)";
    if (!form.managerId) errs.managerId = "Manager is required";
    if (!initialData) {
      if (!form.username.trim()) errs.username = "Username is required";
      if (!form.password) {
        errs.password = "Password is required";
      } else if (form.password.length < 8) {
        errs.password = "Password must be at least 8 characters";
      } else if (!/[A-Z]/.test(form.password)) {
        errs.password = "Must contain at least one uppercase letter";
      } else if (!/[0-9]/.test(form.password)) {
        errs.password = "Must contain at least one number";
      }
      if (form.password && form.password !== form.confirmPassword)
        errs.confirmPassword = "Passwords do not match";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("mobile", form.mobile.trim());
      formData.append("aadhaarNo", form.aadhaarNo.trim());
      formData.append("drivingLicenseNo", form.drivingLicenseNo.trim());
      formData.append("panCardNo", form.panCardNo.trim());
      formData.append("managerId", form.managerId);
      formData.append("isActive", form.isActive);
      if (!initialData) {
        formData.append("username", form.username.trim());
        formData.append("password", form.password);
      }
      formData.append(
        "address",
        JSON.stringify({
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }),
      );
      if (picFile) formData.append("profilePic", picFile);
      await onSave(formData);
    } catch (err) {
      const msg =
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to save";
      setErrors({ form: msg });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Profile Picture</p>
        <div className={styles.profileSection}>
          {picPreview ? (
            <img
              src={picPreview}
              alt="Profile"
              className={styles.profilePreview}
            />
          ) : (
            <div className={styles.profilePlaceholder}>
              <FaUserCircle />
            </div>
          )}
          <label className={styles.profileUploadLabel}>
            <span className={styles.profileUploadBtn}>
              {picPreview ? "Change Photo" : "Upload Photo"}
            </span>
            <span className={styles.profileHint}>JPG, PNG · Max 5MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className={styles.profileInput}
              onChange={handlePicChange}
            />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Personal Info</p>
        <div className={styles.grid}>
          <InputField
            label="Full Name *"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter full name"
          />
          <InputField
            label="Mobile *"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            error={errors.mobile}
            placeholder="10-digit mobile number"
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
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Assign Manager</p>
        <div className={styles.grid}>
          <SelectField
            label="Filter by Area"
            value={areaFilter}
            onChange={handleAreaFilter}
            options={areaOptions}
            placeholder="All areas"
          />
          <SelectField
            label="Manager *"
            name="managerId"
            value={form.managerId}
            onChange={handleChange}
            options={managerOptions}
            error={errors.managerId}
            placeholder="Select manager"
          />
        </div>
      </div>

      {!initialData && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Login Credentials</p>
          <div className={styles.grid}>
            <InputField
              label="Username *"
              name="username"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Choose a username"
              autoComplete="off"
            />
            <InputField
              label="Password *"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              autoComplete="new-password"
            />
            <InputField
              label="Confirm Password *"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Repeat password"
              autoComplete="new-password"
            />
          </div>
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Documents</p>
        <div className={styles.grid}>
          <InputField
            label="Aadhaar No *"
            name="aadhaarNo"
            value={form.aadhaarNo}
            onChange={handleChange}
            error={errors.aadhaarNo}
            placeholder="12-digit Aadhaar"
            maxLength={12}
          />
          <InputField
            label="Driving License No"
            name="drivingLicenseNo"
            value={form.drivingLicenseNo}
            onChange={handleChange}
            error={errors.drivingLicenseNo}
            placeholder="DL number (optional)"
          />
          <InputField
            label="PAN Card No *"
            name="panCardNo"
            value={form.panCardNo}
            onChange={handleChange}
            error={errors.panCardNo}
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
            style={{ textTransform: "uppercase" }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionTitle}>Address</p>
        <div className={styles.grid}>
          <InputField
            label="Street"
            name="street"
            value={form.street}
            onChange={handleChange}
            placeholder="Street / Door No"
            wrapperClassName={styles.fullWidth}
          />
          <InputField
            label="City"
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
          />
          <InputField
            label="State"
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
          />
          <InputField
            label="Pincode"
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            maxLength={6}
          />
        </div>
      </div>

      {errors.form && <p className={styles.formError}>{errors.form}</p>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
