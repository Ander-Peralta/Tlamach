import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useDebts } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Plus } from "lucide-react";
import { toast } from "sonner";

export function DeudasTab() {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: debts = [] } = useDebts(code);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [minPayment, setMinPayment] = useState("");

  const submit = async () => {
    if (!code || !name || !amount) return;
    const { error } = await supabase.from("debts").insert({
      user_code: code,
      name,
      amount: Number(amount),
      interest_rate: Number(rate || 0),
      min_payment: Number(minPayment || 0),
    });
    if (error) {
      toast.error("No pudimos guardar la deuda.");
      return;
    }
    setName(""); setAmount(""); setRate(""); setMinPayment("");
    setCreating(false);
    qc.invalidateQueries({ queryKey: ["debts"] });
    toast.success("Deuda registrada");
  };

  const setStrategy = async (id: string, strategy: string) => {
    await supabase.from("debts").update({ strategy }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["debts"] });
  };

  const remove = async (id: string) => {
    await supabase.from("debts").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["debts"] });
  };

  return (
    <div className="space-y-4">
      {!creating ? (
        <Button onClick={() => setCreating(true)} className="w-full h-14 rounded-2xl font-semibold">
          <Plus className="w-5 h-5 mr-1" /> Registrar deuda
        </Button>
      ) : (
        <div className="tlamach-card space-y-3">
          <div>
            <label className="text-xs text-muted-foreground font-medium">Nombre</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" placeholder="Ej: Tarjeta de crédito" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Monto</label>
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreating(false)} className="flex-1 rounded-xl">Cancelar</Button>
            <Button onClick={submit} disabled={!name || !amount} className="flex-1 rounded-xl font-semibold">Guardar</Button>
          </div>
        </div>
      )}

      {debts.length === 0 ? (
        <div className="tlamach-card text-center text-sm text-muted-foreground py-10">
          <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" />
          Aún no tienes deudas registradas.
        </div>
      ) : (
        <div className="space-y-2">
          {debts.map((d) => (
            <div key={d.id} className="tlamach-card">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(d.interest_rate)}% anual · Mín. ${Number(d.min_payment).toLocaleString()}/mes
                  </p>
                </div>
                <p className="font-bold text-lg">${Number(d.amount).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setStrategy(d.id, "snowball")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border-2 ${
                    d.strategy === "snowball" ? "border-primary bg-primary/10 text-primary" : "border-border"
                  }`}
                >
                  Bola de nieve
                </button>
                <button
                  onClick={() => setStrategy(d.id, "avalanche")}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium border-2 ${
                    d.strategy === "avalanche" ? "border-primary bg-primary/10 text-primary" : "border-border"
                  }`}
                >
                  Avalancha
                </button>
                <button onClick={() => remove(d.id)} className="text-xs text-muted-foreground px-2">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
