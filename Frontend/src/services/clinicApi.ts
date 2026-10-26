
import api from "./api";
import type {
  Doctor,
  AvailabilityResponse,
  Appointment,
  BookingRequest,
} from "./types";

// Django API response types
interface ApiDoctor {
  id: number;
  name: string;
  specialty: string;
  is_active: boolean;
}

interface ApiPatient {
  id: number;
  name: string;
  email: string;
}

interface ApiAppointment {
  id: number;
  patient: ApiPatient;
  doctor: ApiDoctor;
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: "upcoming" | "completed" | "cancelled";
  cancellation_reason: string | null;
}

// Convert Django's appointment response into the format used by React.

function toUiAppointment(item: ApiAppointment): Appointment {
  const statusMap = {
  upcoming: "upcoming",
  completed: "completed",
  cancelled: "cancelled",
} as const 

  return {
    id: item.id,
    patient: {
      id: item.patient.id,
      name: item.patient.name,
      email: item.patient.email,
    },
    doctor: {
      id: item.doctor.id,
      name: item.doctor.name,
      specialty: item.doctor.specialty,
      is_active: item.doctor.is_active,
    },
    appointment_date: item.appointment_date,
    start_time: item.start_time,
    end_time: item.end_time,
    reason: item.reason,
    status: statusMap[item.status],
    cancellation_reason: item.cancellation_reason,
  };
}


// Get all active doctors
export async function getDoctors(): Promise<Doctor[]> {
  const response = await api.get<Doctor[]>("/doctors/");
  return response.data;
}

// Get a doctor's availability for a specific date
export async function getDoctorAvailability(
  doctorId: number,
  date: string,
): Promise<AvailabilityResponse> {
  const response = await api.get<AvailabilityResponse>(
    `/doctors/${doctorId}/availability/`,
    { params: { date } },
  );

  return response.data;
}

// Book an appointment
export async function bookAppointment(
  booking: BookingRequest,
): Promise<Appointment> {
  const response = await api.post<ApiAppointment>(
    "/appointments/",
    booking,
  );

  return toUiAppointment(response.data);
}

// Cancel an appointment
export async function cancelAppointment(
  appointmentId: number,
  reason: string,
): Promise<Appointment> {
  const response = await api.patch<ApiAppointment>(
    `/appointments/${appointmentId}/cancel/`,
    { reason },
  );

  return toUiAppointment(response.data);
}

// Reschedule an appointment
export async function rescheduleAppointment(
  appointmentId: number,
  appointmentDate: string,
  startTime: string,
): Promise<Appointment> {
  const response = await api.patch<ApiAppointment>(
    `/appointments/${appointmentId}/reschedule/`,
    {
      appointment_date: appointmentDate,
      start_time: startTime,
    },
  );

  return toUiAppointment(response.data);
}

// Get a patient's upcoming appointments
export async function getPatientAppointments(
  patientId: number,
): Promise<Appointment[]> {
  const response = await api.get<ApiAppointment[]>(
    `/patients/${patientId}/appointments/`,
  );

  return response.data.map(toUiAppointment);
}

// Get all appointments for the dashboard
export async function fetchAppointments(): Promise<Appointment[]> {
  const response = await api.get<ApiAppointment[]>("/appointments/");

  return response.data.map(toUiAppointment);
}
