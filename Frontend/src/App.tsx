
import { useCallback, useEffect, useState } from "react";

import { doctors as initialDoctors } from "./data/doctors";
import type {
  Appointment as UiAppointment,
  AppPage,
  Doctor as UiDoctor,
} from "./types";

import type {
  Appointment as ApiAppointment,
  Doctor as ApiDoctor,
} from "./services/types";

import {
  getDoctors,
  fetchAppointments,
  bookAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from "./services/clinicApi";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import BookingModal from "./components/appointments/BookingModal";
import CancellationModal from "./components/appointments/CancellationModal";

import DashboardPage from "./pages/DashboardPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage from "./pages/DoctorsPage";

import "./App.css";

function toUiDoctor(doctor: ApiDoctor): UiDoctor {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700",
    "bg-amber-100 text-amber-700",
    "bg-pink-100 text-pink-700",
  ];

  const initials = doctor.name
    .replace(/^Dr\.?\s*/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    initials,
    color: colors[(doctor.id - 1) % colors.length],
  };
}

function toUiAppointment(
  appointment: ApiAppointment,
): UiAppointment {
  const statusMap = {
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
  } as const;

  return {
    id: appointment.id,
    patient: appointment.patient.name,
    email: appointment.patient.email,
    doctorId: appointment.doctor.id,
    date: appointment.appointment_date,
    time: appointment.start_time.slice(0, 5),
    reason: appointment.reason,
    status: statusMap[appointment.status],
    cancellationReason:
      appointment.cancellation_reason ?? undefined,
  };
}

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: string;
            error?: string;
            non_field_errors?: string[];
          };
        };
      }
    ).response;

    const data = response?.data;

    if (data?.detail) return data.detail;
    if (data?.error) return data.error;
    if (data?.non_field_errors?.length) {
      return data.non_field_errors.join(" ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function App() {
  const [activePage, setActivePage] =
    useState<AppPage>("Overview");

  const [doctors, setDoctors] =
    useState<UiDoctor[]>(initialDoctors);

  const [appointments, setAppointments] =
    useState<UiAppointment[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [showBookingModal, setShowBookingModal] =
    useState(false);

  const [selectedDoctorId, setSelectedDoctorId] =
    useState<number | undefined>(undefined);

  const [selectedAppointment, setSelectedAppointment] =
    useState<UiAppointment | null>(null);

  const [showCancellationModal, setShowCancellationModal] =
    useState(false);

  const [appointmentToCancel, setAppointmentToCancel] =
    useState<UiAppointment | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = useCallback(async () => {
  setError("");

  try {
    const [apiDoctors, apiAppointments] = await Promise.all([
      getDoctors(),
      fetchAppointments(),
    ]);

    setDoctors(apiDoctors.map(toUiDoctor));
    setAppointments(apiAppointments.map(toUiAppointment));
  } catch (err) {
    setError(
      `Could not load data from the clinic API. ${getErrorMessage(err)}`,
    );
  }
}, []);

  useEffect(() => {
  let cancelled = false;

  async function loadInitialData() {
    try {
      const [apiDoctors, apiAppointments] = await Promise.all([
        getDoctors(),
        fetchAppointments(),
      ]);

      if (cancelled) return;

      setDoctors(apiDoctors.map(toUiDoctor));
      setAppointments(apiAppointments.map(toUiAppointment));
    } catch (err) {
      if (cancelled) return;

      setError(
        `Could not load data from the clinic API. ${getErrorMessage(err)}`,
      );
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  void loadInitialData();

  return () => {
    cancelled = true;
  };
}, []);

  const openBookingModal = (doctorId?: number) => {
    setError("");
    setSelectedDoctorId(doctorId);
    setSelectedAppointment(null);
    setShowBookingModal(true);
  };

  const openRescheduleModal = (
    appointment: UiAppointment,
  ) => {
    setError("");
    setSelectedAppointment(appointment);
    setSelectedDoctorId(appointment.doctorId);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedDoctorId(undefined);
    setSelectedAppointment(null);
  };

  const openCancellationModal = (
    appointment: UiAppointment,
  ) => {
    setError("");
    setAppointmentToCancel(appointment);
    setShowCancellationModal(true);
  };

  const closeCancellationModal = () => {
    setShowCancellationModal(false);
    setAppointmentToCancel(null);
  };

  const handleBookAppointment = async (
    newAppointment: UiAppointment,
  ) => {
    setSaving(true);
    setError("");

    try {
      if (selectedAppointment) {
        // The current reschedule endpoint changes the date and time.
        await rescheduleAppointment(
          selectedAppointment.id,
          newAppointment.date,
          newAppointment.time,
        );
      } else {
        await bookAppointment({
          patient_name: newAppointment.patient,
          patient_email: newAppointment.email,
          doctor_id: newAppointment.doctorId,
          appointment_date: newAppointment.date,
          start_time: newAppointment.time,
          reason: newAppointment.reason,
        });
      }

      closeBookingModal();
      await loadDashboardData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAppointment = async (reason: string) => {
    if (!appointmentToCancel) return;

    setSaving(true);
    setError("");

    try {
      await cancelAppointment(appointmentToCancel.id, reason);
      closeCancellationModal();
      await loadDashboardData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const searchText = searchQuery.trim().toLowerCase();

  const filteredAppointments = appointments.filter(
    (appointment) => {
      const doctor = doctors.find(
        (item) => item.id === appointment.doctorId,
      );

      return (
        appointment.patient.toLowerCase().includes(searchText) ||
        appointment.email.toLowerCase().includes(searchText) ||
        (doctor?.name.toLowerCase().includes(searchText) ?? false)
      );
    },
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        activePage={activePage}
        onPageChange={setActivePage}
      />

      <div className="lg:pl-64">
        <Header
          activePage={activePage}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBookAppointment={() => openBookingModal()}
        />

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => void loadDashboardData()}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div
              role="status"
              className="rounded-xl bg-white p-8 text-center text-slate-500 shadow-sm"
            >
              Loading clinic data...
            </div>
          ) : (
            <>
              {activePage === "Overview" && (
                <DashboardPage
                  doctors={doctors}
                  appointments={appointments}
                  onBookAppointment={openBookingModal}
                  onCancelAppointment={openCancellationModal}
                  onViewAppointments={() =>
                    setActivePage("Appointments")
                  }
                />
              )}

              {activePage === "Appointments" && (
                <AppointmentsPage
                  appointments={filteredAppointments}
                  doctors={doctors}
                  onBookAppointment={() => openBookingModal()}
                  onCancelAppointment={openCancellationModal}
                  onRescheduleAppointment={openRescheduleModal}
                />
              )}

              {activePage === "Doctors" && (
                <DoctorsPage
                  doctors={doctors}
                  appointments={appointments}
                  onBookAppointment={openBookingModal}
                />
              )}
            </>
          )}
        </main>
      </div>

      {showBookingModal && (
        <BookingModal
          doctors={doctors}
          appointments={appointments}
          selectedDoctorId={selectedDoctorId}
          appointmentToEdit={selectedAppointment}
          onClose={closeBookingModal}
          onSubmit={handleBookAppointment}
        />
      )}

      {showCancellationModal && appointmentToCancel && (
        <CancellationModal
          appointment={appointmentToCancel}
          onClose={closeCancellationModal}
          onConfirm={handleCancelAppointment}
        />
      )}

      {saving && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          Saving changes...
        </div>
      )}
    </div>
  );
}

export default App;
