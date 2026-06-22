import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useUser, useBudget, useExpenses, useGoals, useDebts } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Plus, TrendingUp } from "lucide-react";
import { EMOTIONAL_TRIGGERS, MONTHLY_REVIEW_CHECKLIST, type PracticalKind } from "@/data/lessons";
import { toast } from "sonner";

interface FormProps {
  onComplete: () => void;
}

function thisMonth(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function LogExpenseForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: budget = [] } = useBudget(code);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!code || !amount || !category) return;
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      user_code: code,
      amount: Number(amount),
      category,
      note: note || null,
      date: new Date().toISOString().slice(0, 10),
    });
    setSaving(false);
    if (error) { toast.error("No pudimos guardar el gasto."); return; }
    qc.invalidateQueries();
    toast.success("Gasto guardado en Finanzas");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground font-medium">Monto</label>
        <Input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-14 text-2xl font-bold rounded-xl" placeholder="$ 0" autoFocus />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Categoría</label>
        <div className="flex flex-wrap gap-2 mt-1">
          {budget.map((b) => (
            <button key={b.id} onClick={() => setCategory(b.name)} className={`px-3 py-2 rounded-xl text-sm font-medium border-2 ${category === b.name ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}>
              {b.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Nota (opcional)</label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: café de la mañana" />
      </div>
      <Button onClick={submit} disabled={!amount || !category || saving} className="w-full h-14 rounded-2xl font-semibold mt-2">
        Guardar gasto y completar
      </Button>
    </div>
  );
}

export function SetIncomeForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: user } = useUser(code);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (user?.monthly_income && !value) setValue(String(user.monthly_income));
  }, [user?.monthly_income]);

  const save = async () => {
    if (!code) return;
    const amt = Number(value);
    if (isNaN(amt) || amt < 0) return;
    await supabase.from("users").update({ monthly_income: amt }).eq("code", code);
    qc.invalidateQueries({ queryKey: ["user"] });
    toast.success("Ingreso guardado");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">¿Cuánto entra a tu bolsillo en un mes promedio?</p>
      <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="h-16 text-2xl font-bold text-center rounded-2xl" placeholder="$" autoFocus />
      <Button onClick={save} disabled={!value} className="w-full h-14 rounded-2xl font-semibold">Guardar y completar</Button>
    </div>
  );
}

export function ViewBalanceForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const { data: user } = useUser(code);
  const { data: expenses = [] } = useExpenses(code);
  const income = Number(user?.monthly_income ?? 0);
  const spent = expenses.filter((e) => thisMonth(e.date)).reduce((s, e) => s + Number(e.amount), 0);
  const balance = income - spent;

  return (
    <div className="space-y-3">
      <div className="tlamach-card text-center py-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Ingreso del mes</p>
        <p className="text-xl font-bold">${income.toLocaleString()}</p>
      </div>
      <div className="tlamach-card text-center py-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Gastos del mes</p>
        <p className="text-xl font-bold">${spent.toLocaleString()}</p>
      </div>
      <div className={`tlamach-card text-center py-8 ${balance >= 0 ? "bg-success/10 border border-success/30" : "bg-destructive/10 border border-destructive/30"}`}>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Tu balance</p>
        <p className={`text-4xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>${balance.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-2">{balance >= 0 ? "¡Vas bien! Te queda margen." : "Estás gastando más de lo que entra."}</p>
      </div>
      <Button onClick={onComplete} className="w-full h-14 rounded-2xl font-semibold">Entendido, completar</Button>
    </div>
  );
}

export function TagExpensesForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: expenses = [] } = useExpenses(code);
  const recent = expenses.slice(0, 10);
  const allTagged = recent.length > 0 && recent.every((e) => e.kind);

  const tag = async (id: string, kind: "fixed" | "variable") => {
    await supabase.from("expenses").update({ kind }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["expenses"] });
  };

  if (recent.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Aún no tienes gastos registrados. Agrega algunos primero en Finanzas.</p>
        <Button onClick={onComplete} className="w-full h-14 rounded-2xl font-semibold">Continuar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Marca cada gasto como fijo (predecible) o variable (cambia).</p>
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {recent.map((e) => (
          <div key={e.id} className="tlamach-card py-3">
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium">{e.category}</p>
              <p className="font-bold text-sm">${Number(e.amount).toLocaleString()}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => tag(e.id, "fixed")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 ${e.kind === "fixed" ? "border-primary bg-primary/10 text-primary" : "border-border"}`}>Fijo</button>
              <button onClick={() => tag(e.id, "variable")} className={`flex-1 py-1.5 rounded-lg text-xs font-medium border-2 ${e.kind === "variable" ? "border-accent bg-accent/10 text-accent" : "border-border"}`}>Variable</button>
            </div>
          </div>
        ))}
      </div>
      <Button onClick={onComplete} disabled={!allTagged} className="w-full h-14 rounded-2xl font-semibold">
        {allTagged ? "Listo, completar" : "Etiqueta todos para continuar"}
      </Button>
    </div>
  );
}

export function ViewFixedSummaryForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const { data: expenses = [] } = useExpenses(code);
  const monthly = expenses.filter((e) => thisMonth(e.date));
  const fixed = monthly.filter((e) => e.kind === "fixed").reduce((s, e) => s + Number(e.amount), 0);
  const variable = monthly.filter((e) => e.kind === "variable").reduce((s, e) => s + Number(e.amount), 0);
  const untagged = monthly.filter((e) => !e.kind).reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="space-y-3">
      <div className="tlamach-card bg-primary/5 border border-primary/20">
        <p className="text-xs uppercase tracking-wider text-primary mb-1">Gastos fijos del mes</p>
        <p className="text-2xl font-bold">${fixed.toLocaleString()}</p>
      </div>
      <div className="tlamach-card bg-accent/5 border border-accent/20">
        <p className="text-xs uppercase tracking-wider text-accent mb-1">Gastos variables del mes</p>
        <p className="text-2xl font-bold">${variable.toLocaleString()}</p>
      </div>
      {untagged > 0 && <p className="text-xs text-muted-foreground text-center">${untagged.toLocaleString()} sin etiquetar</p>}
      <Button onClick={onComplete} className="w-full h-14 rounded-2xl font-semibold">Continuar</Button>
    </div>
  );
}

export function Apply503020Form({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: user } = useUser(code);
  const { data: budget = [] } = useBudget(code);
  const income = Number(user?.monthly_income ?? 0);
  const needs = income * 0.5;
  const wants = income * 0.3;
  const suggested: Record<string, number> = {
    Comida: needs * 0.5,
    Transporte: needs * 0.3,
    Suscripciones: needs * 0.2,
    Entretenimiento: wants * 0.6,
    Otros: wants * 0.4,
  };
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    budget.forEach((b) => {
      initial[b.id] = String(Math.round(suggested[b.name] ?? Number(b.monthly_limit)));
    });
    setValues(initial);
  }, [budget.length, income]);

  const save = async () => {
    for (const b of budget) {
      const v = Number(values[b.id]);
      if (!isNaN(v) && v >= 0) {
        await supabase.from("budget_categories").update({ monthly_limit: v }).eq("id", b.id);
      }
    }
    qc.invalidateQueries({ queryKey: ["budget"] });
    toast.success("Presupuesto actualizado con el 50/30/20");
    onComplete();
  };

  if (income === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Necesitas registrar tu ingreso mensual primero (lección 2.1.1).</p>
        <Button onClick={onComplete} className="w-full h-14 rounded-2xl">Continuar de todos modos</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="tlamach-card bg-primary/5 border border-primary/20">
        <p className="text-xs uppercase tracking-wider text-primary mb-2">Tu 50/30/20</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div><p className="text-xs text-muted-foreground">Necesidades</p><p className="font-bold">${Math.round(needs).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Deseos</p><p className="font-bold">${Math.round(wants).toLocaleString()}</p></div>
          <div><p className="text-xs text-muted-foreground">Ahorro</p><p className="font-bold">${Math.round(income * 0.2).toLocaleString()}</p></div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">Te sugerimos estos límites. Ajusta y guarda.</p>
      {budget.map((b) => (
        <div key={b.id} className="tlamach-card flex items-center gap-3">
          <p className="font-medium flex-1">{b.name}</p>
          <Input type="number" value={values[b.id] ?? ""} onChange={(e) => setValues({ ...values, [b.id]: e.target.value })} className="h-10 w-28 rounded-lg" />
        </div>
      ))}
      <Button onClick={save} className="w-full h-14 rounded-2xl font-semibold">Guardar presupuesto</Button>
    </div>
  );
}

export function SetRecurringContributionForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: goals = [] } = useGoals(code);
  const active = goals.find((g) => g.is_active);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (active?.monthly_contribution && !value) setValue(String(active.monthly_contribution));
  }, [active?.monthly_contribution]);

  if (!active) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">No tienes una meta activa. Crea una primero en Finanzas → Metas.</p>
        <Button onClick={onComplete} className="w-full h-14 rounded-2xl">Continuar</Button>
      </div>
    );
  }

  const save = async () => {
    const amt = Number(value);
    if (isNaN(amt) || amt < 0) return;
    await supabase.from("goals").update({ monthly_contribution: amt }).eq("id", active.id);
    qc.invalidateQueries({ queryKey: ["goals"] });
    toast.success("Aporte mensual configurado");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <div className="tlamach-card">
        <p className="text-xs text-muted-foreground">Tu meta activa</p>
        <p className="font-semibold">{active.name}</p>
      </div>
      <p className="text-sm text-muted-foreground">¿Cuánto te comprometes a aportar cada mes?</p>
      <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} className="h-16 text-2xl font-bold text-center rounded-2xl" placeholder="$" autoFocus />
      <Button onClick={save} disabled={!value} className="w-full h-14 rounded-2xl font-semibold">Guardar aporte</Button>
    </div>
  );
}

export function CreateGoalForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  const save = async () => {
    if (!code || !name || !target) return;
    await supabase.from("goals").update({ is_active: false }).eq("user_code", code).eq("is_active", true);
    await supabase.from("goals").insert({
      user_code: code,
      name,
      target_amount: Number(target),
      deadline: deadline || null,
      is_active: true,
    });
    qc.invalidateQueries({ queryKey: ["goals"] });
    toast.success("Meta creada");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground font-medium">Nombre</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: Viaje a la playa" autoFocus />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Monto objetivo</label>
        <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="h-11 rounded-xl" placeholder="$" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Fecha límite</label>
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="h-11 rounded-xl" />
      </div>
      <Button onClick={save} disabled={!name || !target} className="w-full h-14 rounded-2xl font-semibold">Crear meta y completar</Button>
    </div>
  );
}

export function AddDebtForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [minPayment, setMinPayment] = useState("");

  const save = async () => {
    if (!code || !name || !amount) return;
    await supabase.from("debts").insert({
      user_code: code,
      name,
      amount: Number(amount),
      interest_rate: Number(rate || 0),
      min_payment: Number(minPayment || 0),
    });
    qc.invalidateQueries({ queryKey: ["debts"] });
    toast.success("Deuda registrada");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground font-medium">Nombre</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" placeholder="Tarjeta de crédito" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground font-medium">Monto total</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 rounded-xl" placeholder="$" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground font-medium">Tasa anual %</label>
          <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="h-11 rounded-xl" placeholder="36" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Pago mínimo mensual</label>
        <Input type="number" value={minPayment} onChange={(e) => setMinPayment(e.target.value)} className="h-11 rounded-xl" placeholder="$" />
      </div>
      <Button onClick={save} disabled={!name || !amount} className="w-full h-14 rounded-2xl font-semibold">Guardar deuda</Button>
    </div>
  );
}

export function ChooseDebtStrategyForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: debts = [] } = useDebts(code);
  const [strategy, setStrategy] = useState<"snowball" | "avalanche" | "">("");

  const save = async () => {
    if (!strategy || !code) return;
    if (debts.length > 0) {
      await supabase.from("debts").update({ strategy }).eq("user_code", code);
    }
    qc.invalidateQueries({ queryKey: ["debts"] });
    toast.success("Estrategia guardada");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <button onClick={() => setStrategy("snowball")} className={`w-full text-left tlamach-card border-2 ${strategy === "snowball" ? "border-primary bg-primary/5" : "border-transparent"}`}>
        <p className="font-semibold mb-1">🏐 Bola de nieve</p>
        <p className="text-sm text-muted-foreground">Empiezas por la deuda más pequeña. Te motiva con victorias rápidas.</p>
      </button>
      <button onClick={() => setStrategy("avalanche")} className={`w-full text-left tlamach-card border-2 ${strategy === "avalanche" ? "border-primary bg-primary/5" : "border-transparent"}`}>
        <p className="font-semibold mb-1">🏔️ Avalancha</p>
        <p className="text-sm text-muted-foreground">Empiezas por la de mayor interés. Ahorras más dinero a largo plazo.</p>
      </button>
      <Button onClick={save} disabled={!strategy} className="w-full h-14 rounded-2xl font-semibold">Guardar estrategia</Button>
    </div>
  );
}

export function ProjectCompoundForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const { data: goals = [] } = useGoals(code);
  const active = goals.find((g) => g.is_active);
  const initialMonthly = Number(active?.monthly_contribution ?? 0) || 500;
  const [monthly, setMonthly] = useState(initialMonthly);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(8);

  const r = rate / 100 / 12;
  const n = years * 12;
  const future = r === 0 ? monthly * n : monthly * ((Math.pow(1 + r, n) - 1) / r);
  const contributed = monthly * n;
  const interest = future - contributed;

  return (
    <div className="space-y-4">
      {active && <p className="text-sm text-muted-foreground">Proyección sobre tu meta: <span className="font-semibold text-foreground">{active.name}</span></p>}
      <div>
        <label className="text-xs text-muted-foreground font-medium">Aporte mensual: ${monthly.toLocaleString()}</label>
        <input type="range" min="100" max="5000" step="100" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Años: {years}</label>
        <input type="range" min="1" max="30" value={years} onChange={(e) => setYears(Number(e.target.value))} className="w-full" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">Tasa anual: {rate}%</label>
        <input type="range" min="0" max="20" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full" />
      </div>
      <div className="tlamach-card bg-primary/5 border border-primary/20 text-center py-6">
        <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Total final</p>
        <p className="text-4xl font-bold text-primary">${Math.round(future).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-2">Aportaste ${Math.round(contributed).toLocaleString()} · Ganaste ${Math.round(interest).toLocaleString()}</p>
      </div>
      <Button onClick={onComplete} className="w-full h-14 rounded-2xl font-semibold">Continuar</Button>
    </div>
  );
}

export function IdentifyTriggersForm({ onComplete }: FormProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (t: string) => {
    const next = new Set(selected);
    if (next.has(t)) next.delete(t); else next.add(t);
    setSelected(next);
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Marca todos los que te apliquen.</p>
      <div className="space-y-2">
        {EMOTIONAL_TRIGGERS.map((t) => {
          const sel = selected.has(t);
          return (
            <button key={t} onClick={() => toggle(t)} className={`w-full tlamach-card flex items-center gap-3 text-left ${sel ? "border border-primary bg-primary/5" : ""}`}>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${sel ? "bg-primary border-primary text-primary-foreground" : "border-border"}`}>
                {sel && <Check className="w-4 h-4" />}
              </div>
              <span className="font-medium">{t}</span>
            </button>
          );
        })}
      </div>
      <Button onClick={onComplete} disabled={selected.size === 0} className="w-full h-14 rounded-2xl font-semibold">Listo, completar</Button>
    </div>
  );
}

