
import { Bell, Plus, Search } from "lucide-react";
import type { AppPage } from "../../types";

type HeaderProps = {
  activePage: AppPage;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBookAppointment: () => void;
};

const pageDescriptions: Record<AppPage, string> = {
  Overview: "Here's what's happening at your clinic today.",
  Appointments: "Manage and review patient appointments.",
  Doctors: "View your clinic's doctors and availability.",
};

export default function Header({
  activePage,
  searchQuery,
  onSearchChange,
  onBookAppointment,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-20 flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {activePage}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {pageDescriptions[activePage]}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activePage === "Appointments" && (
            <label className="relative hidden sm:block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  onSearchChange(event.target.value)
                }
                placeholder="Search appointments..."
                className="w-56 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
              />
            </label>
          )}

          <button
            type="button"
            aria-label="Notifications"
            title="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={19} />
          </button>

          <button
            type="button"
            onClick={onBookAppointment}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New appointment</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
}
