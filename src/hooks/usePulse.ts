import { useMemo } from "react";
import { usePulseStore } from "@/stores/pulse.store";

/**
 * usePulse — convenience hook that derives all badge counts and
 * filtered lists needed across the Pulse tab and the bottom tab bar badge.
 *
 * Screens should prefer this hook over reading usePulseStore directly
 * when they only need derived/read data. Mutations still go through
 * usePulseStore actions directly (addTask, toggleReminder, etc).
 */
export function usePulse() {
  const notifications = usePulseStore((s) => s.notifications);
  const reminders = usePulseStore((s) => s.reminders);
  const tasks = usePulseStore((s) => s.tasks);
  const mentions = usePulseStore((s) => s.mentions);
  const doNotDisturb = usePulseStore((s) => s.doNotDisturb);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const unreadMentions = useMemo(
    () => mentions.filter((m) => !m.read).length,
    [mentions]
  );

  const dueToday = useMemo(
    () => reminders.filter((r) => !r.done && r.date === "Today"),
    [reminders]
  );

  const upcomingReminders = useMemo(
    () => reminders.filter((r) => !r.done && r.date !== "Today"),
    [reminders]
  );

  const pendingTasks = useMemo(
    () => tasks.filter((t) => t.status !== "done"),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((t) => t.status === "done"),
    [tasks]
  );

  const highPriorityTasks = useMemo(
    () => tasks.filter((t) => t.priority === "high" && t.status !== "done"),
    [tasks]
  );

  // Total badge count shown on the Pulse tab icon in the bottom tab bar
  const totalBadgeCount = useMemo(
    () => unreadNotifications + dueToday.length,
    [unreadNotifications, dueToday]
  );

  return {
    // raw lists
    notifications,
    reminders,
    tasks,
    mentions,
    doNotDisturb,

    // derived lists
    dueToday,
    upcomingReminders,
    pendingTasks,
    completedTasks,
    highPriorityTasks,

    // counts
    unreadNotifications,
    unreadMentions,
    pendingTaskCount: pendingTasks.length,
    dueTodayCount: dueToday.length,
    totalBadgeCount,
  };
}