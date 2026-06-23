import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "tlamach_user_code";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

export function generateCode(): string {
  let s = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < 6; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

export function getCurrentCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setCurrentCode(code: string) {
  localStorage.setItem(STORAGE_KEY, code);
}

export function clearCurrentCode() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function createUser(answers: Record<string, string>): Promise<string> {
  let code = generateCode();
  // ensure unique
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data } = await supabase.from("users").select("code").eq("code", code).maybeSingle();
    if (!data) break;
    code = generateCode();
  }
  await supabase.from("users").insert({ code, onboarding_answers: answers as never });

  // Seed defaults
  const defaultCategories = [
    { name: "Comida", monthly_limit: 2000 },
    { name: "Transporte", monthly_limit: 800 },
    { name: "Entretenimiento", monthly_limit: 600 },
    { name: "Suscripciones", monthly_limit: 400 },
    { name: "Otros", monthly_limit: 500 },
  ];
  await supabase
    .from("budget_categories")
    .insert(defaultCategories.map((c) => ({ ...c, user_code: code })));

  const defaultHabits = [
    "Revisar mis gastos del día",
    "Evitar una compra impulsiva",
    "Anotar todos mis gastos",
  ];
  await supabase
    .from("habits")
    .insert(defaultHabits.map((name) => ({ name, user_code: code })));

  setCurrentCode(code);
  return code;
}

export async function validateAndLoginCode(code: string): Promise<boolean> {
  const clean = code.trim().toUpperCase();
  if (clean.length !== 6) return false;
  const { data } = await supabase.from("users").select("code").eq("code", clean).maybeSingle();
  if (!data) return false;
  setCurrentCode(clean);
  return true;
}

export function useUserCode(): string | null {
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    setCode(getCurrentCode());
  }, []);
  return code;
}