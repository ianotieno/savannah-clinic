
import {
  LayoutDashboard,
  CalendarDays,
  Stethoscope,
  HeartPulse,
} from "lucide-react";

import type { AppPage } from "../../types";

type SidebarProps = {
  activePage: AppPage;
  onPageChange: (page: AppPage) => void;
};

const navigationItems: {
  label: AppPage;
  icon: typeof LayoutDashboard;
}[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Appointments", icon: CalendarDays },
  { label: "Doctors", icon: Stethoscope },
];

export default function Sidebar({
  activePage,
  onPageChange,
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <HeartPulse size={23} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            CarePoint
          </h1>
          <p className="text-xs text-slate-500">Clinic management</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-4 py-6">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>

        {navigationItems.map(({ label, icon: Icon }) => {
          const isActive = activePage === label;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onPageChange(label)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-5">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-800">
            CarePoint Admin
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Appointment management
          </p>
        </div>
      </div>
    </aside>
  );
}
