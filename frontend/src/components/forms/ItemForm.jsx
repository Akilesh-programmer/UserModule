import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import SelectField from "../common/SelectField";
import Button from "../common/Button";
import { fetchActiveCategories } from "../../api/categoryApi";
import { fetchActiveGroups } from "../../api/groupApi";
import { fetchActiveTaxes } from "../../api/taxApi";
import { fetchActiveUoms } from "../../api/uomApi";
import { fetchActivePackingTypes } from "../../api/packingTypeApi";

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function ItemForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    categoryId: initialData?.categoryId?._id || initialData?.categoryId || "",
    groupId: initialData?.groupId?._id || initialData?.groupId || "",
    taxId: initialData?.taxId?._id || initialData?.taxId || "",
    uomId: initialData?.uomId?._id || initialData?.uomId || "",
    packingTypeId: initialData?.packingTypeId?._id || initialData?.packingTypeId || "",
    itemName: initialData?.itemName || "",
    itemCode: initialData?.itemCode || "",
    description: initialData?.description || "",
    itemPrice: initialData?.itemPrice ?? "",
    itemsPerBox: initialData?.itemsPerBox ?? "",
    boxRate: initialData?.boxRate ?? "",
    hsnCode: initialData?.hsnCode || "",
    minStockLevel: initialData?.minStockLevel ?? "",
    maxStockLevel: initialData?.maxStockLevel ?? "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [packingTypes, setPackingTypes] = useState([]);

  useEffect(() => {
    Promise.all([
      fetchActiveCategories().then((r) => setCategories(r.data || [])),
      fetchActiveGroups(form.categoryId || undefined).then((r) => setGroups(r.data || [])),
      fetchActiveTaxes().then((r) => setTaxes(r.data || [])),
      fetchActiveUoms().then((r) => setUoms(r.data || [])),
      fetchActivePackingTypes().then((r) => setPackingTypes(r.data || [])),
    ]).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.categoryId) {
      fetchActiveGroups(form.categoryId).then((r) => setGroups(r.data || [])).catch(() => {});
    } else {
      setGroups([]);
    }
  }, [form.categoryId]);

  const validate = () => {
    const errs = {};
    if (!form.categoryId) errs.categoryId = "Category is required";
    if (!form.groupId) errs.groupId = "Group is required";
    if (!form.taxId) errs.taxId = "Tax is required";
    if (!form.uomId) errs.uomId = "Unit of measure is required";
    if (!form.packingTypeId) errs.packingTypeId = "Packing type is required";
    if (!form.itemName.trim()) errs.itemName = "Item name is required";
    if (!form.itemCode.trim()) errs.itemCode = "Item code is required";
    if (form.itemPrice === "" || Number(form.itemPrice) < 0) errs.itemPrice = "Valid price is required";
    if (!form.itemsPerBox || Number(form.itemsPerBox) < 1) errs.itemsPerBox = "Must be at least 1";
    if (form.boxRate === "" || Number(form.boxRate) < 0) errs.boxRate = "Valid rate is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "categoryId") next.groupId = "";
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
      const payload = {
        ...form,
        itemCode: form.itemCode.toUpperCase(),
        itemPrice: Number(form.itemPrice),
        itemsPerBox: Number(form.itemsPerBox),
        boxRate: Number(form.boxRate),
        isActive: form.isActive === "true",
      };
      if (form.minStockLevel !== "") payload.minStockLevel = Number(form.minStockLevel);
      if (form.maxStockLevel !== "") payload.maxStockLevel = Number(form.maxStockLevel);
      await onSave(payload);
    } catch (err) {
      setErrors({ itemName: err.response?.data?.message || "Failed to save" });
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Classification (Dependencies)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField label="Category" required name="categoryId" options={categories.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))} value={form.categoryId} onChange={handleChange} error={errors.categoryId} placeholder="Select category" />
        <SelectField label="Group" required name="groupId" options={groups.map((g) => ({ value: g._id, label: `${g.name} (${g.code})` }))} value={form.groupId} onChange={handleChange} error={errors.groupId} placeholder="Select group" />
        <SelectField label="Tax" required name="taxId" options={taxes.map((t) => ({ value: t._id, label: `${t.taxType} (${t.percentage}%)` }))} value={form.taxId} onChange={handleChange} error={errors.taxId} placeholder="Select tax" />
        <SelectField label="Unit of Measure" required name="uomId" options={uoms.map((u) => ({ value: u._id, label: u.abbreviation }))} value={form.uomId} onChange={handleChange} error={errors.uomId} placeholder="Select UoM" />
        <SelectField label="Packing Type" required name="packingTypeId" options={packingTypes.map((p) => ({ value: p._id, label: p.name }))} value={form.packingTypeId} onChange={handleChange} error={errors.packingTypeId} placeholder="Select packing type" />
        <SelectField label="Status" name="isActive" options={STATUS_OPTIONS} value={form.isActive} onChange={handleChange} placeholder="" />
      </div>

      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Basic Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="Item Name" required name="itemName" placeholder="Enter item name" value={form.itemName} onChange={handleChange} error={errors.itemName} />
        <InputField label="Item Code" required name="itemCode" placeholder="Enter item code" value={form.itemCode} onChange={handleChange} error={errors.itemCode} />
        <InputField label="HSN Code" name="hsnCode" value={form.hsnCode} onChange={handleChange} placeholder="HSN code (optional)" />
      </div>
      <InputField label="Description" name="description" placeholder="Description (optional)" value={form.description} onChange={handleChange} />

      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">Pricing & Stock</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InputField label="Item Price" required name="itemPrice" type="number" min="0" step="0.01" value={form.itemPrice} onChange={handleChange} error={errors.itemPrice} />
        <InputField label="Items Per Box" required name="itemsPerBox" type="number" min="1" value={form.itemsPerBox} onChange={handleChange} error={errors.itemsPerBox} />
        <InputField label="Box Rate" required name="boxRate" type="number" min="0" step="0.01" value={form.boxRate} onChange={handleChange} error={errors.boxRate} />
        <InputField label="Min Stock Level" name="minStockLevel" type="number" min="0" value={form.minStockLevel} onChange={handleChange} />
        <InputField label="Max Stock Level" name="maxStockLevel" type="number" min="0" value={form.maxStockLevel} onChange={handleChange} />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" loading={saving}>{initialData ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
