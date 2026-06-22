export type ExerciseType = "multiple_choice" | "classify" | "calculate" | "info";

export type PracticalKind =
  | "none"
  | "log_expense"
  | "set_income"
  | "view_balance"
  | "tag_expenses"
  | "view_fixed_summary"
  | "apply_50_30_20"
  | "set_recurring_contribution"
  | "create_goal"
  | "add_debt"
  | "choose_debt_strategy"
  | "project_compound"
  | "identify_triggers"
  | "set_long_term_goals"
  | "enable_monthly_review";

export type DynamicAnswer = "balance" | "income_50" | "income_30" | "income_20" | "fixed_total";

export interface Lesson {
  id: string;
  level: number;
  module: number;
  order: number;
  title: string;
  concept: string;
  conceptDetail: string;
  exercise: {
    type: ExerciseType;
    prompt: string;
    options?: string[];
    correct?: number;
    items?: string[];
    buckets?: string[];
    correctMap?: number[];
    answer?: number;
    dynamicAnswer?: DynamicAnswer;
    hint?: string;
    body?: string;
  };
  practical: {
    kind: PracticalKind;
    label: string;
    description: string;
  };
  xp: number;
  practicalXp: number;
}

export const LEVEL_TITLES: Record<number, string> = {
  1: "Explorador financiero",
  2: "Controlador de gastos",
  3: "Ahorrador en construcción",
  4: "Libre de deudas (en progreso)",
  5: "Inversionista en formación",
  6: "Maestro de tu dinero",
};

export const LEVEL_SUBTITLES: Record<number, string> = {
  1: "Empieza a observar tu dinero",
  2: "Domina tus gastos",
  3: "Construye tu colchón",
  4: "Sal y evita deudas",
  5: "Haz crecer tu dinero",
  6: "Mantén el control",
};

export const MODULE_TITLES: Record<string, string> = {
  "1-1": "Conoce tu dinero",
  "1-2": "Categoriza con intención",
  "2-1": "Conoce tus ingresos",
  "2-2": "Gasto fijo vs. variable, a fondo",
  "2-3": "Tu primer presupuesto",
  "3-1": "Tu fondo de emergencia",
  "3-2": "Ahorra sin sufrir",
  "3-3": "Tu primera meta",
  "4-1": "Deuda buena vs. deuda mala",
  "4-2": "Cómo funcionan las tarjetas de crédito",
  "4-3": "Estrategia para pagar deudas",
  "5-1": "Interés compuesto",
  "5-2": "Introducción a invertir",
  "5-3": "De ahorrador a inversionista",
  "6-1": "Psicología del gasto",
  "6-2": "Metas grandes",
  "6-3": "Revisión mensual",
};

