
import { useState } from "react";
import { X } from "lucide-react";

import type { Appointment, Doctor } from "../../types";
import { getAvailableSlots } from "../../utils/availability";

type BookingModalProps = {
  doctors: Doctor[];
  appointments: Appointment[];
  selectedDoctorId?: number;
  appointmentToEdit?: Appointment | null;
  onClose: () => void;
  onSubmit: (appointment: Appointment) => void;
};

export default function BookingModal({
  doctors,
  appointments,
  selectedDoctorId,
  appointmentToEdit,
  onClose,
  onSubmit,
}: BookingModalProps) {
  const [patient, setPatient] = useState(
    appointmentToEdit?.patient ?? ""
  );

  const [email, setEmail] = useState(
    appointmentToEdit?.email ?? ""
  );

  const [doctorId, setDoctorId] = useState(
    appointmentToEdit?.doctorId ??
      selectedDoctorId ??
      doctors[0]?.id ??
      0
  );

  const [date, setDate] = useState(
    appointmentToEdit?.date ??
      new Date().toLocaleDateString("en-CA")
  );

  const [time, setTime] = useState(
    appointmentToEdit?.time ?? ""
  );

  const [reason, setReason] = useState(
    appointmentToEdit?.reason ?? ""
  );

  const [error, setError] = useState("");

  const availableSlots = getAvailableSlots(
    doctorId,
    date,
    appointments,
    appointmentToEdit?.id
  );

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (
      !patient.trim() ||
      !email.trim() ||
      !reason.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!validEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!date) {
      setError("Please select an appointment date.");
      return;
    }

    if (!time || !availableSlots.includes(time)) {
      setError(
        "Please select a time slot that is still available."
      );
      return;
    }

    const appointment: Appointment = {
      // The parent component assigns an ID to new appointments.
      // When rescheduling, preserve the existing ID.
      id: appointmentToEdit?.id ?? 0,
      patient: patient.trim(),
      email: email.trim(),
      doctorId,
      date,
      time,
      reason: reason.trim(),
      status: "Upcoming",
    };

    onSubmit(appointment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {appointmentToEdit
                ? "Reschedule appointment"
                : "Book appointment"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Appointments last 30 minutes.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking form"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <div>
            <label
              htmlFor="patient"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Patient name
            </label>

            <input
              id="patient"
              type="text"
              required
              value={patient}
              onChange={(event) => {
                setPatient(event.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter patient's full name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="patient@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="doctor"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Doctor
            </label>

            <select
              id="doctor"
              required
              value={doctorId}
              onChange={(event) => {
                setDoctorId(Number(event.target.value));
                setTime("");
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >
              {doctors.map((doctor) => (
                <option
                  key={doctor.id}
                  value={doctor.id}
                >
                  {doctor.name} — {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="date"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Appointment date
            </label>

            <input
              id="date"
              type="date"
              required
              min={new Date().toLocaleDateString("en-CA")}
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setTime("");
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="time"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Available time
            </label>

            <select
              id="time"
              required
              value={time}
              onChange={(event) => {
                setTime(event.target.value);
                setError("");
              }}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                Select a time slot
              </option>

              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>

            {availableSlots.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No slots are available for this doctor
                on this date. Try another date.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Reason for visit
            </label>

            <textarea
              id="reason"
              required
              rows={3}
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Briefly describe the reason for the visit"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="text-sm text-rose-600"
            >
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                availableSlots.length === 0 ||
                !availableSlots.includes(time)
              }
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {appointmentToEdit
                ? "Save changes"
                : "Book appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
