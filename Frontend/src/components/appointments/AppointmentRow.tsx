
import { RefreshCw, XCircle } from "lucide-react";

import type { Appointment, Doctor } from "../../types";
import { formatDate, formatTime } from "../../utils/date";

type AppointmentRowProps = {
  appointment: Appointment;
  doctor?: Doctor;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
};

export default function AppointmentRow({
  appointment,
  doctor,
  onCancel,
  onReschedule,
}: AppointmentRowProps) {
  const statusStyles: Record<Appointment["status"], string> = {
    Upcoming: "bg-blue-50 text-blue-700",
    Completed: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-rose-50 text-rose-700",
  };

  const initials = appointment.patient
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
            {initials}
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              {appointment.patient}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {appointment.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="font-medium text-slate-800">
          {doctor?.name ?? "Unknown doctor"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {doctor?.specialty ?? ""}
        </p>
      </td>

      <td className="whitespace-nowrap px-5 py-4">
        <p className="text-slate-800">
          {formatDate(appointment.date)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {formatTime(appointment.time)}
        </p>
      </td>

      <td className="max-w-48 px-5 py-4 text-slate-600">
        {appointment.reason}
        {appointment.status === "Cancelled" &&
          appointment.cancellationReason && (
            <p className="mt-1 text-xs text-rose-600">
              Cancellation: {appointment.cancellationReason}
            </p>
          )}
      </td>

      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[appointment.status]}`}
        >
          {appointment.status}
        </span>
      </td>

      <td className="px-5 py-4">
        {appointment.status === "Upcoming" ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Reschedule appointment"
              aria-label={`Reschedule ${appointment.patient}'s appointment`}
              onClick={() => onReschedule(appointment)}
              className="text-blue-600 transition hover:text-blue-800"
            >
              <RefreshCw size={17} />
            </button>

            <button
              type="button"
              title="Cancel appointment"
              aria-label={`Cancel ${appointment.patient}'s appointment`}
              onClick={() => onCancel(appointment)}
              className="text-rose-600 transition hover:text-rose-800"
            >
              <XCircle size={17} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            No actions
          </span>
        )}
      </td>
    </tr>
  );
}
