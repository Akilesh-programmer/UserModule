import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import ProfilePicUpload from "../common/ProfilePicUpload";
import { fetchActiveGroups } from "../../api/groupApi";
import { fetchItems } from "../../api/itemApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function SchemeForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    schemeName: initialData?.schemeName || "",
    groupId: initialData?.groupId?._id || initialData?.groupId || "",
    hsnCode: initialData?.hsnCode || "",
    partNo: initialData?.partNo || "",
    itemId: initialData?.itemId?._id || initialData?.itemId || "",
    boxQuantity: initialData?.boxQuantity ?? "",
    isActive: initialData ? String(initialData.isActive) : "true",
    description: initialData?.description || "",
    specialSchemeDealer: initialData?.specialSchemeDealer || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(
    initialData?.productImage ? `/uploads/${initialData.productImage}` : null,
  );

  useEffect(() => {
    fetchActiveGroups().then((r) => setGroups(r.data || [])).catch(() => {});
    fetchItems().then((r) => setItems(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.schemeName.trim()) errs.schemeName = "Scheme name is required";
    if (!form.groupId) errs.groupId = "Group is required";
    if (!form.itemId) errs.itemId = "Item is required";
    if (!form.boxQuantity || Number(form.boxQuantity) < 1)
      errs.boxQuantity = "Must be at least 1";
    if (!form.specialSchemeDealer.trim())
      errs.specialSchemeDealer = "Special scheme dealer is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "groupId") next.itemId = "";
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handlePicChange = (file) => {
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
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
      const fd = new FormData();
      fd.append("schemeName", form.schemeName.trim());
      fd.append("groupId", form.groupId);
      fd.append("itemId", form.itemId);
      fd.append("boxQuantity", form.boxQuantity);
      fd.append("specialSchemeDealer", form.specialSchemeDealer.trim());
      fd.append("isActive", form.isActive);
      if (form.hsnCode.trim()) fd.append("hsnCode", form.hsnCode.trim());
      if (form.partNo.trim()) fd.append("partNo", form.partNo.trim());
      if (form.description.trim())
        fd.append("description", form.description.trim());
      if (picFile) fd.append("productImage", picFile);
      await onSave(fd);
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  const groupOpts = groups.map((g) => ({
    value: g._id,
    label: `${g.name} (${g.code})`,
  }));

  const filteredItems = form.groupId
    ? items.filter((i) => (i.groupId?._id || i.groupId) === form.groupId)
    : items;

  const itemOpts = filteredItems.map((i) => ({
    value: i._id,
    label: `${i.itemName} (${i.itemCode})`,
  }));

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSection title="Scheme Details">
          <div className="space-y-2.5">
            <InputField
              label="Scheme Name"
              required
              name="schemeName"
              placeholder="Enter scheme name"
              value={form.schemeName}
              onChange={handleChange}
              error={errors.schemeName}
            />
            <SearchSelect
              label="Group Name"
              required
              name="groupId"
              options={groupOpts}
              value={form.groupId}
              onChange={handleChange}
              error={errors.groupId}
              placeholder="Select Group"
            />
            <InputField
              label="HSN Code"
              name="hsnCode"
              placeholder="HSN code (optional)"
              value={form.hsnCode}
              onChange={handleChange}
            />
            <InputField
              label="Part No"
              name="partNo"
              placeholder="Part number (optional)"
              value={form.partNo}
              onChange={handleChange}
            />
            <SearchSelect
              label="Item Name"
              required
              name="itemId"
              options={itemOpts}
              value={form.itemId}
              onChange={handleChange}
              error={errors.itemId}
              placeholder="Select Item"
            />
            <InputField
              label="Box Quantity"
              required
              name="boxQuantity"
              type="number"
              min="1"
              placeholder="e.g. 10"
              value={form.boxQuantity}
              onChange={handleChange}
              error={errors.boxQuantity}
            />
            <InputField
              label="Special Scheme Dealer"
              required
              name="specialSchemeDealer"
              placeholder="Enter special scheme dealer"
              value={form.specialSchemeDealer}
              onChange={handleChange}
              error={errors.specialSchemeDealer}
            />
            <SearchSelect
              label="Status"
              name="isActive"
              options={STATUS_OPTIONS}
              value={form.isActive}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        <FormSection title="Media & Description">
          <div className="space-y-2.5">
            <ProfilePicUpload
              preview={picPreview}
              onChange={handlePicChange}
            />
            <TextAreaField
              label="Description"
              name="description"
              placeholder="Enter description (optional)"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </FormSection>
      </div>

      {errors.form && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 mt-4">
          {errors.form}
        </p>
      )}

      <div className="flex justify-between pt-4 mt-4 border-t border-gray-100">
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
