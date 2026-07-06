import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import ProfilePicUpload from "../common/ProfilePicUpload";
import AddressFields from "./fields/AddressFields";
import { fetchActiveManagers } from "../../api/managerApi";
import { fetchActiveMarkets } from "../../api/marketApi";
import { fetchActiveShopTypes } from "../../api/shopTypeApi";
import { fetchActiveSalesReps } from "../../api/salesRepApi";

const STATUS_OPTIONS = [
  { value: "true",  label: "Active" },
  { value: "false", label: "Inactive" },
];

const buildInitialForm = (data) => ({
  managerId:        data?.managerId?._id   || data?.managerId   || "",
  salesRepId:       data?.salesRepId?._id  || data?.salesRepId  || "",
  marketId:         data?.marketId?._id    || data?.marketId    || "",
  shopTypeId:       data?.shopTypeId?._id  || data?.shopTypeId  || "",
  dealerName:       data?.dealerName       || "",
  phoneNumber:      data?.phoneNumber      || "",
  whatsappNumber:   data?.whatsappNumber   || "",
  email:            data?.email            || "",
  panNo:            data?.panNo            || "",
  panName:          data?.panName          || "",
  gstNo:            data?.gstNo            || "",
  aadhaarNo:        data?.aadhaarNo        || "",
  drivingLicenseNo: data?.drivingLicenseNo || "",
  securityChequeNo: data?.securityChequeNo || "",
  isActive:         data ? String(data.isActive) : "true",
  countryId:  data?.address?.countryId?._id  || data?.address?.countryId  || "",
  stateId:    data?.address?.stateId?._id    || data?.address?.stateId    || "",
  cityId:     data?.address?.cityId?._id     || data?.address?.cityId     || "",
  pincodeId:  data?.address?.pincodeId?._id  || data?.address?.pincodeId  || "",
  areaId:     data?.address?.areaId?._id     || data?.address?.areaId     || "",
  street:     data?.address?.street          || "",
});

export default function DealerForm({ initialData, onSave, onCancel }) {
  const [form, setForm]       = useState(() => buildInitialForm(initialData));
  const [errors, setErrors]   = useState({});
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(
    initialData?.image ? `/uploads/${initialData.image}` : null,
  );
  const [saving, setSaving]     = useState(false);
  const [managers, setManagers] = useState([]);
  const [salesReps, setSalesReps] = useState([]);
  const [markets, setMarkets]   = useState([]);
  const [shopTypes, setShopTypes] = useState([]);

  useEffect(() => {
    fetchActiveManagers().then((r) => setManagers(r.data || [])).catch(() => {});
    fetchActiveSalesReps().then((r) => setSalesReps(r.data || [])).catch(() => {});
    fetchActiveMarkets().then((r)  => setMarkets(r.data   || [])).catch(() => {});
    fetchActiveShopTypes().then((r) => setShopTypes(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.dealerName.trim()) errs.dealerName  = "Dealer name is required";
    if (!form.phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    if (!form.marketId)           errs.marketId   = "Market is required";
    return errs;
  };

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
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("dealerName",       form.dealerName.trim());
      fd.append("phoneNumber",      form.phoneNumber.trim());
      fd.append("whatsappNumber",   form.whatsappNumber.trim());
      fd.append("email",            form.email.trim());
      if (form.managerId)   fd.append("managerId",   form.managerId);
      if (form.salesRepId)  fd.append("salesRepId",  form.salesRepId);
      if (form.shopTypeId)  fd.append("shopTypeId",  form.shopTypeId);
      fd.append("marketId",         form.marketId);
      fd.append("panNo",            form.panNo.trim());
      fd.append("panName",          form.panName.trim());
      fd.append("gstNo",            form.gstNo.trim());
      fd.append("aadhaarNo",        form.aadhaarNo.trim());
      fd.append("drivingLicenseNo", form.drivingLicenseNo.trim());
      fd.append("securityChequeNo", form.securityChequeNo.trim());
      fd.append("isActive",         form.isActive);
      fd.append("address", JSON.stringify({
        countryId: form.countryId  || null,
        stateId:   form.stateId    || null,
        cityId:    form.cityId     || null,
        pincodeId: form.pincodeId  || null,
        areaId:    form.areaId     || null,
        street:    form.street.trim(),
      }));
      if (picFile) fd.append("image", picFile);
      await onSave(fd);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  const managerOpts   = managers.map((m) => ({ value: m._id, label: m.name }));
  const salesRepOpts  = salesReps.map((s) => ({ value: s._id, label: s.name }));
  const marketOpts    = markets.map((m)   => ({ value: m._id, label: m.name }));
  const shopTypeOpts  = shopTypes.map((s) => ({ value: s._id, label: s.name }));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        <FormSection title="Dealer Info">
          <div className="space-y-1.5">
            <InputField label="Dealer Name" required name="dealerName" value={form.dealerName} onChange={handleChange} error={errors.dealerName} placeholder="Full dealer name" />
            <InputField label="Phone Number" required name="phoneNumber" value={form.phoneNumber} onChange={handleChange} error={errors.phoneNumber} placeholder="Phone number" />
            <InputField label="WhatsApp Number" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="WhatsApp number" />
            <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
            <SearchSelect label="Shop Type" name="shopTypeId" options={shopTypeOpts} value={form.shopTypeId} onChange={handleChange} placeholder="Select shop type" />
            <SearchSelect label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} />
          </div>
        </FormSection>

        <FormSection title="Assignments & Documents">
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <SearchSelect label="Market" required name="marketId" value={form.marketId} onChange={handleChange} options={marketOpts} error={errors.marketId} placeholder="Market" />
              <SearchSelect label="Manager" name="managerId" value={form.managerId} onChange={handleChange} options={managerOpts} placeholder="Manager" />
              <SearchSelect label="Sales Rep" name="salesRepId" value={form.salesRepId} onChange={handleChange} options={salesRepOpts} placeholder="Sales Rep" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <InputField label="PAN No"            name="panNo"            value={form.panNo}            onChange={handleChange} placeholder="PAN number" />
              <InputField label="PAN Name"           name="panName"          value={form.panName}          onChange={handleChange} placeholder="Name on PAN" />
              <InputField label="GST No"             name="gstNo"            value={form.gstNo}            onChange={handleChange} placeholder="GST number" />
              <InputField label="Aadhaar No"         name="aadhaarNo"        value={form.aadhaarNo}        onChange={handleChange} placeholder="12-digit Aadhaar" maxLength={12} />
              <InputField label="Driving License"    name="drivingLicenseNo" value={form.drivingLicenseNo} onChange={handleChange} placeholder="DL number" />
              <InputField label="Security Cheque No" name="securityChequeNo" value={form.securityChequeNo} onChange={handleChange} placeholder="Cheque number" />
            </div>
          </div>
        </FormSection>

        <FormSection title="Address & Photo">
          <div className="space-y-1.5">
            <AddressFields form={form} onChange={handleChange} errors={errors} />
            <ProfilePicUpload preview={picPreview} onChange={handlePicChange} />
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
