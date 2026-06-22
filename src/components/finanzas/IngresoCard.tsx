import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserCode } from "@/lib/user-store";
import { useUser } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, Pencil, Check } from "lucide-react";
import { toast } from "sonner";

export function IngresoCard() {
  const code = useUserCode();
  const qc = useQueryClient();
  const { data: user } = useUser(code);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(String(user?.monthly_income ?? ""));
  }, [user?.monthly_income]);

  const save = async () => {
    if (!code) return;
    const amt = Number(value);
    if (isNaN(amt) || amt < 0) return;
    await supabase.from("users").update({ monthly_income: amt }).eq("code", code);
    qc.invalidateQueries({ queryKey: ["user"] });
    setEditing(false);
    toast.success("Ingreso actualizado");
  };

  return (
    <div className="finz-card bg-primary/5 border border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-primary">Ingreso mensual</p>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Pencil className="w-3 h-3" /> Editar
          </button>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-12 text-xl font-bold rounded-xl flex-1"
            placeholder="$"
            autoFocus
          />
          <Button onClick={save} className="h-12 rounded-xl">
            <Check className="w-5 h-5" />
          </Button>
        </div>
      ) : (
        <p className="text-2xl font-bold">${Number(user?.monthly_income ?? 0).toLocaleString()}</p>
      )}
    </div>
  );
}
