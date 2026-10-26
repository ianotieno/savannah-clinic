
import { Stethoscope } from "lucide-react";

import type { Appointment, Doctor } from "../types";
import DoctorCard from "../components/dashboard/DoctorCard";

type DoctorsPageProps = {
  doctors: Doctor[];
  appointments: Appointment[];
  onBookAppointment: (doctorId?: number) => void;
};

export default function DoctorsPage({
  doctors,
  appointments,
  onBookAppointment,
}: DoctorsPageProps) {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Our doctors
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Browse the medical team and book an appointment.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <Stethoscope size={18} className="text-blue-600" />
          <span>{doctors.length} doctors</span>
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Stethoscope
            size={32}
            className="mx-auto text-slate-400"
          />
          <h2 className="mt-4 font-semibold text-slate-800">
            No doctors available
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Doctors will appear here when they are added to the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const appointmentCount = appointments.filter(
              (appointment) =>
                appointment.doctorId === doctor.id &&
                appointment.status === "Upcoming" &&
                appointment.date >=
                  new Date().toLocaleDateString("en-CA")
            ).length;

            return (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                appointmentCount={appointmentCount}
                onBook={() => onBookAppointment(doctor.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
