import { useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import ImagePreviewModal from "./ImagePreviewModal";

export default function ProfilePicUpload({ preview, onChange }) {
  const inputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) onChange(file);
  };

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <>
          <img
            src={preview}
            alt="Profile"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200 cursor-pointer hover:ring-primary/40 transition-all"
            onClick={() => setShowPreview(true)}
            title="Click to preview"
          />
          {showPreview && (
            <ImagePreviewModal
              src={preview}
              alt="Profile Preview"
              onClose={() => setShowPreview(false)}
            />
          )}
        </>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <FaUserCircle size={40} />
        </div>
      )}
      <label className="cursor-pointer">
        <span className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          {preview ? "Change Photo" : "Upload Photo"}
        </span>
        <p className="mt-1 text-xs text-gray-400">JPG, PNG · Max 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
}
