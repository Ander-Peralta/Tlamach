import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Wallet, Flame, Loader2 } from "lucide-react";
import { createUser } from "@/lib/user-store";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding/como-funciona")({
  component: ComoFunciona,
});

function ComoFunciona() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const start = async () => {
    setLoading(true);
    try {
      const raw = sessionStorage.getItem("finz_onboarding") ?? "{}";
      const answers = JSON.parse(raw) as Record<string, string>;
      await createUser(answers);
      navigate({ to: "/app/aprender" });
    } catch (e) {
      console.error(e);
      toast.error("No pudimos crear tu cuenta. Intenta otra vez.");
      setLoading(false);
    }
  };

  const steps = [
    { icon: BookOpen, title: "Aprende", desc: "Lecciones cortitas, sin jerga.", color: "text-primary bg-primary/10" },
    { icon: Wallet, title: "Aplica", desc: "Registra un gasto, marca un hábito, crea una meta.", color: "text-accent bg-accent/10" },
    { icon: Flame, title: "Gana puntos y racha", desc: "Tu progreso se ve. Cada día cuenta.", color: "text-warning bg-warning/10" },
  ];

  return (
    <div className="min-h-screen bg-background px-6 py-10 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <h1 className="text-3xl font-bold mb-3">Así funciona Finz</h1>
        <p className="text-muted-foreground mb-10">Tres pasos. Cada vez.</p>
        <div className="space-y-4 flex-1">
          {steps.map((s, i) => (
            <div key={s.title} className="finz-card flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium mb-0.5">Paso {i + 1}</div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <Button
          size="lg"
          onClick={start}
          disabled={loading}
          className="w-full h-14 mt-8 rounded-2xl font-semibold text-base"
        >
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin mr-2" /> Preparando todo...</>) : "Empezar mi primera lección"}
        </Button>
      </div>
    </div>
  );
}