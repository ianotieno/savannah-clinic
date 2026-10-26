
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Users,
} from "lucide-react";

import type { Appointment, Doctor } from "../types";
import StatCard from "../components/dashboard/StatCard";
import DoctorCard from "../components/dashboard/DoctorCard";
import { formatDate, formatTime } from "../utils/date";

type DashboardPageProps = {
  doctors: Doctor[];
  appointments: Appointment[];
  onBookAppointment: (doctorId?: number) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onViewAppointments: () => void;
};

export default function DashboardPage({
  doctors,
  appointments,
  onBookAppointment,
  onCancelAppointment,
  onViewAppointments,
}: DashboardPageProps) {
  const today = new Date().toLocaleDateString("en-CA");

  const todaysAppointments = appointments.filter(
    (appointment) =>
      appointment.date === today &&
      appointment.status !== "Cancelled"
  );

  const upcomingCount = appointments.filter(
    (appointment) =>
      appointment.status === "Upcoming" &&
      appointment.date >= today
  ).length;

  const completedCount = appointments.filter(
    (appointment) => appointment.status === "Completed"
  ).length;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Good morning
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's your clinic overview for today.
          </p>
        </div>

        <p className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          {formatDate(today)}
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's appointments"
          value={todaysAppointments.length}
          subtitle="Scheduled for today"
          icon={CalendarDays}
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Upcoming appointments"
          value={upcomingCount}
          subtitle="All future bookings"
          icon={Clock3}
          iconClass="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Completed appointments"
          value={completedCount}
          subtitle="Marked as completed"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <StatCard
          title="Available doctors"
          value={doctors.length}
          subtitle="Doctors in the clinic"
          icon={Users}
          iconClass="bg-amber-50 text-amber-600"
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Today's appointments
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Patients scheduled to visit today.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAppointments}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            View all
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {todaysAppointments.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {todaysAppointments
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((appointment) => {
                  const doctor = doctors.find(
                    (item) => item.id === appointment.doctorId
                  );

                  return (
                    <div
                      key={appointment.id}
                      className="flex flex-wrap items-center justify-between gap-4 p-5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                          {appointment.patient
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {appointment.patient}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {doctor?.name ?? "Unknown doctor"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {appointment.reason}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
                          {formatTime(appointment.time)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onCancelAppointment(appointment)
                          }
                          className="text-sm font-medium text-rose-600 hover:text-rose-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Our doctors
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select a doctor to start a booking.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              appointmentCount={appointments.filter(
                (appointment) =>
                  appointment.doctorId === doctor.id &&
                  appointment.status === "Upcoming"
              ).length}
              onBook={() => onBookAppointment(doctor.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