const L1: Lesson[] = [
  {
    id: "L1-M1-1", level: 1, module: 1, order: 1,
    title: "¿Qué es un gasto hormiga?",
    concept: "Un gasto hormiga es pequeño, frecuente y casi invisible.",
    conceptDetail:
      "Solos parecen inofensivos (un café, una propina, un snack), pero sumados al mes pueden equivaler a una factura entera. El primer paso para controlarlos es notarlos.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál de estos es el ejemplo más claro de gasto hormiga?",
      options: [
        "Pagar la renta cada mes",
        "Comprar un café de $40 todos los días",
        "Comprar un boleto de avión",
        "Pagar el seguro anual del auto",
      ],
      correct: 1,
    },
    practical: {
      kind: "log_expense",
      label: "Registra tu gasto hormiga de hoy",
      description: "Anota aquí mismo un gasto pequeño que hiciste hoy o ayer. Queda guardado en tu registro real.",
    },
    xp: 15, practicalXp: 10,
  },
  {
    id: "L1-M1-2", level: 1, module: 1, order: 2,
    title: "Necesidad vs deseo",
    concept: "Necesidad: lo que te mantiene funcionando. Deseo: lo que te gusta tener.",
    conceptDetail: "Ninguno es malo. Pero confundirlos hace que el dinero desaparezca. Clasificar antes de comprar te da control.",
    exercise: {
      type: "classify",
      prompt: "Clasifica cada gasto.",
      items: ["Renta del cuarto", "Suscripción a streaming", "Internet de casa", "Camiseta nueva"],
      buckets: ["Necesidad", "Deseo"],
      correctMap: [0, 1, 0, 1],
    },
    practical: {
      kind: "log_expense",
      label: "Registra un gasto de hoy",
      description: "Elige bien si fue necesidad o deseo cuando le pongas categoría.",
    },
    xp: 15, practicalXp: 10,
  },
  {
    id: "L1-M1-3", level: 1, module: 1, order: 3,
    title: "Tu primer registro",
    concept: "Lo que no se mide, no se mejora.",
    conceptDetail: "Registrar tus gastos te da una foto real de a dónde va tu dinero. No tienes que ser perfecto: empieza simple.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál es la mejor frecuencia para registrar tus gastos?",
      options: ["Una vez al año", "Cuando me acuerde", "El mismo día que ocurren", "Solo los grandes"],
      correct: 2,
    },
    practical: { kind: "log_expense", label: "Registra un gasto real", description: "Agrega cualquier gasto que hayas hecho hoy." },
    xp: 15, practicalXp: 15,
  },
  {
    id: "L1-M2-1", level: 1, module: 2, order: 1,
    title: "Por qué categorizar",
    concept: "Categorizar revela patrones que los totales esconden.",
    conceptDetail: "Saber que gastaste $4,500 en el mes te dice poco. Saber que $1,800 se fueron en comida fuera de casa te dice todo.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Para qué sirve categorizar tus gastos?",
      options: ["Para gastar más", "Para encontrar dónde se va tu dinero", "Para impresionar al banco", "Para pagar menos impuestos"],
      correct: 1,
    },
    practical: { kind: "log_expense", label: "Registra un gasto con categoría", description: "Agrega un gasto eligiendo a propósito su categoría." },
    xp: 10, practicalXp: 10,
  },
  {
    id: "L1-M2-2", level: 1, module: 2, order: 2,
    title: "Las 5 categorías base",
    concept: "Empieza con 5 categorías: Comida, Transporte, Entretenimiento, Suscripciones, Otros.",
    conceptDetail: "Más de 7 categorías y te abrumas. Menos de 4 y pierdes detalle. Cinco es el punto dulce.",
    exercise: {
      type: "classify",
      prompt: "Clasifica estos gastos.",
      items: ["Uber al trabajo", "Almuerzo en la calle", "Netflix", "Cine con amigos"],
      buckets: ["Transporte", "Comida", "Suscripciones", "Entretenimiento"],
      correctMap: [0, 1, 2, 3],
    },
    practical: { kind: "none", label: "¡Ya tienes la base!", description: "Has terminado el Nivel 1. En el siguiente desbloqueas el control real de tus gastos." },
    xp: 15, practicalXp: 10,
  },
];

