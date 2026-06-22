import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GastosTab } from "@/components/finanzas/GastosTab";
import { PresupuestoTab } from "@/components/finanzas/PresupuestoTab";
import { MetasTab } from "@/components/finanzas/MetasTab";
import { HabitosTab } from "@/components/finanzas/HabitosTab";
import { DeudasTab } from "@/components/finanzas/DeudasTab";

export const Route = createFileRoute("/app/finanzas")({ component: Finanzas });

type Tab = "gastos" | "presupuesto" | "metas" | "deudas" | "habitos";
const TABS: { key: Tab; label: string }[] = [
  { key: "gastos", label: "Gastos" },
  { key: "presupuesto", label: "Presupuesto" },
  { key: "metas", label: "Metas" },
  { key: "deudas", label: "Deudas" },
  { key: "habitos", label: "Hábitos" },
];

function Finanzas() {
  const [tab, setTab] = useState<Tab>("gastos");

  return (
    <div>
      <PageHeader title="Mis Finanzas" subtitle="Tu dinero, día a día" />

      <div className="px-5">
        <div className="flex gap-1 p-1 bg-muted rounded-2xl overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 min-w-[72px] py-2.5 px-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                tab === t.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        {tab === "gastos" && <GastosTab />}
        {tab === "presupuesto" && <PresupuestoTab />}
        {tab === "metas" && <MetasTab />}
        {tab === "deudas" && <DeudasTab />}
        {tab === "habitos" && <HabitosTab />}
      </div>
    </div>
  );
}
