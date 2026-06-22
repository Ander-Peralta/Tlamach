# Plan: Finz — App de educación financiera gamificada (MVP)

App web responsive con ciclo aprender → aplicar → ganar puntos/racha. Sin login: cada usuario tiene un código de 6 caracteres que sincroniza su progreso entre dispositivos vía Lovable Cloud.

## 1. Backend (Lovable Cloud)

Activo Lovable Cloud y creo estas tablas (todas con RLS abierta por `user_code` ya que no hay auth real — el código del usuario actúa como clave de acceso, pasado en cada query):

- `users` — code (PK, 6 chars), total_xp, current_streak, max_streak, current_rank, last_activity_date, created_at, onboarding_answers (jsonb)
- `expenses` — id, user_code, amount, category, date, note
- `budget_categories` — id, user_code, name, monthly_limit
- `goals` — id, user_code, name, target_amount, deadline, is_active
- `goal_contributions` — id, goal_id, amount, date
- `habits` — id, user_code, name
- `habit_completions` — id, habit_id, date
- `lesson_progress` — id, user_code, lesson_id, completed_at
- `badges` — id, user_code, badge_key, earned_at

Seed: al crear usuario, inserto 5 categorías de presupuesto por defecto (Comida, Transporte, Entretenimiento, Suscripciones, Otros) con límites sugeridos y 3 hábitos default ("Revisar mis gastos del día", "Evitar una compra impulsiva", "Anotar un gasto").

Nota: RLS permisiva con filtro por user_code en cliente. Es un MVP sin auth real; el código funciona como un secreto compartido entre dispositivos del mismo usuario.

## 2. Contenido Nivel 1 (hardcoded en `src/data/lessons.ts`)

**Nivel 1 — Explorador financiero** (3 módulos × 3 lecciones = 9 lecciones)

- Módulo 1.1 *Conoce tu dinero*: ¿Qué es un gasto hormiga? / Necesidad vs deseo / Tu primer registro
- Módulo 1.2 *Categoriza con intención*: Por qué categorizar / Las 5 categorías base / Detecta tu fuga
- Módulo 1.3 *Empieza a observar*: Patrones semanales / El hábito de registrar / Cierre del nivel

Cada lección tiene: concepto (texto corto), ejercicio (multiple_choice | classify | calculate), acción práctica (registrar gasto, crear hábito, etc.), XP.

Niveles 2-6 visibles en mapa como "Próximamente" (bloqueados, sin contenido).

## 3. Pantallas y rutas (TanStack Router)

```
/                       → Bienvenida (redirige al dashboard si ya hay código)
/onboarding/diagnostico → 3-4 preguntas
/onboarding/como-funciona
/app                    → Layout con bottom nav (4 tabs)
  /app/inicio           → Dashboard
  /app/aprender         → Mapa de niveles
  /app/aprender/leccion/$id → Pantalla de lección
  /app/finanzas         → Sub-tabs: Gastos / Presupuesto / Metas / Hábitos
  /app/perfil           → Código, rango, insignias, stats
```

## 4. Lógica de negocio (`src/lib/business.ts`)

- `awardXp(userCode, amount, reason)` — suma XP y revisa subida de rango
- `tickStreak(userCode)` — al registrar cualquier acción válida, actualiza racha comparando con `last_activity_date`
- `checkBadges(userCode)` — tras cada acción, evalúa las 5 insignias del MVP
- `unlockNextLesson(userCode)` — lecciones secuenciales dentro de un nivel
- `getBudgetUsage(userCode, month)` — agrupa gastos por categoría / límite

## 5. Diseño

Design system en `src/styles.css` con tokens OKLCH:
- Primary: verde menta #00B894
- Accent (gamificación): coral #FF7A59
- Background: blanco hueso #FAFAFA
- Foreground: #1E1E1E
- Success / warning / destructive según spec

Tipografía: Poppins (vía `<link>` en `__root.tsx`). Bordes redondeados generosos (`--radius: 1rem`), sombras suaves, iconografía `lucide-react`.

Variantes custom de Button: `hero` (verde grande), `streak` (coral), `ghost-soft`.

## 6. Estado cliente

- `useCurrentUser()` — guarda el código en `localStorage` (solo como pointer) y carga el `users` row desde Cloud con TanStack Query
- Server functions en `src/lib/*.functions.ts` para todas las mutaciones (registrar gasto, completar lección, etc.)

## 7. Gamificación

Componente `StreakFlame`, `XpBar`, `RankBadge`, `BadgeCard`. Animación sutil con CSS al ganar XP (toast con `+15 XP`).

## 8. Fuera de scope (no construyo)

Conexión bancaria, múltiples metas, deudas, gráficas avanzadas, push, tienda de recompensas, contenido real de niveles 2-6.

## Orden de implementación

1. Activar Lovable Cloud + migración de tablas + seed helpers
2. Design system + fuente + layout shell
3. Onboarding (bienvenida + código + diagnóstico + cómo funciona)
4. Bottom nav layout `/app`
5. Mis Finanzas (4 sub-tabs) — la base operativa
6. Lógica de XP / racha / insignias
7. Contenido lecciones Nivel 1 + pantalla de lección con ejercicios
8. Mapa de niveles
9. Dashboard
10. Perfil

¿Apruebas para construir?
