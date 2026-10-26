
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Stethoscope,
  Users,
  X,
  CalendarCheck,
  CircleUserRound,
  AlertCircle,
  Trash2,
  RefreshCw,
} from "lucide-react";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  initials: string;
  color: string;
};

type Appointment = {
  id: number;
  patient: string;
  email: string;
  doctorId: number;
  date: string;
  time: string;
  reason: string;
  status: "Upcoming" | "Completed" | "Cancelled";
  cancellationReason?: string;
};

const doctors: Doctor[] = [
  {
    id: 1,
    name: "Dr. Sarah Kimani",
    specialty: "General Practitioner",
    initials: "SK",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    name: "Dr. James Mwangi",
    specialty: "Cardiologist",
    initials: "JM",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: 3,
    name: "Dr. Amina Hassan",
    specialty: "Pediatrician",
    initials: "AH",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: 4,
    name: "Dr. Peter Otieno",
    specialty: "Dermatologist",
    initials: "PO",
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: 5,
    name: "Dr. Grace Wanjiku",
    specialty: "Family Medicine",
    initials: "GW",
    color: "bg-emerald-100 text-emerald-700",
  },
];

const today = new Date();
const dateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const todayString = dateString(today);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: "Mary Njeri",
    email: "mary@example.com",
    doctorId: 1,
    date: todayString,
    time: "09:00",
    reason: "Routine check-up",
    status: "Upcoming",
  },
  {
    id: 2,
    patient: "David Kamau",
    email: "david@example.com",
    doctorId: 2,
    date: todayString,
    time: "10:00",
    reason: "Heart consultation",
    status: "Upcoming",
  },
  {
    id: 3,
    patient: "Faith Wambui",
    email: "faith@example.com",
    doctorId: 3,
    date: todayString,
    time: "11:30",
    reason: "Child wellness visit",
    status: "Upcoming",
  },
  {
    id: 4,
    patient: "Brian Ochieng",
    email: "brian@example.com",
    doctorId: 4,
    date: todayString,
    time: "14:00",
    reason: "Skin consultation",
    status: "Upcoming",
  },
  {
    id: 5,
    patient: "Lucy Akinyi",
    email: "lucy@example.com",
    doctorId: 5,
    date: dateString(tomorrow),
    time: "09:30",
    reason: "Family consultation",
    status: "Upcoming",
  },
];

function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(time: string) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-KE", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getDoctor(doctorId: number) {
  return doctors.find((doctor) => doctor.id === doctorId);
}

function getAvailableSlots(
  doctorId: number,
  date: string,
  appointments: Appointment[],
  excludeAppointmentId?: number,
) {
  const slots: string[] = [];

  // Clinic hours: 9:00 AM to 5:00 PM.
  // Each appointment lasts 30 minutes.
  for (let minutes = 9 * 60; minutes < 17 * 60; minutes += 30) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const slot = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

    const slotDate = new Date(`${date}T${slot}:00`);
    const now = new Date();

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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  trend,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: typeof CalendarCheck;
  iconClass: string;
  trend?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        {trend && (
          <span className="flex items-center gap-1 font-semibold text-emerald-600">
            <ArrowUpRight size={14} />
            {trend}
          </span>
        )}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}

function DoctorCard({
  doctor,
  appointmentCount,
  onBook,
}: {
  doctor: Doctor;
  appointmentCount: number;
  onBook: (doctorId: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${doctor.color}`}
        >
          {doctor.initials}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">
            {doctor.name}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{doctor.specialty}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-lg font-bold text-slate-900">{appointmentCount}</p>
          <p className="text-xs text-slate-500">Active appointments</p>
        </div>
        <button
          onClick={() => onBook(doctor.id)}
          className="rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
        >
          Book slot
        </button>
      </div>
    </div>
  );
}

function AppointmentRow({
  appointment,
  onCancel,
  onReschedule,
}: {
  appointment: Appointment;
  onCancel: (appointment: Appointment) => void;
  onReschedule: (appointment: Appointment) => void;
}) {
  const doctor = getDoctor(appointment.doctorId);

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
      <td className="px-5 py-4">
        <div className="font-semibold text-slate-800">{appointment.patient}</div>
        <div className="mt-1 text-xs text-slate-500">{appointment.email}</div>
      </td>
      <td className="px-5 py-4">
        <div className="font-medium text-slate-700">
          {doctor?.name ?? "Unknown doctor"}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {doctor?.specialty ?? ""}
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-700">
          <CalendarDays size={15} className="text-slate-400" />
          {formatDate(appointment.date)}
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={13} />
          {formatTime(appointment.time)}
        </div>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            appointment.status === "Upcoming"
              ? "bg-emerald-50 text-emerald-700"
              : appointment.status === "Completed"
                ? "bg-blue-50 text-blue-700"
                : "bg-rose-50 text-rose-700"
          }`}
        >
          {appointment.status}
        </span>
      </td>
      <td className="px-5 py-4">
        {appointment.status === "Upcoming" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReschedule(appointment)}
              title="Reschedule appointment"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => onCancel(appointment)}
              title="Cancel appointment"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">No actions</span>
        )}
      </td>
    </tr>
  );
}

