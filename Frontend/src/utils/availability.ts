
import type { Appointment } from "../types";

export function getAvailableSlots(
  doctorId: number,
  date: string,
  appointments: Appointment[],
  excludeAppointmentId?: number,
): string[] {
  if (!date) return [];

  const slots: string[] = [];
  const now = new Date();

  // Clinic hours: 9:00 AM–5:00 PM.
  // Each slot is 30 minutes.
  for (let minutes = 9 * 60; minutes < 17 * 60; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const slot =
      `${String(hours).padStart(2, "0")}:` +
      `${String(mins).padStart(2, "0")}`;

    const slotDate = new Date(`${date}T${slot}:00`);

    const isPast = slotDate <= now;

    const isBooked = appointments.some(
      (appointment) =>
        appointment.id !== excludeAppointmentId &&
        appointment.doctorId === doctorId &&
        appointment.date === date &&
        appointment.time === slot &&
        appointment.status !== "Cancelled",
    );

    if (!isPast && !isBooked) {
      slots.push(slot);
    }
  }

  return slots;
}
