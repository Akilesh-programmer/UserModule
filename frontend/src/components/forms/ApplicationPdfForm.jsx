import { useState, useRef } from "react";
import TextAreaField from "../common/TextAreaField";
import SearchSelect from "../common/SearchSelect";
import Button from "../common/Button";
import FormSection from "../common/FormSection";

const FORM_TYPE_OPTIONS = [
  { value: "Application", label: "Application" },
  { value: "Terms & Condition", label: "Terms & Condition" },
  { value: "Warranty", label: "Warranty" },
  { value: "Return Policy", label: "Return Policy" },
];

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Inactive" },
];

export default function ApplicationPdfForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    formType: initialData?.formType || "",
    description: initialData?.description || "",
    isActive: initialData ? String(initialData.isActive) : "true",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState(initialData?.pdfFile || "");
  const fileRef = useRef(null);

  const validate = () => {
    const errs = {};
    if (!form.formType) errs.formType = "Form type is required";
    if (!pdfFile && !initialData?.pdfFile)
      errs.pdfFile = "PDF file is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", form: "" }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPdfFile(file);
      setPdfName(file.name);
      setErrors((prev) => ({ ...prev, pdfFile: "" }));
    }
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
      fd.append("formType", form.formType);
      fd.append("isActive", form.isActive);
      if (form.description.trim())
        fd.append("description", form.description.trim());
      if (pdfFile) fd.append("pdfFile", pdfFile);
      await onSave(fd);
    } catch (err) {
      setErrors({
        form: err.response?.data?.message || "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormSection title="Application & Terms PDF Details">
        <div className="space-y-2.5">
          <SearchSelect
            label="Form Type"
            required
            name="formType"
            options={FORM_TYPE_OPTIONS}
            value={form.formType}
            onChange={handleChange}
            error={errors.formType}
            placeholder="Select Form Type"
          />
          <TextAreaField
            label="Description"
            name="description"
            placeholder="Enter description (optional)"
            value={form.description}
            onChange={handleChange}
          />
          <div className="flex flex-col gap-0.5">
            <label className="text-xs font-semibold text-gray-600 tracking-wide">
              Upload PDF<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Choose File
              </button>
              <span className="text-sm text-gray-500 truncate max-w-[200px]">
                {pdfName || "No file chosen"}
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            {errors.pdfFile && (
              <span className="text-xs text-red-500 mt-0.5">
                {errors.pdfFile}
              </span>
            )}
            <p className="text-[10px] text-gray-400 mt-0.5">
              PDF only · Max 10MB
            </p>
          </div>
          <SearchSelect
            label="Status"
            name="isActive"
            options={STATUS_OPTIONS}
            value={form.isActive}
            onChange={handleChange}
          />
        </div>
      </FormSection>

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
