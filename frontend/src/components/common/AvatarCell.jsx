import { FaUserCircle } from "react-icons/fa";

export default function AvatarCell({ src, alt }) {
  if (src) {
    return (
      <img
        src={`/uploads/${src}`}
        alt={alt}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400">
      <FaUserCircle size={20} />
    </div>
  );
}
