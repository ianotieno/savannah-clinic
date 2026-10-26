
import type { Doctor } from "../../types";

type DoctorCardProps = {
  doctor: Doctor;
  appointmentCount: number;
  onBook: (doctorId: number) => void;
};

export default function DoctorCard({
  doctor,
  appointmentCount,
  onBook,
}: DoctorCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${doctor.color}`}
        >
          {doctor.initials}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {doctor.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{doctor.specialty}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-lg font-bold text-slate-900">
            {appointmentCount}
          </p>
          <p className="text-xs text-slate-500">Active appointments</p>
        </div>

        <button
          type="button"
          onClick={() => onBook(doctor.id)}
          className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
        >
          Book slot
        </button>
      </div>
    </div>
  );
}