function BookingModal({
  doctors,
  appointments,
  initialDoctorId,
  rescheduleAppointment,
  onClose,
  onSave,
}: {
  doctors: Doctor[];
  appointments: Appointment[];
  initialDoctorId?: number;
  rescheduleAppointment?: Appointment;
  onClose: () => void;
  onSave: (
    patient: string,
    email: string,
    doctorId: number,
    date: string,
    time: string,
    reason: string,
    appointmentId?: number,
  ) => void;
}) {
  const [patient, setPatient] = useState(rescheduleAppointment?.patient ?? "");
  const [email, setEmail] = useState(rescheduleAppointment?.email ?? "");
  const [doctorId, setDoctorId] = useState(
    rescheduleAppointment?.doctorId ?? initialDoctorId ?? doctors[0].id,
  );
  const [date, setDate] = useState(
    rescheduleAppointment?.date ?? todayString,
  );
  const [time, setTime] = useState(rescheduleAppointment?.time ?? "");
  const [reason, setReason] = useState(rescheduleAppointment?.reason ?? "");
  const [error, setError] = useState("");

  const slots = useMemo(
    () =>
      getAvailableSlots(
        doctorId,
        date,
        appointments,
        rescheduleAppointment?.id,
      ),
    [doctorId, date, appointments, rescheduleAppointment],
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!patient.trim() || !email.trim() || !reason.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!time || !slots.includes(time)) {
      setError("Please select an available appointment time.");
      return;
    }

    onSave(
      patient.trim(),
      email.trim(),
      doctorId,
      date,
      time,
      reason.trim(),
      rescheduleAppointment?.id,
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {rescheduleAppointment ? "Reschedule appointment" : "Book an appointment"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Appointments are scheduled in 30-minute slots.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close booking form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Patient name *
              <input
                value={patient}
                onChange={(event) => setPatient(event.target.value)}
                required
                placeholder="Enter full name"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Email address *
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="patient@example.com"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Select doctor *
            <select
              value={doctorId}
              onChange={(event) => {
                setDoctorId(Number(event.target.value));
                setTime("");
              }}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-teal-500"
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} — {doctor.specialty}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Appointment date *
            <input
              type="date"
              value={date}
              min={todayString}
              onChange={(event) => {
                setDate(event.target.value);
                setTime("");
              }}
              required
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-teal-500"
            />
          </label>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">
                Available times *
              </label>
              <span className="text-xs text-slate-500">30 minutes per slot</span>
            </div>
            {slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`rounded-xl border px-2 py-2.5 text-sm font-medium transition ${
                      time === slot
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 text-slate-700 hover:border-teal-400 hover:bg-teal-50"
                    }`}
                  >
                    {formatTime(slot)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                No available times for this doctor on the selected date. Choose another date.
              </div>
            )}
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Reason for visit *
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              required
              rows={3}
              placeholder="Briefly describe the reason for your visit"
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={slots.length === 0}
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check size={17} />
              {rescheduleAppointment ? "Save new time" : "Confirm appointment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  const [rescheduling, setRescheduling] = useState<Appointment | undefined>();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activePage, setActivePage] = useState("Overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | undefined>();
  const [cancellationReason, setCancellationReason] = useState("");

  const activeAppointments = appointments.filter(
    (appointment) => appointment.status === "Upcoming",
  );

  const todayAppointments = activeAppointments.filter(
    (appointment) => appointment.date === todayString,
  );

  const filteredAppointments = appointments
    .filter((appointment) => {
      const doctor = getDoctor(appointment.doctorId);
      const searchText =
        `${appointment.patient} ${appointment.email} ${doctor?.name ?? ""}`.toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const dateA = `${a.date}T${a.time}`;
      const dateB = `${b.date}T${b.time}`;
      return dateA.localeCompare(dateB);
    });

  function openBooking(doctorId?: number) {
    setSelectedDoctorId(doctorId);
    setRescheduling(undefined);
    setShowBooking(true);
  }

  function saveAppointment(
    patient: string,
    email: string,
    doctorId: number,
    date: string,
    time: string,
    reason: string,
    appointmentId?: number,
  ) {
    // Frontend validation for demonstration.
    // The Django API must repeat these checks on the server.
    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}:00`);

    if (selectedDateTime <= now) {
      window.alert("You cannot book an appointment in the past.");
      return;
    }

    if (
      selectedDateTime.getTime() - now.getTime() < 60 * 60 * 1000
    ) {
      window.alert("Appointments must be booked at least one hour in advance.");
      return;
    }

    const conflict = appointments.some(
      (appointment) =>
        appointment.id !== appointmentId &&
        appointment.status === "Upcoming" &&
        appointment.doctorId === doctorId &&
        appointment.date === date &&
        appointment.time === time,
    );

    if (conflict) {
      window.alert("That time slot is already booked. Please select another.");
      return;
    }

    if (appointmentId) {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? {
                ...appointment,
                patient,
                email,
                doctorId,
                date,
                time,
                reason,
              }
            : appointment,
        ),
      );
    } else {
      setAppointments((current) => [
        ...current,
        {
          id: Math.max(0, ...current.map((appointment) => appointment.id)) + 1,
          patient,
          email,
          doctorId,
          date,
          time,
          reason,
          status: "Upcoming",
        },
      ]);
    }

    setShowBooking(false);
    setRescheduling(undefined);
    setSelectedDoctorId(undefined);
  }

  function confirmCancellation() {
    if (!cancelTarget) return;

    if (!cancellationReason.trim()) {
      window.alert("Please enter a reason for cancellation.");
      return;
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === cancelTarget.id
          ? {
              ...appointment,
              status: "Cancelled",
              cancellationReason: cancellationReason.trim(),
            }
          : appointment,
      ),
    );

    setCancelTarget(undefined);
    setCancellationReason("");
  }

  const navigation = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Appointments", icon: CalendarDays },
    { name: "Doctors", icon: Stethoscope },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {mobileMenuOpen && (
          <button
            aria-label="Close navigation menu"
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-white">
              <HeartPulse size={23} />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                CarePoint
              </p>
              <p className="text-xs text-slate-500">Clinic management</p>
            </div>
          </div>

          <div className="px-4 pt-7">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </p>
            <nav className="space-y-1">
              {navigation.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  onClick={() => {
                    setActivePage(name);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    activePage === name
                      ? "bg-teal-50 text-teal-800"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  {name}
                  {name === "Appointments" && (
                    <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                      {activeAppointments.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-800">
                AD
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Clinic Admin</p>
                <p className="truncate text-xs text-slate-500">Administrator</p>
              </div>
              <LogOut size={17} className="text-slate-400" />
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu size={22} />
              </button>
              <div>
                <p className="text-xs text-slate-500">Clinic / {activePage}</p>
                <h1 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                  {activePage === "Overview"
                    ? "Dashboard overview"
                    : activePage}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold">Good morning</p>
                <p className="mt-1 text-xs text-slate-500">
                  {today.toLocaleDateString("en-KE", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600">
                <CircleUserRound size={23} />
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-10">
            {activePage === "Overview" && (
              <>
                <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-r from-teal-800 to-teal-600 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-teal-50">
                      <Activity size={14} />
                      Clinic at a glance
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                      Better care starts here.
                    </h2>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-teal-50">
                      Manage appointments, coordinate your doctors, and keep
                      your clinic running smoothly.
                    </p>
                  </div>
                  <button
                    onClick={() => openBooking()}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
                  >
                    <Plus size={18} />
                    Book appointment
                  </button>
                </section>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total appointments"
                    value={appointments.length}
                    subtitle="All appointment records"
                    icon={CalendarCheck}
                    iconClass="bg-teal-50 text-teal-700"
                    trend="+"
                  />
                  <StatCard
                    title="Today's appointments"
                    value={todayAppointments.length}
                    subtitle="Scheduled for today"
                    icon={Clock3}
                    iconClass="bg-blue-50 text-blue-700"
                  />
                  <StatCard
                    title="Available doctors"
                    value={doctors.length}
                    subtitle="Doctors on the roster"
                    icon={Users}
                    iconClass="bg-violet-50 text-violet-700"
                  />
                  <StatCard
                    title="Cancelled"
                    value={
                      appointments.filter((item) => item.status === "Cancelled")
                        .length
                    }
                    subtitle="Appointments cancelled"
                    icon={ArrowDownRight}
                    iconClass="bg-rose-50 text-rose-700"
                  />
                </section>

                <section>
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Your medical team
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Select a doctor to start booking a visit.
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePage("Doctors")}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-900"
                    >
                      View all doctors <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                    {doctors.map((doctor) => (
                      <DoctorCard
                        key={doctor.id}
                        doctor={doctor}
                        appointmentCount={
                          activeAppointments.filter(
                            (item) => item.doctorId === doctor.id,
                          ).length
                        }
                        onBook={openBooking}
                      />
                    ))}
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Recent appointments
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Your upcoming clinic schedule.
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePage("Appointments")}
                      className="inline-flex items-center gap-2 self-start text-sm font-semibold text-teal-700 hover:text-teal-900"
                    >
                      All appointments <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Patient</th>
                          <th className="px-5 py-3 font-semibold">Doctor</th>
                          <th className="px-5 py-3 font-semibold">Date & time</th>
                          <th className="px-5 py-3 font-semibold">Status</th>
                          <th className="px-5 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAppointments
                          .filter((item) => item.status === "Upcoming")
                          .slice(0, 5)
                          .map((appointment) => (
                            <AppointmentRow
                              key={appointment.id}
                              appointment={appointment}
                              onCancel={setCancelTarget}
                              onReschedule={(item) => {
                                setRescheduling(item);
                                setSelectedDoctorId(undefined);
                                setShowBooking(true);
                              }}
                            />
                          ))}
                      </tbody>
                    </table>
                    {activeAppointments.length === 0 && (
                      <p className="p-8 text-center text-sm text-slate-500">
                        No upcoming appointments yet.
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            {activePage === "Appointments" && (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="text-lg font-bold">Appointment management</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Search, book, reschedule, or cancel appointments.
                    </p>
                  </div>
                  <button
                    onClick={() => openBooking()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    <Plus size={17} /> New appointment
                  </button>
                </div>

                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:px-6">
                  <div className="relative flex-1">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search patient or doctor..."
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-teal-500 sm:w-48"
                    >
                      <option>All</option>
                      <option>Upcoming</option>
                      <option>Completed</option>
                      <option>Cancelled</option>
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Patient</th>
                        <th className="px-5 py-3 font-semibold">Doctor</th>
                        <th className="px-5 py-3 font-semibold">Date & time</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.map((appointment) => (
                        <AppointmentRow
                          key={appointment.id}
                          appointment={appointment}
                          onCancel={setCancelTarget}
                          onReschedule={(item) => {
                            setRescheduling(item);
                            setSelectedDoctorId(undefined);
                            setShowBooking(true);
                          }}
                        />
                      ))}
                    </tbody>
                  </table>

                  {filteredAppointments.length === 0 && (
                    <div className="p-12 text-center">
                      <Search className="mx-auto text-slate-300" size={30} />
                      <p className="mt-3 font-semibold text-slate-700">
                        No appointments found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try a different search or status filter.
                      </p>
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6">
                  Showing {filteredAppointments.length} appointment
                  {filteredAppointments.length === 1 ? "" : "s"}.
                </div>
              </section>
            )}

            {activePage === "Doctors" && (
              <section>
                <div className="mb-5">
                  <h2 className="text-lg font-bold">Meet the doctors</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Five doctors are currently listed in this clinic demo.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {doctors.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-bold ${doctor.color}`}
                      >
                        {doctor.initials}
                      </div>
                      <h3 className="mt-4 font-bold">{doctor.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {doctor.specialty}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-sm text-slate-500">
                          Active appointments
                        </span>
                        <span className="font-bold">
                          {
                            activeAppointments.filter(
                              (item) => item.doctorId === doctor.id,
                            ).length
                          }
                        </span>
                      </div>
                      <button
                        onClick={() => openBooking(doctor.id)}
                        className="mt-4 w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-semibold text-white hover:bg-teal-800"
                      >
                        Book with this doctor
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
              <p>CarePoint Clinic Management · Assessment prototype</p>
              <p>Frontend demo — appointments are not yet saved to a database.</p>
            </footer>
          </div>
        </main>
      </div>

      {showBooking && (
        <BookingModal
          doctors={doctors}
          appointments={appointments}
          initialDoctorId={selectedDoctorId}
          rescheduleAppointment={rescheduling}
          onClose={() => {
            setShowBooking(false);
            setRescheduling(undefined);
            setSelectedDoctorId(undefined);
          }}
          onSave={saveAppointment}
        />
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <button
                onClick={() => {
                  setCancelTarget(undefined);
                  setCancellationReason("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                aria-label="Close cancellation dialog"
              >
                <X size={20} />
              </button>
            </div>
            <h2 className="mt-4 text-xl font-bold">Cancel appointment?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Cancel the appointment for{" "}
              <span className="font-semibold text-slate-800">
                {cancelTarget.patient}
              </span>{" "}
              with {getDoctor(cancelTarget.doctorId)?.name}. The slot will
              become available again.
            </p>

            <label className="mt-5 block text-sm font-medium text-slate-700">
              Reason for cancellation *
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                placeholder="Enter the reason for cancellation"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCancelTarget(undefined);
                  setCancellationReason("");
                }}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep appointment
              </button>
              <button
                onClick={confirmCancellation}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
              >
                Confirm cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
