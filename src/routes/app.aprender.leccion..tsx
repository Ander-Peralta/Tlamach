import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getLessonById, type Lesson, type DynamicAnswer } from "@/data/lessons";
import { useUserCode } from "@/lib/user-store";
import { useUser, useExpenses } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check, Sparkles, X, PartyPopper } from "lucide-react";
import { completeLesson, RANK_NAMES } from "@/lib/business";
import { PracticalDispatch } from "@/components/practical/PracticalForms";
import { toast } from "sonner";

export const Route = createFileRoute("/app/aprender/leccion/")({ component: LessonScreen });

type Phase = "concept" | "exercise" | "practical" | "done";

function thisMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function useDynamicAnswers() {
  const code = useUserCode();
  const { data: user } = useUser(code);
  const { data: expenses = [] } = useExpenses(code);
  return useMemo(() => {
    const income = Number(user?.monthly_income ?? 0);
    const monthly = expenses.filter((e) => thisMonth(e.date));
    const spent = monthly.reduce((s, e) => s + Number(e.amount), 0);
    const fixed = monthly.filter((e) => e.kind === "fixed").reduce((s, e) => s + Number(e.amount), 0);
    return {
      income,
      balance: Math.round(income - spent),
      income_50: Math.round(income * 0.5),
      income_30: Math.round(income * 0.3),
      income_20: Math.round(income * 0.2),
      fixed_total: Math.round(fixed),
    };
  }, [user?.monthly_income, expenses]);
}

function resolveAnswer(lesson: Lesson, dyn: ReturnType<typeof useDynamicAnswers>): number {
  if (lesson.exercise.dynamicAnswer) {
    const key = lesson.exercise.dynamicAnswer as DynamicAnswer;
    return Math.round(dyn[key]);
  }
  return Number(lesson.exercise.answer ?? 0);
}

function LessonScreen() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const code = useUserCode();
  const lesson = getLessonById(id);
  const [phase, setPhase] = useState<Phase>("concept");
  const [bonusInfo, setBonusInfo] = useState<{ moduleBonus: boolean; levelBonus: boolean; newRank: number | null }>({ moduleBonus: false, levelBonus: false, newRank: null });

  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <p>Lección no encontrada.</p>
        <Button onClick={() => navigate({ to: "/app/aprender" })} className="mt-4">Volver</Button>
      </div>
    );
  }

  const exit = () => navigate({ to: "/app/aprender" });

  const finishLesson = async () => {
    if (!code) return;
    const totalXp = lesson.xp + lesson.practicalXp;
    const result = await completeLesson(code, lesson.id, totalXp);
    setBonusInfo(result);
    qc.invalidateQueries();
    let msg = `¡+${totalXp} XP!`;
    if (result.moduleBonus) msg += " +30 XP módulo";
    if (result.levelBonus) msg += " +100 XP nivel";
    toast.success(msg);
    if (result.newRank) {
      toast.success(`Nuevo rango: ${RANK_NAMES[result.newRank]}`);
    }
    setPhase("done");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex items-center justify-between p-5">
        <button onClick={exit} className="p-2 -ml-2 rounded-xl hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1 mx-4">
          {(["concept", "exercise", "practical"] as Phase[]).map((p, i) => {
            const idx = ["concept", "exercise", "practical"].indexOf(phase);
            const active = i <= idx || phase === "done";
            return <div key={p} className={`h-1.5 flex-1 rounded-full ${active ? "bg-primary" : "bg-muted"}`} />;
          })}
        </div>
        <span className="finz-chip-xp text-xs">
          <Sparkles className="w-3 h-3" /> +{lesson.xp + lesson.practicalXp}
        </span>
      </div>

      <div className="flex-1 px-5 pb-5">
        {phase === "concept" && <ConceptPhase lesson={lesson} onNext={() => setPhase("exercise")} />}
        {phase === "exercise" && <ExercisePhase lesson={lesson} onComplete={() => setPhase("practical")} />}
        {phase === "practical" && (
          <div className="flex flex-col h-full">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Acción práctica</p>
            <h2 className="text-2xl font-bold mb-2">{lesson.practical.label}</h2>
            <p className="text-sm text-muted-foreground mb-4">{lesson.practical.description}</p>
            <div className="flex-1">
              <PracticalDispatch kind={lesson.practical.kind} onComplete={finishLesson} />
            </div>
          </div>
        )}
        {phase === "done" && <DonePhase lesson={lesson} bonusInfo={bonusInfo} onExit={exit} />}
      </div>
    </div>
  );
}