const L2: Lesson[] = [
  {
    id: "L2-M1-1", level: 2, module: 1, order: 1,
    title: "¿De dónde viene tu dinero?",
    concept: "Identificar tus ingresos es tan importante como controlar tus gastos.",
    conceptDetail: "Sueldo, beca, freelance, mesada: todo cuenta. Saber cuánto entra y cuándo te da una base sólida para planear.",
    exercise: {
      type: "multiple_choice",
      prompt: "Si Ana recibe $4,000 al mes por su trabajo de medio tiempo, eso es:",
      options: ["Un gasto fijo", "Un ingreso de empleo", "Un ahorro", "Una deuda"],
      correct: 1,
    },
    practical: { kind: "set_income", label: "Registra tu ingreso mensual", description: "Anota cuánto entra a tu bolsillo en un mes promedio." },
    xp: 10, practicalXp: 5,
  },
  {
    id: "L2-M1-2", level: 2, module: 1, order: 2,
    title: "Calcula tu balance del mes",
    concept: "Ingreso − Gasto = Balance. Si el resultado es negativo, gastas más de lo que entra.",
    conceptDetail: "Esta es la regla más importante de las finanzas personales. La app puede calcularlo por ti con tus datos reales.",
    exercise: {
      type: "calculate",
      prompt: "Ana gana $4,000 al mes. Este mes gastó $3,200 en total. ¿Cuál es su balance?",
      answer: 800,
      hint: "Balance = Ingreso - Gasto.",
    },
    practical: { kind: "view_balance", label: "Tu balance del mes", description: "Ahora calcúlalo con tus propios números." },
    xp: 15, practicalXp: 0,
  },
  {
    id: "L2-M2-1", level: 2, module: 2, order: 1,
    title: "¿Por qué importa la diferencia?",
    concept: "Un gasto fijo es predecible (renta, suscripción). Uno variable cambia (comida, salidas).",
    conceptDetail: "Para los fijos, planeas. Para los variables, decides. Mezclarlos es perder control.",
    exercise: {
      type: "classify",
      prompt: "Clasifica estos gastos.",
      items: ["Renta", "Cena con amigos", "Plan de celular", "Uber del fin de semana"],
      buckets: ["Fijo", "Variable"],
      correctMap: [0, 1, 0, 1],
    },
    practical: { kind: "tag_expenses", label: "Etiqueta tus gastos como fijo o variable", description: "Marca cada gasto registrado para ver el patrón real." },
    xp: 15, practicalXp: 10,
  },
  {
    id: "L2-M2-2", level: 2, module: 2, order: 2,
    title: "Planea alrededor de tus gastos fijos",
    concept: "Tus gastos fijos son el piso mínimo del mes. Lo que sobra es con lo que puedes jugar.",
    conceptDetail: "Si tus fijos son $3,000 y tu ingreso es $4,000, sólo $1,000 son tu margen real.",
    exercise: {
      type: "calculate",
      prompt: "Suma tus gastos fijos del mes (etiquetados como 'Fijo').",
      dynamicAnswer: "fixed_total",
      hint: "Etiquétalos primero en Finanzas si aún no lo hiciste.",
    },
    practical: { kind: "view_fixed_summary", label: "Tu resumen fijos vs variables", description: "La app te muestra el total de cada uno." },
    xp: 15, practicalXp: 0,
  },
  {
    id: "L2-M3-1", level: 2, module: 3, order: 1,
    title: "¿Qué es un presupuesto?",
    concept: "Un presupuesto es un plan, no un castigo.",
    conceptDetail: "No es decirte que NO. Es decirte CUÁNTO, para que el dinero rinda lo que tú quieres.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál es un MITO común sobre los presupuestos?",
      options: [
        "Te dan claridad sobre tu dinero",
        "Son solo para gente que gana poco",
        "Te ayudan a alcanzar metas",
        "Se pueden ajustar cada mes",
      ],
      correct: 1,
    },
    practical: { kind: "none", label: "Listo para el método", description: "En la siguiente lección aprendes el 50/30/20." },
    xp: 10, practicalXp: 0,
  },
  {
    id: "L2-M3-2", level: 2, module: 3, order: 2,
    title: "El método 50/30/20",
    concept: "50% necesidades, 30% deseos, 20% ahorro.",
    conceptDetail: "Es una guía, no una ley. Funciona porque es simple y cubre las tres áreas clave.",
    exercise: {
      type: "calculate",
      prompt: "¿Cuánto debería ser tu 50% de necesidades, según tu ingreso?",
      dynamicAnswer: "income_50",
      hint: "Calculamos sobre el ingreso que ya registraste.",
    },
    practical: { kind: "apply_50_30_20", label: "Ajusta tu presupuesto según el 50/30/20", description: "La app te sugiere límites por categoría. Ajusta y guarda." },
    xp: 20, practicalXp: 0,
  },
];

