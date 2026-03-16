"use client";

import { cn } from "@/lib/utils";
import type { StaffMember } from "@/lib/carousel/types";

interface StaffCardProps {
  staff: StaffMember;
  className?: string;
}

const ROLE_COLORS: Record<StaffMember["role"], string> = {
  OC: "bg-dw-accent/20 text-dw-accent border-dw-accent/40",
  DC: "bg-dw-red/20 text-dw-red border-dw-red/40",
  ST: "bg-dw-yellow/20 text-dw-yellow border-dw-yellow/40",
  "Position Coach": "bg-ink3/20 text-ink2 border-ink3/40",
};

const HEAT_CONFIG: Record<
  StaffMember["hotSeatLevel"],
  { label: string; barColor: string; barWidth: string }
> = {
  secure: {
    label: "Secure",
    barColor: "bg-dw-green",
    barWidth: "w-1/3",
  },
  lukewarm: {
    label: "Lukewarm",
    barColor: "bg-dw-yellow",
    barWidth: "w-2/3",
  },
  hot: {
    label: "Hot Seat",
    barColor: "bg-dw-red",
    barWidth: "w-full",
  },
};

export function StaffCard({ staff, className }: StaffCardProps) {
  const roleStyle = ROLE_COLORS[staff.role];
  const heat = HEAT_CONFIG[staff.hotSeatLevel];

  return (
    <div
      className={cn(
        "rounded border border-dw-border bg-paper2 p-4",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-headline text-base uppercase tracking-wide text-ink">
          {staff.name}
        </h3>
        <span
          className={cn(
            "shrink-0 rounded border px-2 py-0.5 text-xs font-sans font-medium uppercase tracking-wider",
            roleStyle
          )}
        >
          {staff.role}
        </span>
      </div>

      <p className="mt-2 font-serif italic text-sm text-ink2">
        {staff.reputation}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="font-sans text-xs text-ink3">
          {staff.yearsOnStaff} {staff.yearsOnStaff === 1 ? "year" : "years"} on staff
        </span>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs uppercase tracking-wider text-ink3">
            Seat Temperature
          </span>
          <span
            className={cn(
              "font-sans text-xs font-medium",
              staff.hotSeatLevel === "secure" && "text-dw-green",
              staff.hotSeatLevel === "lukewarm" && "text-dw-yellow",
              staff.hotSeatLevel === "hot" && "text-dw-red"
            )}
          >
            {heat.label}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-paper3">
          <div
            className={cn("h-full rounded-full transition-all", heat.barColor, heat.barWidth)}
          />
        </div>
      </div>
    </div>
  );
}
