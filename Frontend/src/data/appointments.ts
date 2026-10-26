
import type { Appointment } from "../types";

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: "Mary Njeri",
    email: "mary@example.com",
    doctorId: 1,
    date: getLocalDateString(today),
    time: "09:00",
    reason: "Routine check-up",
    status: "Upcoming",
  },
  {
    id: 2,
    patient: "David Kamau",
    email: "david@example.com",
    doctorId: 2,
    date: getLocalDateString(today),
    time: "10:00",
    reason: "Heart consultation",
    status: "Upcoming",
  },
  {
    id: 3,
    patient: "Faith Wambui",
    email: "faith@example.com",
    doctorId: 3,
    date: getLocalDateString(today),
    time: "11:30",
    reason: "Child wellness visit",
    status: "Upcoming",
  },
  {
    id: 4,
    patient: "Brian Ochieng",
    email: "brian@example.com",
    doctorId: 4,
    date: getLocalDateString(today),
    time: "14:00",
    reason: "Skin consultation",
    status: "Upcoming",
  },
  {
    id: 5,
    patient: "Lucy Akinyi",
    email: "lucy@example.com",
    doctorId: 5,
    date: getLocalDateString(tomorrow),
    time: "09:30",
    reason: "Family consultation",
    status: "Upcoming",
  },
];