const L3: Lesson[] = [
  {
    id: "L3-M1-1", level: 3, module: 1, order: 1,
    title: "¿Por qué necesitas un colchón?",
    concept: "Un fondo de emergencia es dinero separado para imprevistos: salud, trabajo, reparaciones.",
    conceptDetail: "Sin colchón, cualquier emergencia se convierte en deuda. Con colchón, es solo una mala semana.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuántos meses de gastos cubre un buen fondo de emergencia?",
      options: ["1 mes", "3 a 6 meses", "12 meses", "No es necesario"],
      correct: 1,
    },
    practical: { kind: "none", label: "Idea registrada", description: "Sigue avanzando." },
    xp: 10, practicalXp: 0,
  },
  {
    id: "L3-M1-2", level: 3, module: 1, order: 2,
    title: "Casos reales sin colchón",
    concept: "Sin ahorro, una emergencia te empuja a pedir prestado al peor costo posible.",
    conceptDetail: "El colchón no es lujo: es paz mental.",
    exercise: {
      type: "multiple_choice",
      prompt: "Tu celular se rompe y necesitas $3,000. No tienes ahorro. ¿Cuál es la PEOR opción?",
      options: [
        "Reparar con tarjeta a meses sin intereses",
        "Pedir un préstamo informal a 30% mensual",
        "Pedir prestado a un familiar de confianza",
        "Esperar 2 semanas y ahorrar primero",
      ],
      correct: 1,
    },
    practical: { kind: "none", label: "Sigamos", description: "Vamos a aprender a ahorrar sin sufrir." },
    xp: 10, practicalXp: 0,
  },
  {
    id: "L3-M2-1", level: 3, module: 2, order: 1,
    title: "Págate a ti mismo primero",
    concept: "Separa el ahorro APENAS te llega el dinero, no al final del mes.",
    conceptDetail: "Si esperas a ver 'qué sobra', nunca sobra. Si lo separas primero, te acostumbras a vivir con el resto.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuándo es mejor mover dinero a tu ahorro?",
      options: ["Al final del mes con lo que sobre", "Apenas recibes tu ingreso", "Sólo en diciembre", "Cuando ya no quieras gastar"],
      correct: 1,
    },
    practical: { kind: "none", label: "Estás listo", description: "En la siguiente lección lo automatizas." },
    xp: 10, practicalXp: 0,
  },
  {
    id: "L3-M2-2", level: 3, module: 2, order: 2,
    title: "Automatización y ahorro por defecto",
    concept: "Lo automático gana siempre a lo que requiere fuerza de voluntad.",
    conceptDetail: "Si decides de antemano cuánto vas a aportar a tu meta cada mes, sólo tienes que cumplir el plan una vez.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Por qué un aporte automático funciona mejor que decidir cada mes?",
      options: ["Es más caro", "Quita la duda y la fricción", "Suma menos al año", "No funciona en realidad"],
      correct: 1,
    },
    practical: { kind: "set_recurring_contribution", label: "Configura un aporte recurrente sugerido", description: "Define cuánto vas a apartar para tu meta cada mes." },
    xp: 15, practicalXp: 0,
  },
  {
    id: "L3-M3-1", level: 3, module: 3, order: 1,
    title: "Metas SMART aplicadas a dinero",
    concept: "Una meta sin número y sin fecha es solo un deseo.",
    conceptDetail: "Específica, Medible, Alcanzable, Relevante y con Tiempo: así sí pasa.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál es la mejor meta?",
      options: [
        "Quiero ahorrar más",
        "Ahorrar algo para vacaciones",
        "Ahorrar $5,000 para el 1 de junio para un viaje a la playa",
        "Ahorrar muchísimo este año",
      ],
      correct: 2,
    },
    practical: { kind: "none", label: "Tienes la fórmula", description: "Ahora créala de verdad." },
    xp: 10, practicalXp: 0,
  },
  {
    id: "L3-M3-2", level: 3, module: 3, order: 2,
    title: "Crea tu meta",
    concept: "Una meta escrita en la app es 10 veces más probable de cumplirse.",
    conceptDetail: "Monto, fecha, nombre. Eso basta para empezar.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Qué tres elementos hacen real una meta financiera?",
      options: [
        "Suerte, esperanza y tiempo",
        "Monto, fecha y nombre concreto",
        "Mucho dinero, app y banco",
        "Sólo un nombre bonito",
      ],
      correct: 1,
    },
    practical: { kind: "create_goal", label: "Crea tu primera meta real", description: "Define monto, fecha y nombre. Queda guardada en Finanzas." },
    xp: 20, practicalXp: 0,
  },
];

