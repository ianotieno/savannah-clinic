
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  is_active: boolean;
}

export interface AvailabilitySlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export interface AvailabilityResponse {
  doctor: Doctor;
  date: string;
  slots: AvailabilitySlot[];
}

export type Appointment = {
  id: number;
  patient: {
    id: number;
    name: string;
    email: string;
  };
  doctor: {
    id: number;
    name: string;
    specialty: string;
    is_active: boolean;
  };
  appointment_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  status: "upcoming" | "completed" | "cancelled";
  cancellation_reason: string | null;
};

export interface BookingRequest {
  patient_name: string;
  patient_email: string;
  doctor_id: number;
  appointment_date: string;
  start_time: string;
  reason: string;
}
