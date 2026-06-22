import { Link, useRouterState } from "@tanstack/react-router";
import { Home, BookOpen, Wallet, User } from "lucide-react";

const items = [
  { to: "/app/inicio", label: "Inicio", icon: Home },
  { to: "/app/aprender", label: "Aprender", icon: BookOpen },
  { to: "/app/finanzas", label: "Finanzas", icon: Wallet },
  { to: "/app/perfil", label: "Perfil", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {items.map((item) => {
          const active = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="w-6 h-6" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}