const L4: Lesson[] = [
  {
    id: "L4-M1-1", level: 4, module: 1, order: 1,
    title: "Deuda que construye vs. deuda que destruye",
    concept: "Hay deuda que te empuja adelante (educación productiva) y deuda que te ancla (consumo a interés alto).",
    conceptDetail: "Pregunta clave: ¿esta deuda me dará más ingresos o sólo cosas?",
    exercise: {
      type: "classify",
      prompt: "Clasifica como 'Construye' o 'Destruye'.",
      items: [
        "Crédito estudiantil para una carrera con buena empleabilidad",
        "Tarjeta a 60% anual para una pantalla nueva",
        "Préstamo para herramientas de tu negocio",
        "Compra a meses sin intereses de ropa que no necesitas",
      ],
      buckets: ["Construye", "Destruye"],
      correctMap: [0, 1, 0, 1],
    },
    practical: { kind: "none", label: "Distinción clara", description: "Sigamos con tarjetas de crédito." },
    xp: 10, practicalXp: 0,
  },
  {
    id: "L4-M2-1", level: 4, module: 2, order: 1,
    title: "El pago mínimo, la trampa silenciosa",
    concept: "Pagar solo el mínimo puede triplicar lo que debes y tardar años.",
    conceptDetail: "Si debes $5,000 al 36% anual y solo pagas el mínimo (~3% mensual), tardas más de 10 años y pagas casi el doble en intereses.",
    exercise: {
      type: "multiple_choice",
      prompt: "Si debes $5,000 al 36% anual y solo pagas el mínimo (3%), aproximadamente ¿cuánto tardas en saldarla?",
      options: ["6 meses", "1 año", "Más de 10 años", "Nunca termina si sigues usándola"],
      correct: 2,
    },
    practical: { kind: "add_debt", label: "Registra una deuda real", description: "Si tienes una deuda, anótala aquí: monto, tasa y pago mínimo. Si no, usa una de ejemplo." },
    xp: 20, practicalXp: 0,
  },
  {
    id: "L4-M3-1", level: 4, module: 3, order: 1,
    title: "Bola de nieve vs. avalancha",
    concept: "Bola de nieve: la más pequeña primero (motivación). Avalancha: la de mayor interés primero (matemática).",
    conceptDetail: "Ambas funcionan. La mejor es la que te haces caso a ti mismo.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Qué estrategia ahorra más dinero en intereses?",
      options: ["Bola de nieve", "Avalancha", "Pago mínimo", "Ignorar la deuda"],
      correct: 1,
    },
    practical: { kind: "choose_debt_strategy", label: "Elige tu estrategia", description: "Marca cuál vas a usar. Queda asociada a tu deuda registrada." },
    xp: 20, practicalXp: 0,
  },
];

const L5: Lesson[] = [
  {
    id: "L5-M1-1", level: 5, module: 1, order: 1,
    title: "La bola de nieve del dinero",
    concept: "El interés compuesto hace que tus intereses generen más intereses.",
    conceptDetail: "Mientras antes empieces, menos esfuerzo necesitas. El tiempo es el ingrediente mágico.",
    exercise: {
      type: "info",
      prompt: "Mueve los controles y mira cómo crece tu dinero.",
      body: "En la siguiente pantalla puedes simular con monto mensual, años y tasa.",
    },
    practical: { kind: "project_compound", label: "Proyecta tu meta con interés compuesto", description: "Ve cuánto crecería tu meta activa si la inviertes." },
    xp: 20, practicalXp: 0,
  },
  {
    id: "L5-M2-1", level: 5, module: 2, order: 1,
    title: "Qué es invertir, sin tecnicismos",
    concept: "Invertir es poner tu dinero a trabajar asumiendo cierto riesgo para que crezca.",
    conceptDetail: "Riesgo, tiempo y retorno son los tres lados de la misma moneda. Menos riesgo = menos retorno.",
    exercise: {
      type: "multiple_choice",
      prompt: "Generalmente, mayor retorno esperado viene acompañado de:",
      options: ["Menor riesgo", "Mayor riesgo", "Cero riesgo", "Riesgo igual"],
      correct: 1,
    },
    practical: { kind: "none", label: "Concepto claro", description: "Sigamos con los primeros pasos prácticos." },
    xp: 15, practicalXp: 0,
  },
  {
    id: "L5-M3-1", level: 5, module: 3, order: 1,
    title: "Primeros pasos prácticos",
    concept: "Empezar joven con poco es mejor que empezar mayor con mucho.",
    conceptDetail: "No necesitas ser experto: necesitas empezar pequeño y consistente.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál de estos es un MITO sobre invertir joven?",
      options: [
        "Necesitas mucho dinero para empezar",
        "El tiempo es tu mejor aliado",
        "Puedes empezar con poco y aumentar",
        "La constancia importa más que el monto",
      ],
      correct: 0,
    },
    practical: { kind: "none", label: "Listo para el nivel 6", description: "Cierras nivel y te conviertes en Inversionista en formación." },
    xp: 15, practicalXp: 0,
  },
];

