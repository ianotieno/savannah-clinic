
import { useState } from "react";

import { doctors } from "./data/doctors";
import { initialAppointments } from "./data/appointments";
import type { Appointment, AppPage } from "./types";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";

import BookingModal from "./components/appointments/BookingModal";
import CancellationModal from "./components/appointments/CancellationModal";

import DashboardPage from "./pages/DashboardPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage from "./pages/DoctorsPage";

import "./App.css";

function App() {
  const [activePage, setActivePage] =
    useState<AppPage>("Overview");

  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);

  const [searchQuery, setSearchQuery] = useState("");

  const [showBookingModal, setShowBookingModal] =
    useState(false);

  const [selectedDoctorId, setSelectedDoctorId] =
    useState<number | undefined>(undefined);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [showCancellationModal, setShowCancellationModal] =
    useState(false);

  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);

  // Open a form to create a new appointment.
  const openBookingModal = (doctorId?: number) => {
    setSelectedDoctorId(doctorId);
    setSelectedAppointment(null);
    setShowBookingModal(true);
  };

  // Open the booking form to reschedule an existing appointment.
  const openRescheduleModal = (
    appointment: Appointment
  ) => {
    setSelectedAppointment(appointment);
    setSelectedDoctorId(appointment.doctorId);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedDoctorId(undefined);
    setSelectedAppointment(null);
  };

  // Open the cancellation form.
  const openCancellationModal = (
    appointment: Appointment
  ) => {
    setAppointmentToCancel(appointment);
    setShowCancellationModal(true);
  };

  const closeCancellationModal = () => {
    setShowCancellationModal(false);
    setAppointmentToCancel(null);
  };

  // Create a new appointment or update one being rescheduled.
  const handleBookAppointment = (
    newAppointment: Appointment
  ) => {
    if (selectedAppointment) {
      // Keep the same ID when rescheduling.
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === selectedAppointment.id
            ? {
                ...newAppointment,
                id: selectedAppointment.id,
                status: "Upcoming",
                cancellationReason: undefined,
              }
            : appointment
        )
      );
    } else {
      // Generate the next numeric ID inside the state updater.
      setAppointments((current) => {
        const nextId =
          Math.max(
            0,
            ...current.map((appointment) => appointment.id)
          ) + 1;

        return [
          ...current,
          {
            ...newAppointment,
            id: nextId,
            status: "Upcoming",
            cancellationReason: undefined,
          },
        ];
      });
    }

    closeBookingModal();
  };

  // Cancel an appointment and save the cancellation reason.
  const handleCancelAppointment = (reason: string) => {
    if (!appointmentToCancel) {
      return;
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentToCancel.id
          ? {
              ...appointment,
              status: "Cancelled",
              cancellationReason: reason,
            }
          : appointment
      )
    );

    closeCancellationModal();
  };

  // Filter appointments by patient, email, or doctor.
  const filteredAppointments = appointments.filter(
    (appointment) => {
      const doctor = doctors.find(
        (item) => item.id === appointment.doctorId
      );

      const searchText = searchQuery
        .trim()
        .toLowerCase();

      return (
        appointment.patient
          .toLowerCase()
          .includes(searchText) ||
        appointment.email
          .toLowerCase()
          .includes(searchText) ||
        (doctor?.name
          .toLowerCase()
          .includes(searchText) ??
          false)
      );
    }
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
        </main>
      </div>

      {/* Booking and rescheduling modal */}
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

      {/* Cancellation modal */}
      {showCancellationModal && appointmentToCancel && (
        <CancellationModal
          appointment={appointmentToCancel}
          onClose={closeCancellationModal}
          onConfirm={handleCancelAppointment}
        />
      )}
    </div>
  );
}

export default App;
