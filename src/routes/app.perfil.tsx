import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useUserCode, clearCurrentCode } from "@/lib/user-store";
import { useUser, useBadges } from "@/lib/queries";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Copy, Flame, Sparkles, Trophy, LogOut } from "lucide-react";
import { RANK_NAMES, BADGE_DEFS } from "@/lib/business";
import { toast } from "sonner";

export const Route = createFileRoute("/app/perfil")({ component: Perfil });

function Perfil() {
  const navigate = useNavigate();
  const code = useUserCode();
  const { data: user } = useUser(code);
  const { data: earned = new Set<string>() } = useBadges(code);

  const copyCode = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  };

  const logout = () => {
    clearCurrentCode();
    navigate({ to: "/" });
  };

  return (
    <div>
      <PageHeader title="Perfil" />

      <div className="px-5 space-y-4">
        {/* Code card */}
        <div className="tlamach-card bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <p className="text-xs opacity-80 mb-2">TU CÓDIGO ÚNICO</p>
          <p className="text-4xl font-bold tracking-[0.3em] mb-3">{code ?? "------"}</p>
          <p className="text-sm opacity-90 mb-4">
            Guárdalo. Lo necesitas para continuar tu progreso en otro dispositivo.
          </p>
          <Button
            onClick={copyCode}
            variant="secondary"
            className="w-full rounded-xl bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
          >
            <Copy className="w-4 h-4 mr-2" /> Copiar código
          </Button>
        </div>

        {/* Rank */}
        <div className="tlamach-card">
          <p className="text-xs text-muted-foreground mb-1">Rango actual</p>
          <h3 className="text-xl font-bold mb-2">{user ? RANK_NAMES[user.current_rank] : "—"}</h3>
          <p className="text-sm text-muted-foreground">Sube de nivel completando lecciones.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={Sparkles} value={user?.total_xp ?? 0} label="XP total" color="text-primary bg-primary/10" />
          <StatCard icon={Flame} value={user?.current_streak ?? 0} label="Racha actual" color="text-accent bg-accent/10" />
          <StatCard icon={Trophy} value={user?.max_streak ?? 0} label="Racha máx." color="text-warning bg-warning/10" />
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Insignias</h3>
          <div className="grid grid-cols-2 gap-3">
            {BADGE_DEFS.map((b) => {
              const has = earned.has(b.key);
              return (
                <div
                  key={b.key}
                  className={`tlamach-card text-center ${has ? "" : "opacity-40 grayscale"}`}
                >
                  <div className="text-3xl mb-2">{has ? "🏆" : "🔒"}</div>
                  <p className="font-semibold text-sm">{b.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <Button onClick={logout} variant="ghost" className="w-full text-muted-foreground">
          <LogOut className="w-4 h-4 mr-2" /> Salir (mi progreso está guardado en mi código)
        </Button>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }: { icon: typeof Flame; value: number; label: string; color: string }) {
  return (
    <div className="tlamach-card text-center py-4">
      <div className={`w-10 h-10 rounded-2xl mx-auto mb-2 flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}