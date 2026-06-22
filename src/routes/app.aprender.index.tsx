import { createFileRoute, Link } from "@tanstack/react-router";
import { useUserCode } from "@/lib/user-store";
import { useLessonProgress } from "@/lib/queries";
import { ALL_LESSONS, LEVEL_TITLES, LEVEL_SUBTITLES, getModulesByLevel, type Lesson } from "@/data/lessons";
import { PageHeader } from "@/components/PageHeader";
import { isLessonUnlocked, isLevelUnlocked } from "@/lib/business";
import { Check, Lock, BookOpen, Sparkles } from "lucide-react";

export const Route = createFileRoute("/app/aprender/")({ component: Mapa });

function Mapa() {
  const code = useUserCode();
  const { data: progress = new Set<string>() } = useLessonProgress(code);

  const completedCount = ALL_LESSONS.filter((l) => progress.has(l.id)).length;
  const totalCount = ALL_LESSONS.length;

  return (
    <div>
      <PageHeader title="Aprender" subtitle={`${completedCount} de ${totalCount} lecciones completas`} />

      <div className="px-5 space-y-8 pb-6">
        {[1, 2, 3, 4, 5, 6].map((lv) => {
          const unlocked = isLevelUnlocked(lv, progress);
          const modules = getModulesByLevel(lv);
          return (
            <section key={lv} className={unlocked ? "" : "opacity-60"}>
              <LevelHeader level={lv} unlocked={unlocked} />
              <div className="space-y-5 mt-4">
                {modules.map((g) => (
                  <ModuleBlock
                    key={g.module}
                    title={g.title}
                    lessons={g.lessons}
                    progress={progress}
                    levelUnlocked={unlocked}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function LevelHeader({ level, unlocked }: { level: number; unlocked: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
        {unlocked ? level : <Lock className="w-4 h-4" />}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Nivel {level} · {LEVEL_SUBTITLES[level]}
        </p>
        <h2 className="font-semibold">{LEVEL_TITLES[level]}</h2>
      </div>
    </div>
  );
}

function ModuleBlock({
  title,
  lessons,
  progress,
  levelUnlocked,
}: {
  title: string;
  lessons: Lesson[];
  progress: Set<string>;
  levelUnlocked: boolean;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 px-1">{title}</h3>
      <div className="space-y-2">
        {lessons.map((l) => {
          const done = progress.has(l.id);
          const unlocked = levelUnlocked && isLessonUnlocked(l.id, progress);
          return <LessonItem key={l.id} lesson={l} done={done} unlocked={unlocked} />;
        })}
      </div>
    </div>
  );
}

function LessonItem({ lesson, done, unlocked }: { lesson: Lesson; done: boolean; unlocked: boolean }) {
  const inner = (
    <div className={`tlamach-card flex items-center gap-3 ${!unlocked ? "opacity-50" : ""}`}>
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
          done ? "bg-success text-success-foreground" : unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="w-5 h-5" /> : !unlocked ? <Lock className="w-4 h-4" /> : <BookOpen className="w-5 h-5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{lesson.title}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {lesson.xp + lesson.practicalXp} XP
        </p>
      </div>
    </div>
  );

  if (!unlocked) return <div>{inner}</div>;
  return (
    <Link to="/app/aprender/leccion/$id" params={{ id: lesson.id }}>
      {inner}
    </Link>
  );
}
