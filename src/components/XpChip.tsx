import { Sparkles } from "lucide-react";

export function XpChip({ xp }: { xp: number }) {
  return (
    <span className="tlamach-chip-xp text-sm">
      <Sparkles className="w-4 h-4" /> {xp} XP
    </span>
  );
}