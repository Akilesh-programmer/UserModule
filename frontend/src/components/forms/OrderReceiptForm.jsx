import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import TextAreaField from "../common/TextAreaField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";
import { fetchActiveDealers } from "../../api/dealerApi";
import { fetchActiveGroups } from "../../api/groupApi";
import { fetchItems } from "../../api/itemApi";
import { fetchSchemes } from "../../api/schemeApi";
import { MdAdd, MdDelete } from "react-icons/md";

export default function OrderReceiptForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    orderDate: initialData?.orderDate ? new Date(initialData.orderDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    dealerId: initialData?.dealerId || "",
    schemeId: initialData?.schemeId || "",
    remarks: initialData?.remarks || "",
  });

  const [itemsList, setItemsList] = useState(
    initialData?.items?.map((it) => ({
      groupId: it.groupId?._id || it.groupId || "",
      itemId: it.itemId?._id || it.itemId || "",
      itemName: it.itemName || "",
      boxQuantity: it.boxQuantity ?? "",
      pieceQuantity: it.pieceQuantity ?? 0,
      boxPrice: it.boxPrice || 0,
      piecePrice: it.piecePrice || 0,
      itemsPerBox: it.itemsPerBox || 1,
    })) || [{ groupId: "", itemId: "", itemName: "", boxQuantity: "", pieceQuantity: 0, boxPrice: 0, piecePrice: 0, itemsPerBox: 1 }]
  );

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [allItems, setAllItems] = useState([]); // Client-side cache of items

  useEffect(() => {
    fetchActiveDealers().then((r) => setDealers(r.data || [])).catch(() => {});
    fetchActiveGroups().then((r) => setGroups(r.data || [])).catch(() => {});
    fetchSchemes({ activeOnly: "true" }).then((r) => setSchemes(r.data || [])).catch(() => {});
    fetchItems({ activeOnly: "true" }).then((r) => setAllItems(r.data || [])).catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.dealerId) errs.dealerId = "Dealer is required";
    
    const itemErrors = [];
    itemsList.forEach((item, index) => {
      const itemErr = {};
      if (!item.groupId) itemErr.groupId = "Group is required";
      if (!item.itemId) itemErr.itemId = "Item is required";
      if (item.boxQuantity === "" || Number(item.boxQuantity) < 0) itemErr.boxQuantity = "Box quantity is required";
      if (Number(item.pieceQuantity) < 0) itemErr.pieceQuantity = "Piece quantity must be >= 0";
      
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

  const handleRowChange = (index, name, value) => {
    const updated = [...itemsList];
    updated[index][name] = value;

    if (name === "groupId") {
      updated[index].itemId = "";
      updated[index].itemName = "";
      updated[index].boxPrice = 0;
      updated[index].piecePrice = 0;
      updated[index].itemsPerBox = 1;
    }

    if (name === "itemId") {
      const selectedItem = allItems.find((i) => i._id === value);
      if (selectedItem) {
        updated[index].itemName = selectedItem.itemName;
        updated[index].boxPrice = selectedItem.boxRate || 0;
        updated[index].piecePrice = selectedItem.itemPrice || 0;
        updated[index].itemsPerBox = selectedItem.itemsPerBox || 1;
      } else {
        updated[index].itemName = "";
        updated[index].boxPrice = 0;
        updated[index].piecePrice = 0;
        updated[index].itemsPerBox = 1;
      }
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
    setItemsList((prev) => [
      ...prev,
      { groupId: "", itemId: "", itemName: "", boxQuantity: "", pieceQuantity: 0, boxPrice: 0, piecePrice: 0, itemsPerBox: 1 },
    ]);
  };

  const removeRow = (index) => {
    if (itemsList.length === 1) return;
    setItemsList((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateGrandTotal = () => {
    return itemsList.reduce((acc, row) => {
      const boxesTotal = (Number(row.boxQuantity) || 0) * (row.boxPrice || 0);
      const piecesTotal = (Number(row.pieceQuantity) || 0) * (row.piecePrice || 0);
      return acc + boxesTotal + piecesTotal;
    }, 0);
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
          itemName: it.itemName,
          boxQuantity: Number(it.boxQuantity),
          pieceQuantity: Number(it.pieceQuantity),
          boxPrice: Number(it.boxPrice),
          piecePrice: Number(it.piecePrice),
          itemsPerBox: Number(it.itemsPerBox),
        })),
        schemeId: form.schemeId || null,
      };
      await onSave(payload);
    } catch (err) {
      setErrors({ form: err.response?.data?.message || "Failed to save order" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Order Header Info */}
        <div className="lg:col-span-1 space-y-4">
          <FormSection title="Order Details">
            <div className="space-y-3.5">
              <InputField
                label="Order Date"
                type="date"
                required
                name="orderDate"
                value={form.orderDate}
                onChange={handleChange}
                error={errors.orderDate}
              />
              {initialData?.orderNumber && (
                <div className="flex flex-col gap-0.5">
                  <label className="text-xs font-semibold text-gray-600">Order Number</label>
                  <div className="px-3 py-2 rounded-md border border-gray-200 bg-gray-50 text-sm text-gray-500 font-mono">
                    {initialData.orderNumber}
                  </div>
                </div>
              )}
              <SearchSelect
                label="Select Dealer"
                required
                name="dealerId"
                options={dealers.map((d) => ({ value: d._id, label: d.dealerName }))}
                value={form.dealerId}
                onChange={handleChange}
                error={errors.dealerId}
                placeholder="Choose Dealer"
              />
              <SearchSelect
                label="Select Scheme (Optional)"
                name="schemeId"
                options={schemes.map((s) => ({ value: s._id, label: s.schemeName }))}
                value={form.schemeId}
                onChange={handleChange}
                placeholder="Choose Scheme"
              />
              <TextAreaField
                label="Remarks"
                name="remarks"
                placeholder="Enter remarks (optional)"
                value={form.remarks}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </FormSection>
        </div>

        {/* Column 2 & 3: Order Items list */}
        <div className="lg:col-span-2 space-y-4">
          <FormSection title="Catalogue Items List">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Group</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">Boxes</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-20">Pcs</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Prices</th>
                    <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider w-24">Line Total</th>
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

                    const lineTotalCalculated =
                      (Number(row.boxQuantity) || 0) * (row.boxPrice || 0) +
                      (Number(row.pieceQuantity) || 0) * (row.piecePrice || 0);

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
                            name="boxQuantity"
                            type="number"
                            min="0"
                            placeholder="Qty"
                            value={row.boxQuantity}
                            onChange={(e) => handleRowChange(index, "boxQuantity", e.target.value)}
                            error={rowErrors.boxQuantity}
                          />
                        </td>
                        <td className="px-1.5 py-2">
                          <InputField
                            hideLabel
                            name="pieceQuantity"
                            type="number"
                            min="0"
                            placeholder="Loose"
                            value={row.pieceQuantity}
                            onChange={(e) => handleRowChange(index, "pieceQuantity", e.target.value)}
                            error={rowErrors.pieceQuantity}
                          />
                        </td>
                        <td className="px-2 py-3 text-xs text-gray-500 whitespace-nowrap leading-relaxed">
                          {row.itemId ? (
                            <>
                              <div>Box: ₹{(row.boxPrice || 0).toFixed(2)}</div>
                              <div>Pc: ₹{(row.piecePrice || 0).toFixed(2)} <span className="text-[10px] text-gray-400">({row.itemsPerBox}/bx)</span></div>
                            </>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5 text-right text-xs font-bold text-gray-900 font-mono">
                          ₹{lineTotalCalculated.toFixed(2)}
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

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <Button type="button" variant="secondary" size="sm" onClick={addRow} className="flex items-center gap-1">
                <MdAdd size={16} /> Add Row
              </Button>
              <div className="text-right">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mr-2">Grand Total:</span>
                <span className="text-lg font-extrabold text-gray-900 font-mono">
                  ₹{calculateGrandTotal().toFixed(2)}
                </span>
              </div>
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
          {initialData ? "Update" : "Place Order"}
        </Button>
      </div>
    </form>
  );
}
