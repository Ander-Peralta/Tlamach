import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/onboarding/diagnostico")({
  component: Diagnostico,
});

const QUESTIONS = [
  {
    key: "situation",
    q: "¿Cómo describirías tu situación financiera hoy?",
    options: [
      "Apenas me alcanza",
      "Logro cubrir lo básico",
      "Me sobra algo a fin de mes",
      "No sé, no llevo cuenta",
    ],
  },
  {
    key: "goal",
    q: "¿Cuál es tu objetivo principal ahora mismo?",
    options: ["Controlar mis gastos", "Empezar a ahorrar", "Salir de deudas", "Entender más de dinero"],
  },
  {
    key: "knowledge",
    q: "¿Cuánto sabes de finanzas personales?",
    options: ["Casi nada", "Lo básico", "Algo más", "Bastante"],
  },
] as const;

function Diagnostico() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const current = QUESTIONS[step];

  const choose = (opt: string) => {
    const next = { ...answers, [current.key]: opt };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      sessionStorage.setItem("tlamach_onboarding", JSON.stringify(next));
      navigate({ to: "/onboarding/como-funciona" });
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-10 flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        <div className="flex gap-1.5 mb-8">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Pregunta {step + 1} de {QUESTIONS.length}
        </p>
        <h1 className="text-2xl font-semibold mb-8">{current.q}</h1>
        <div className="space-y-3">
          {current.options.map((opt) => (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className="w-full text-left p-4 rounded-2xl border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all font-medium"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}