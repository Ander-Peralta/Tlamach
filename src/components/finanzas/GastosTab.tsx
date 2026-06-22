import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useExpenses, useBudget } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { recordAction } from "@/lib/business";
import { toast } from "sonner";

export function GastosTab() {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: expenses = [] } = useExpenses(code);
  const { data: budget = [] } = useBudget(code);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [kind, setKind] = useState<"fixed" | "variable" | "">("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!code || !amount || !category) return;
    setSaving(true);
    const { error } = await supabase.from("expenses").insert({
      user_code: code,
      amount: Number(amount),
      category,
      note: note || null,
      date,
      kind: kind || null,
    });
    if (error) {
      toast.error("No pudimos guardar el gasto.");
      setSaving(false);
      return;
    }
    await recordAction(code, 5);
    toast.success("Gasto registrado · +5 XP");
    setAmount(""); setCategory(""); setNote(""); setKind("");
    setShowForm(false);
    setSaving(false);
    qc.invalidateQueries();
  };

  const tagKind = async (id: string, k: "fixed" | "variable") => {
    await supabase.from("expenses").update({ kind: k }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["expenses"] });
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)} className="w-full h-14 rounded-2xl font-semibold">
          <Plus className="w-5 h-5 mr-1" /> Registrar gasto
        </Button>
      ) : (
        <div className="tlamach-card space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium">Monto</label>
            <Input
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 text-2xl font-bold rounded-xl"
              placeholder="$ 0"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Categoría</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {budget.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setCategory(b.name)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border-2 ${
                    category === b.name ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium">Tipo (opcional)</label>
            <div className="flex gap-2 mt-1">
              {(["fixed", "variable"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(kind === k ? "" : k)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 ${
                    kind === k ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"
                  }`}
                >
                  {k === "fixed" ? "Fijo" : "Variable"}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Fecha</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-xl" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Nota</label>
              <Input value={note} onChange={(e) => setNote(e.target.value)} className="h-11 rounded-xl" placeholder="Opcional" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">Cancelar</Button>
            <Button onClick={submit} disabled={saving || !amount || !category} className="flex-1 rounded-xl font-semibold">
              Guardar
            </Button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">Recientes</h3>
        {expenses.length === 0 ? (
          <div className="tlamach-card text-center text-sm text-muted-foreground py-8">
            Aún no registras gastos.
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 30).map((e) => (
              <div key={e.id} className="tlamach-card py-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium flex items-center gap-2">
                      {e.category}
                      {e.kind && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          e.kind === "fixed" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
                        }`}>
                          {e.kind === "fixed" ? "FIJO" : "VAR"}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(e.date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      {e.note ? ` · ${e.note}` : ""}
                    </p>
                  </div>
                  <p className="font-bold">${Number(e.amount).toLocaleString()}</p>
                </div>
                {!e.kind && (
                  <div className="flex gap-1 mt-2">
                    <button onClick={() => tagKind(e.id, "fixed")} className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary">
                      Marcar como Fijo
                    </button>
                    <button onClick={() => tagKind(e.id, "variable")} className="text-[11px] px-2 py-1 rounded-md bg-muted hover:bg-accent/10 hover:text-accent">
                      Marcar como Variable
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
