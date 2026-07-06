import { MdWarningAmber } from "react-icons/md";
import Button from "./Button";

export default function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-modal p-6 animate-scale-in">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-danger/10 flex items-center justify-center">
            <MdWarningAmber size={28} className="text-danger" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Confirm Action</h3>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={onConfirm}
              loading={loading}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
