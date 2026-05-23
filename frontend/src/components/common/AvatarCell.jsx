import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import ImagePreviewModal from "./ImagePreviewModal";

export default function AvatarCell({ src, alt }) {
  const [preview, setPreview] = useState(false);
  const imgUrl = src ? `/uploads/${src}` : null;

  if (imgUrl) {
    return (
      <>
        <img
          src={imgUrl}
          alt={alt}
          className="h-8 w-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all"
          onClick={() => setPreview(true)}
        />
        {preview && (
          <ImagePreviewModal
            src={imgUrl}
            alt={alt}
            onClose={() => setPreview(false)}
          />
        )}
      </>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <FaUserCircle size={20} />
    </div>
  );
}
