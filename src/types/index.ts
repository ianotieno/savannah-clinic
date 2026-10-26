
export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  initials: string;
  color: string;
};

export type AppointmentStatus = "Upcoming" | "Completed" | "Cancelled";

export type Appointment = {
  id: number;
  patient: string;
  email: string;
  doctorId: number;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
  cancellationReason?: string;
};

export type AppPage = "Overview" | "Appointments" | "Doctors";
