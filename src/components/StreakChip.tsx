import { Flame } from "lucide-react";

export function StreakChip({ days }: { days: number }) {
  return (
    <span className="finz-chip-streak text-sm">
      <Flame className="w-4 h-4" /> {days} {days === 1 ? "día" : "días"}
    </span>
  );
}