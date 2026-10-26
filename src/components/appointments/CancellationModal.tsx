
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import type { Appointment } from "../../types";

type CancellationModalProps = {
  appointment: Appointment;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export default function CancellationModal({
  appointment,
  onClose,
  onConfirm,
}: CancellationModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!reason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }

    onConfirm(reason.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div className="flex gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Cancel appointment
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {appointment.patient}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close cancellation form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <p className="text-sm leading-6 text-slate-600">
            Cancelling this appointment will release the selected time
            slot for another patient.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Reason for cancellation
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
              placeholder="Enter the reason for cancellation"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-rose-400"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-rose-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Keep appointment
            </button>

            <button
              type="submit"
              className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
            >
              Confirm cancellation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
