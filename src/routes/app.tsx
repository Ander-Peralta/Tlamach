import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { getCurrentCode } from "@/lib/user-store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  useEffect(() => {
    if (!getCurrentCode()) navigate({ to: "/" });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}