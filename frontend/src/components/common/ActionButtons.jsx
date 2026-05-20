import { MdEdit, MdDelete } from "react-icons/md";

export default function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={onEdit}
        title="Edit"
        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
      >
        <MdEdit size={17} />
      </button>
      <button
        onClick={onDelete}
        title="Delete"
        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
      >
        <MdDelete size={17} />
      </button>
    </div>
  );
}
