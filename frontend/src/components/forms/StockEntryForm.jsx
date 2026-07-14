import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import { fetchActiveSalesReps } from "../../api/salesRepApi";
import { fetchActiveDealers } from "../../api/dealerApi";
import { fetchActiveGroups } from "../../api/groupApi";
import { fetchItems } from "../../api/itemApi";
import { MdAdd, MdDelete } from "react-icons/md";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

export default function StockEntryForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    stockDate: initialData?.stockDate ? new Date(initialData.stockDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    salesRepId: initialData?.salesRepId || "",
    dealerIds: initialData?.dealerIds || [],
    status: initialData?.status || "active",
    remarks: initialData?.remarks || "",
  });

  const [itemsList, setItemsList] = useState(
    initialData?.items?.map((it) => ({
      groupId: it.groupId?._id || it.groupId || "",
      itemId: it.itemId?._id || it.itemId || "",
      boxes: it.boxes ?? "",
      loosePieces: it.loosePieces ?? 0,
      itemsPerBox: it.itemsPerBox || 1,
    })) || [{ groupId: "", itemId: "", boxes: "", loosePieces: 0, itemsPerBox: 1 }]
  );

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [salesReps, setSalesReps] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [allItems, setAllItems] = useState([]); // Client-side cache of active items

  useEffect(() => {
    fetchActiveSalesReps().then((r) => setSalesReps(r.data || [])).catch(() => {});
    fetchActiveGroups().then((r) => setGroups(r.data || [])).catch(() => {});
    fetchItems({ activeOnly: "true" }).then((r) => setAllItems(r.data || [])).catch(() => {});
  }, []);

  // Fetch dealers when sales rep changes
  useEffect(() => {
    if (form.salesRepId) {
      fetchActiveDealers({ salesRepId: form.salesRepId })
        .then((r) => setDealers(r.data || []))
        .catch(() => {});
    } else {
      setDealers([]);
    }
  }, [form.salesRepId]);

  const validate = () => {
    const errs = {};
    if (!form.salesRepId) errs.salesRepId = "Sales Rep is required";
    if (!form.dealerIds || form.dealerIds.length === 0) errs.dealerIds = "At least one Dealer must be selected";
    
    // Validate sub-table items
    const itemErrors = [];
    itemsList.forEach((item, index) => {
      const itemErr = {};
      if (!item.groupId) itemErr.groupId = "Group is required";
      if (!item.itemId) itemErr.itemId = "Item is required";
      if (item.boxes === "" || Number(item.boxes) < 0) itemErr.boxes = "Boxes count is required";
      if (Number(item.loosePieces) < 0) itemErr.loosePieces = "Loose pieces must be >= 0";
      
      if (Object.keys(itemErr).length) {
        itemErrors[index] = itemErr;
      }
    });

    if (itemErrors.length) {
      errs.items = itemErrors;
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDealerToggle = (dealerId) => {
    setForm((prev) => {
      const isSelected = prev.dealerIds.includes(dealerId);
      const nextDealers = isSelected
        ? prev.dealerIds.filter((id) => id !== dealerId)
        : [...prev.dealerIds, dealerId];
      return { ...prev, dealerIds: nextDealers };
    });
    setErrors((prev) => ({ ...prev, dealerIds: "" }));
  };

  const handleRowChange = (index, name, value) => {
    const updated = [...itemsList];
    updated[index][name] = value;

    if (name === "groupId") {
      // Reset itemId when group changes
      updated[index].itemId = "";
      updated[index].itemsPerBox = 1;
    }

    if (name === "itemId") {
      // Auto-populate itemsPerBox
      const selectedItem = allItems.find((i) => i._id === value);
      updated[index].itemsPerBox = selectedItem ? selectedItem.itemsPerBox : 1;
    }

    setItemsList(updated);
    setErrors((prev) => {
      const nextErrs = { ...prev };
      if (nextErrs.items && nextErrs.items[index]) {
        delete nextErrs.items[index][name];
        if (Object.keys(nextErrs.items[index]).length === 0) {
          delete nextErrs.items[index];
        }
      }
      return nextErrs;
    });
  };

  const addRow = () => {
    setItemsList((prev) => [...prev, { groupId: "", itemId: "", boxes: "", loosePieces: 0, itemsPerBox: 1 }]);
  };

  const removeRow = (index) => {
    if (itemsList.length === 1) return;
    setItemsList((prev) => prev.filter((_, i) => i !== index));
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
      const payload = {
        ...form,
        items: itemsList.map((it) => ({
          groupId: it.groupId,
          itemId: it.itemId,
          boxes: Number(it.boxes),
          loosePieces: Number(it.loosePieces),
          itemsPerBox: Number(it.itemsPerBox),
        })),
      };
      await onSave(payload);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to save stock entry" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Header Information */}
        <div className="lg:col-span-1 space-y-4">
          <FormSection title="Header Details">
            <div className="space-y-3.5">
              <InputField
                label="Stock Entry Date"
                type="date"
                required
                name="stockDate"
                value={form.stockDate}
                onChange={handleChange}
                error={errors.stockDate}
              />
              {initialData?.stockNumber && (
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-semibold text-gray-600">Stock Number</label>
                  <div className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-500 font-mono">
                    {initialData.stockNumber}
                  </div>
                </div>
              )}
              <SearchSelect
                label="Sales Rep"
                required
                name="salesRepId"
                options={salesReps.map((s) => ({ value: s._id, label: s.name }))}
                value={form.salesRepId}
                onChange={handleChange}
                error={errors.salesRepId}
                placeholder="Select Sales Rep"
              />
              <SearchSelect
                label="Status"
                name="status"
                options={STATUS_OPTIONS}
                value={form.status}
                onChange={handleChange}
              />
              <TextAreaField
                label="Remarks"
                name="remarks"
                placeholder="Enter remarks (optional)"
                value={form.remarks}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </FormSection>

          <FormSection title="Assigned Dealers">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 tracking-wide">
                Select Dealers<span className="text-red-500 ml-0.5">*</span>
              </label>
              {form.salesRepId === "" ? (
                <span className="text-xs text-gray-400 italic">Please select a Sales Rep first to load dealers</span>
              ) : dealers.length === 0 ? (
                <span className="text-xs text-amber-500 font-medium">No dealers assigned to this Sales Rep</span>
              ) : (
                <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg p-2.5 space-y-2 bg-gray-50/50">
                  {dealers.map((d) => (
                    <label key={d._id} className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form.dealerIds.includes(d._id)}
                        onChange={() => handleDealerToggle(d._id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4"
                      />
                      <span>{d.dealerName}</span>
                    </label>
                  ))}
                </div>
              )}
              {errors.dealerIds && (
                <span className="text-xs text-red-500 font-medium">{errors.dealerIds}</span>
              )}
            </div>
          </FormSection>
        </div>

        {/* Column 2 & 3: Stock Items Sub-table */}
        <div className="lg:col-span-2">
          <FormSection title="Stock Items Catalogue">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">Boxes</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">Pcs</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">Pcs/Box</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Total Pcs</th>
                    <th className="px-2 py-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {itemsList.map((row, index) => {
                    const rowErrors = errors.items?.[index] || {};
                    const groupItemOpts = row.groupId
                      ? allItems
                          .filter((i) => (i.groupId?._id || i.groupId) === row.groupId)
                          .map((i) => ({ value: i._id, label: i.itemName }))
                      : [];

                    const totalPiecesCalculated = (Number(row.boxes) || 0) * (row.itemsPerBox || 1) + (Number(row.loosePieces) || 0);

                    return (
                      <tr key={index} className="align-top hover:bg-gray-50/50">
                        <td className="px-1.5 py-2">
                          <SearchSelect
                            hideLabel
                            name="groupId"
                            options={groups.map((g) => ({ value: g._id, label: g.name }))}
                            value={row.groupId}
                            onChange={(e) => handleRowChange(index, "groupId", e.target.value)}
                            error={rowErrors.groupId}
                            placeholder="Group"
                          />
                        </td>
                        <td className="px-1.5 py-2">
                          <SearchSelect
                            hideLabel
                            name="itemId"
                            options={groupItemOpts}
                            value={row.itemId}
                            onChange={(e) => handleRowChange(index, "itemId", e.target.value)}
                            error={rowErrors.itemId}
                            placeholder="Select Item"
                            disabled={!row.groupId}
                          />
                        </td>
                        <td className="px-1.5 py-2">
                          <InputField
                            hideLabel
                            name="boxes"
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={row.boxes}
                            onChange={(e) => handleRowChange(index, "boxes", e.target.value)}
                            error={rowErrors.boxes}
                          />
                        </td>
                        <td className="px-1.5 py-2">
                          <InputField
                            hideLabel
                            name="loosePieces"
                            type="number"
                            min="0"
                            placeholder="Loose"
                            value={row.loosePieces}
                            onChange={(e) => handleRowChange(index, "loosePieces", e.target.value)}
                            error={rowErrors.loosePieces}
                          />
                        </td>
                        <td className="px-3 py-3.5 text-center text-xs font-mono text-gray-500">
                          {row.itemsPerBox}
                        </td>
                        <td className="px-3 py-3.5 text-right text-xs font-bold text-gray-900 font-mono">
                          {totalPiecesCalculated.toLocaleString("en-IN")}
                        </td>
                        <td className="px-2 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(index)}
                            disabled={itemsList.length === 1}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <MdDelete size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-start mt-3">
              <Button type="button" variant="secondary" size="sm" onClick={addRow} className="flex items-center gap-1">
                <MdAdd size={16} /> Add Row
              </Button>
            </div>
          </FormSection>
        </div>
      </div>

      {errors.form && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 mt-4 font-semibold">
          {errors.form}
        </p>
      )}

      <div className="flex justify-between pt-4 mt-6 border-t border-gray-100">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {initialData ? "Update" : "Save Stock Entry"}
        </Button>
      </div>
    </form>
  );
}
