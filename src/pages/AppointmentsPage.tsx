
import { CalendarPlus } from "lucide-react";

import type { Appointment, Doctor } from "../types";
import AppointmentRow from "../components/appointments/AppointmentRow";

type AppointmentsPageProps = {
  appointments: Appointment[];
  doctors: Doctor[];
  onBookAppointment: () => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onRescheduleAppointment: (appointment: Appointment) => void;
};

export default function AppointmentsPage({
  appointments,
  doctors,
  onBookAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
}: AppointmentsPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Appointments
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage your clinic appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={onBookAppointment}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <CalendarPlus size={18} />
          Book appointment
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Patient</th>
              <th className="px-5 py-4 font-semibold">Doctor</th>
              <th className="px-5 py-4 font-semibold">Date &amp; time</th>
              <th className="px-5 py-4 font-semibold">Reason</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {appointments.map((appointment) => {
              const doctor = doctors.find(
                (item) => item.id === appointment.doctorId
              );

              return (
                <AppointmentRow
                  key={appointment.id}
                  appointment={appointment}
                  doctor={doctor}
                  onCancel={onCancelAppointment}
                  onReschedule={onRescheduleAppointment}
                />
              );
            })}
          </tbody>
        </table>

        {appointments.length === 0 && (
          <p className="p-10 text-center text-sm text-slate-500">
            No appointments found.
          </p>
        )}
      </div>
    </section>
  );
}