function ConceptPhase({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Concepto</p>
      <h1 className="text-2xl font-bold mb-4">{lesson.title}</h1>
      <div className="finz-card bg-primary/5 border border-primary/20 mb-4">
        <p className="font-semibold text-primary mb-2">💡 Idea clave</p>
        <p className="text-base">{lesson.concept}</p>
      </div>
      <p className="text-muted-foreground leading-relaxed">{lesson.conceptDetail}</p>
      <div className="mt-auto pt-6">
        <Button onClick={onNext} className="w-full h-14 rounded-2xl font-semibold">Entendido, vamos al ejercicio</Button>
      </div>
    </div>
  );
}

function ExercisePhase({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const ex = lesson.exercise;
  if (ex.type === "multiple_choice") return <MultipleChoice lesson={lesson} onComplete={onComplete} />;
  if (ex.type === "classify") return <Classify lesson={lesson} onComplete={onComplete} />;
  if (ex.type === "info") return <InfoExercise lesson={lesson} onComplete={onComplete} />;
  return <Calculate lesson={lesson} onComplete={onComplete} />;
}

function InfoExercise({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Ejercicio</p>
      <h2 className="text-xl font-semibold mb-3">{lesson.exercise.prompt}</h2>
      {lesson.exercise.body && <p className="text-muted-foreground">{lesson.exercise.body}</p>}
      <div className="mt-auto pt-6">
        <Button onClick={onComplete} className="w-full h-14 rounded-2xl font-semibold">Continuar</Button>
      </div>
    </div>
  );
}

function MultipleChoice({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = lesson.exercise.correct as number;
  const isCorrect = selected === correct;
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Ejercicio</p>
      <h2 className="text-xl font-semibold mb-6">{lesson.exercise.prompt}</h2>
      <div className="space-y-3">
        {lesson.exercise.options?.map((opt: string, i: number) => {
          const isSel = selected === i;
          let cls = "border-border bg-card";
          if (checked) {
            if (i === correct) cls = "border-success bg-success/10";
            else if (isSel) cls = "border-destructive bg-destructive/10";
          } else if (isSel) cls = "border-primary bg-primary/5";
          return (
            <button key={opt} disabled={checked} onClick={() => setSelected(i)} className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-medium ${cls}`}>
              {opt}
            </button>
          );
        })}
      </div>
      <div className="mt-auto pt-6">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={selected === null} className="w-full h-14 rounded-2xl font-semibold">Verificar</Button>
        ) : (
          <div className={`finz-card ${isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
            <p className={`font-semibold mb-3 flex items-center gap-2 ${isCorrect ? "text-success" : "text-destructive"}`}>
              {isCorrect ? <><Check className="w-5 h-5" /> ¡Correcto!</> : <><X className="w-5 h-5" /> La respuesta es: {lesson.exercise.options?.[correct]}</>}
            </p>
            <Button onClick={onComplete} className="w-full h-12 rounded-xl">Continuar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Classify({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const { items = [], buckets = [], correctMap = [] } = lesson.exercise;
  const [assignments, setAssignments] = useState<Record<number, number | null>>(
    Object.fromEntries(items.map((_: string, i: number) => [i, null]))
  );
  const [checked, setChecked] = useState(false);
  const allAssigned = Object.values(assignments).every((v) => v !== null);
  const correct = items.every((_: string, i: number) => assignments[i] === correctMap[i]);
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Clasifica</p>
      <h2 className="text-xl font-semibold mb-4">{lesson.exercise.prompt}</h2>
      <div className="space-y-3">
        {items.map((item: string, i: number) => (
          <div key={i} className="finz-card">
            <p className="font-medium mb-3">{item}</p>
            <div className="flex gap-2">
              {buckets.map((b: string, bi: number) => {
                const sel = assignments[i] === bi;
                let cls = "border-border bg-card text-foreground";
                if (checked && sel) {
                  cls = bi === correctMap[i] ? "border-success bg-success/15 text-success" : "border-destructive bg-destructive/15 text-destructive";
                } else if (sel) cls = "border-primary bg-primary/10 text-primary";
                return (
                  <button key={b} disabled={checked} onClick={() => setAssignments({ ...assignments, [i]: bi })} className={`flex-1 py-2 px-3 rounded-xl border-2 text-sm font-medium transition-all ${cls}`}>
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto pt-6">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={!allAssigned} className="w-full h-14 rounded-2xl font-semibold">Verificar</Button>
        ) : (
          <div className={`finz-card ${correct ? "bg-success/10 border border-success/30" : "bg-warning/10 border border-warning/30"}`}>
            <p className={`font-semibold mb-3 ${correct ? "text-success" : "text-warning-foreground"}`}>
              {correct ? "¡Perfecto!" : "Algunas no eran correctas, pero igual avanzas."}
            </p>
            <Button onClick={onComplete} className="w-full h-12 rounded-xl">Continuar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Calculate({ lesson, onComplete }: { lesson: Lesson; onComplete: () => void }) {
  const dyn = useDynamicAnswers();
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const expected = resolveAnswer(lesson, dyn);
  const isCorrect = Math.abs(Number(value) - expected) <= Math.max(1, expected * 0.02);
  return (
    <div className="flex flex-col h-full">
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Calcula</p>
      <h2 className="text-xl font-semibold mb-2">{lesson.exercise.prompt}</h2>
      {lesson.exercise.hint && <p className="text-sm text-muted-foreground mb-4">{lesson.exercise.hint}</p>}
      {lesson.exercise.dynamicAnswer === "balance" && (
        <div className="finz-card mb-4 text-sm space-y-1">
          <p>Tu ingreso del mes: <span className="font-bold">${dyn.income.toLocaleString()}</span></p>
          <p>Resta tus gastos del mes y escribe el resultado.</p>
        </div>
      )}
      {(lesson.exercise.dynamicAnswer === "income_50" || lesson.exercise.dynamicAnswer === "income_30" || lesson.exercise.dynamicAnswer === "income_20") && (
        <div className="finz-card mb-4 text-sm">
          Tu ingreso registrado: <span className="font-bold">${dyn.income.toLocaleString()}</span>
        </div>
      )}
      <Input
        type="number" inputMode="numeric" value={value}
        onChange={(e) => setValue(e.target.value)} disabled={checked}
        className="h-16 text-2xl font-bold text-center rounded-2xl" placeholder="$"
      />
      <div className="mt-auto pt-6">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={!value} className="w-full h-14 rounded-2xl font-semibold">Verificar</Button>
        ) : (
          <div className={`finz-card ${isCorrect ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
            <p className={`font-semibold mb-3 flex items-center gap-2 ${isCorrect ? "text-success" : "text-destructive"}`}>
              {isCorrect ? <><Check className="w-5 h-5" /> ¡Correcto!</> : <><X className="w-5 h-5" /> La respuesta era ${expected.toLocaleString()}</>}
            </p>
            <Button onClick={onComplete} className="w-full h-12 rounded-xl">Continuar</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function DonePhase({
  lesson, bonusInfo, onExit,
}: { lesson: Lesson; bonusInfo: { moduleBonus: boolean; levelBonus: boolean; newRank: number | null }; onExit: () => void }) {
  const total = lesson.xp + lesson.practicalXp + (bonusInfo.moduleBonus ? 30 : 0) + (bonusInfo.levelBonus ? 100 : 0);
  return (
    <div className="flex flex-col h-full items-center justify-center text-center">
      <div className="w-24 h-24 rounded-3xl bg-primary/15 flex items-center justify-center mb-6">
        <PartyPopper className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-3xl font-bold mb-3">¡Lección completa!</h1>
      <p className="text-muted-foreground mb-4">Aprendiste, aplicaste y avanzaste.</p>
      <span className="finz-chip-xp text-lg mb-3">
        <Sparkles className="w-5 h-5" /> +{total} XP
      </span>
      {bonusInfo.levelBonus && (
        <div className="finz-card bg-accent/10 border border-accent/30 mb-4">
          <p className="font-bold text-accent">🏆 ¡Nivel completo!</p>
          {bonusInfo.newRank && <p className="text-sm mt-1">Nuevo rango: <span className="font-semibold">{RANK_NAMES[bonusInfo.newRank]}</span></p>}
        </div>
      )}
      <Button onClick={onExit} className="w-full h-14 rounded-2xl font-semibold mt-6">Volver al mapa</Button>
    </div>
  );
}
