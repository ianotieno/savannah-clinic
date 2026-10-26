
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  iconClass: string;
  trend?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  trend,
}: StatCardProps) {
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
