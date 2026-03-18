import { CoachAction } from "@/lib/healthfit/contracts";
import {
  logCheckInEntry,
  logMealEntry,
  logWorkoutEntry,
  upsertHabitLog,
} from "@/lib/healthfit/server/member-loggers";
import { replanMemberWeek } from "@/lib/healthfit/server/adaptive-planning";

export async function executeCoachAction(userId: string, action: CoachAction) {
  if (action.type === "navigate") {
    return {
      message: "Navigation actions are handled in the client.",
      href: action.href,
    };
  }

  if (action.type === "log_workout") {
    await logWorkoutEntry({
      userId,
      ...action.payload,
      completed: true,
    });

    return {
      message: `${action.payload.workoutName} saved from the AI coach.`,
    };
  }

  if (action.type === "log_meal") {
    await logMealEntry({
      userId,
      ...action.payload,
    });

    return {
      message: `${action.payload.title} saved from the AI coach.`,
    };
  }

  if (action.type === "log_habit") {
    const habitTemplate = await upsertHabitLog({
      userId,
      habitSlug: action.payload.habitSlug,
      status: action.payload.status,
      note: action.payload.note,
    });

    return {
      message: `${habitTemplate.title} updated from the AI coach.`,
    };
  }

  if (action.type === "log_check_in") {
    await logCheckInEntry({
      userId,
      ...action.payload,
    });

    return {
      message: "Check-in saved from the AI coach.",
    };
  }

  const plan = await replanMemberWeek(userId);

  return {
    message: `${plan.mode} has been generated and your weekly program is refreshed.`,
    plan,
  };
}

export function isAutomaticCoachLogAction(action: CoachAction) {
  return (
    action.type === "log_workout" ||
    action.type === "log_meal" ||
    action.type === "log_habit" ||
    action.type === "log_check_in"
  );
}
