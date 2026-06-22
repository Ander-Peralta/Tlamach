import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getCurrentCode, validateAndLoginCode } from "@/lib/user-store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tlamach — Aprende y controla tu dinero" },
      {
        name: "description",
        content:
          "Aprende finanzas personales de forma fácil. Organiza tu dinero y alcanza tus metas.",
      },
      { property: "og:title", content: "Tlamach — Aprende y controla tu dinero" },
      {
        property: "og:description",
        content: "Aprende finanzas personales de forma fácil. Organiza tu dinero y alcanza tus metas.",
      },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  const navigate = useNavigate();
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getCurrentCode()) {
      navigate({ to: "/app/inicio" });
    }
  }, [navigate]);

  const handleCode = async () => {
    setLoading(true);
    const ok = await validateAndLoginCode(code);
    setLoading(false);
    if (ok) navigate({ to: "/app/inicio" });
    else toast.error("Ese código no existe. Revísalo e intenta de nuevo.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-md text-center">
        <div className="flex flex-col items-center mb-6 relative">
          <img src="/axo.png" alt="Mascota Axo" className="w-24 h-24 mb-2 object-contain" />
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 shadow-sm border border-primary/20">
            <img src="/logo.png" alt="Tlamach Logo" className="w-12 h-12 object-contain" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3 text-primary">Tlamach</h1>
        <p className="text-lg text-foreground font-medium mb-2">
          Aprende finanzas personales de forma fácil
        </p>
        <p className="text-sm text-muted-foreground mb-10">
          Organiza tu dinero y alcanza tus metas.
        </p>

        {!showCode ? (
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full h-14 text-base font-semibold rounded-2xl"
              onClick={() => navigate({ to: "/onboarding/diagnostico" })}
            >
              Empezar <ArrowRight className="ml-1 w-5 h-5" />
            </Button>
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setShowCode(true)}
            >
              Ya tengo un código
            </button>
          </div>
        ) : (
          <div className="space-y-3 text-left">
            <label className="text-sm font-medium flex items-center gap-2">
              <KeyRound className="w-4 h-4" /> Tu código de 6 caracteres
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="h-14 text-center text-2xl font-bold tracking-[0.4em] rounded-2xl"
              placeholder="ABC123"
            />
            <Button
              size="lg"
              className="w-full h-14 rounded-2xl font-semibold"
              disabled={code.length !== 6 || loading}
              onClick={handleCode}
            >
              {loading ? "Verificando..." : "Continuar"}
            </Button>
            <button
              className="text-sm text-muted-foreground w-full text-center py-2"
              onClick={() => setShowCode(false)}
            >
              ← Volver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
