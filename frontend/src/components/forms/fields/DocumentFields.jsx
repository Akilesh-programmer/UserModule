import InputField from "../../common/InputField";

export default function DocumentFields({ form, errors, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <InputField
        label="Aadhaar No *"
        name="aadhaarNo"
        value={form.aadhaarNo}
        onChange={onChange}
        error={errors.aadhaarNo}
        placeholder="12-digit Aadhaar"
        maxLength={12}
      />
      <InputField
        label="Driving License No"
        name="drivingLicenseNo"
        value={form.drivingLicenseNo}
        onChange={onChange}
        placeholder="DL number (optional)"
      />
      <InputField
        label="PAN Card No *"
        name="panCardNo"
        value={form.panCardNo}
        onChange={onChange}
        error={errors.panCardNo}
        placeholder="e.g. ABCDE1234F"
        maxLength={10}
        style={{ textTransform: "uppercase" }}
      />
    </div>
  );
}
