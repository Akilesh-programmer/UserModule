import { MdEdit, MdDelete } from "react-icons/md";

export default function ActionButtons({ onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button
          onClick={onEdit}
          title="Edit"
          className="group flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-all duration-150"
        >
          <MdEdit size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          title="Delete"
          className="group flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition-all duration-150"
        >
          <MdDelete size={16} className="group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