export function SetLongTermGoalsForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: user } = useUser(code);
  const existing = (user?.long_term_goals as { y1?: string; y3?: string; y5?: string } | null) ?? null;
  const [y1, setY1] = useState(existing?.y1 ?? "");
  const [y3, setY3] = useState(existing?.y3 ?? "");
  const [y5, setY5] = useState(existing?.y5 ?? "");

  const save = async () => {
    if (!code) return;
    await supabase.from("users").update({ long_term_goals: { y1, y3, y5 } }).eq("code", code);
    qc.invalidateQueries({ queryKey: ["user"] });
    toast.success("Mapa de metas guardado");
    onComplete();
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground font-medium">A 1 año</label>
        <Input value={y1} onChange={(e) => setY1(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: viaje con amigos" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">A 3 años</label>
        <Input value={y3} onChange={(e) => setY3(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: maestría o auto" />
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium">A 5 años</label>
        <Input value={y5} onChange={(e) => setY5(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: enganche de casa" />
      </div>
      <Button onClick={save} disabled={!y1 && !y3 && !y5} className="w-full h-14 rounded-2xl font-semibold">Guardar mapa</Button>
    </div>
  );
}

export function EnableMonthlyReviewForm({ onComplete }: FormProps) {
  const code = useUserCode();
  const qc = useQueryClient();
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const toggle = (i: number) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i); else next.add(i);
    setChecked(next);
  };
  const allChecked = checked.size === MONTHLY_REVIEW_CHECKLIST.length;
  const save = async () => {
    if (!code) return;
    await supabase.from("users").update({ monthly_review_enabled: true }).eq("code", code);
    qc.invalidateQueries({ queryKey: ["user"] });
    toast.success("Recordatorio mensual activado");
    onComplete();
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Marca cada pregunta para activar tu recordatorio.</p>
      <div className="space-y-2">
        {MONTHLY_REVIEW_CHECKLIST.map((q, i) => {
          const sel = checked.has(i);
          return (
            <button key={i} onClick={() => toggle(i)} className={`w-full tlamach-card flex items-center gap-3 text-left ${sel ? "bg-success/10 border border-success/30" : ""}`}>
              <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${sel ? "bg-success border-success text-success-foreground" : "border-border"}`}>
                {sel && <Check className="w-4 h-4" />}
              </div>
              <span className="text-sm">{q}</span>
            </button>
          );
        })}
      </div>
      <Button onClick={save} disabled={!allChecked} className="w-full h-14 rounded-2xl font-semibold">
        <Plus className="w-5 h-5 mr-1" /> Activar recordatorio mensual
      </Button>
    </div>
  );
}

export function NoneForm({ onComplete }: FormProps) {
  return (
    <Button onClick={onComplete} className="w-full h-14 rounded-2xl font-semibold">
      <Check className="w-5 h-5 mr-2" /> Listo, completar lección
    </Button>
  );
}

export function PracticalDispatch({ kind, onComplete }: { kind: PracticalKind; onComplete: () => void }) {
  switch (kind) {
    case "log_expense": return <LogExpenseForm onComplete={onComplete} />;
    case "set_income": return <SetIncomeForm onComplete={onComplete} />;
    case "view_balance": return <ViewBalanceForm onComplete={onComplete} />;
    case "tag_expenses": return <TagExpensesForm onComplete={onComplete} />;
    case "view_fixed_summary": return <ViewFixedSummaryForm onComplete={onComplete} />;
    case "apply_50_30_20": return <Apply503020Form onComplete={onComplete} />;
    case "set_recurring_contribution": return <SetRecurringContributionForm onComplete={onComplete} />;
    case "create_goal": return <CreateGoalForm onComplete={onComplete} />;
    case "add_debt": return <AddDebtForm onComplete={onComplete} />;
    case "choose_debt_strategy": return <ChooseDebtStrategyForm onComplete={onComplete} />;
    case "project_compound": return <ProjectCompoundForm onComplete={onComplete} />;
    case "identify_triggers": return <IdentifyTriggersForm onComplete={onComplete} />;
    case "set_long_term_goals": return <SetLongTermGoalsForm onComplete={onComplete} />;
    case "enable_monthly_review": return <EnableMonthlyReviewForm onComplete={onComplete} />;
    case "none":
    default:
      return <NoneForm onComplete={onComplete} />;
  }
}