const L6: Lesson[] = [
  {
    id: "L6-M1-1", level: 6, module: 1, order: 1,
    title: "Gasto emocional vs. racional",
    concept: "Muchos gastos no responden a una necesidad sino a una emoción: estrés, aburrimiento, premio.",
    conceptDetail: "Identificar tus disparadores es el primer paso para no caer en ellos automáticamente.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál es un disparador emocional típico de gasto?",
      options: ["Hambre real", "Aburrimiento o estrés", "Pagar la renta", "Comprar lo planeado"],
      correct: 1,
    },
    practical: { kind: "identify_triggers", label: "Identifica tus disparadores", description: "Marca los que reconozcas en ti." },
    xp: 15, practicalXp: 0,
  },
  {
    id: "L6-M2-1", level: 6, module: 2, order: 1,
    title: "Conecta tu dinero con tu vida",
    concept: "El dinero por sí solo no motiva. Lo que motiva es lo que el dinero te permite hacer.",
    conceptDetail: "Define metas a 1, 3 y 5 años. Eso le da sentido al ahorro diario.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Cuál es la mejor razón para ahorrar?",
      options: ["Por ahorrar", "Para una vida concreta que quieres", "Para presumir", "Porque es obligatorio"],
      correct: 1,
    },
    practical: { kind: "set_long_term_goals", label: "Tu mapa de metas (1, 3 y 5 años)", description: "Escribe una meta corta, una media y una grande." },
    xp: 15, practicalXp: 0,
  },
  {
    id: "L6-M3-1", level: 6, module: 3, order: 1,
    title: "Tu cierre de mes en 10 minutos",
    concept: "Una revisión mensual corta es lo que separa a quien sostiene el hábito de quien lo abandona.",
    conceptDetail: "Cinco preguntas, una vez al mes. Eso basta para ajustar y seguir.",
    exercise: {
      type: "multiple_choice",
      prompt: "¿Qué pregunta NO debería estar en tu cierre de mes?",
      options: [
        "¿Cumplí mi meta del mes?",
        "¿En qué gasté de más?",
        "¿Qué voy a ajustar el próximo mes?",
        "¿Cuánto dinero tiene mi vecino?",
      ],
      correct: 3,
    },
    practical: { kind: "enable_monthly_review", label: "Activa tu recordatorio mensual", description: "Marca el checklist y activa el recordatorio dentro de la app." },
    xp: 25, practicalXp: 0,
  },
];

export const ALL_LESSONS: Lesson[] = [...L1, ...L2, ...L3, ...L4, ...L5, ...L6];

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

export function getLessonsByLevel(level: number): Lesson[] {
  return ALL_LESSONS.filter((l) => l.level === level);
}

export function getModulesByLevel(level: number): { module: number; title: string; lessons: Lesson[] }[] {
  const lessons = getLessonsByLevel(level);
  const modules = Array.from(new Set(lessons.map((l) => l.module))).sort();
  return modules.map((m) => ({
    module: m,
    title: MODULE_TITLES[`${level}-${m}`] ?? `Módulo ${m}`,
    lessons: lessons.filter((l) => l.module === m),
  }));
}

export const MONTHLY_REVIEW_CHECKLIST: string[] = [
  "¿Cumplí mi meta de ahorro del mes?",
  "¿En qué categoría me pasé del límite?",
  "¿Qué gasto puedo recortar el próximo mes?",
  "¿Qué gasto me hizo feliz y vale repetir?",
  "¿Qué ajuste voy a hacer el mes que viene?",
];

export const EMOTIONAL_TRIGGERS: string[] = [
  "Estrés",
  "Aburrimiento",
  "Recompensa después de un día duro",
  "Presión social",
  "Ofertas y descuentos",
  "Mal humor o tristeza",
];
