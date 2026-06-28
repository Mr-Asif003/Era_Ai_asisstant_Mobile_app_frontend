import { useCallback } from "react";
import { usePulseStore, Reminder, Priority } from "@/stores/pulse.store";

interface CreateReminderInput {
  title: string;
  time: string;
  date: string;
  priority?: Priority;
  repeat?: Reminder["repeat"];
}

/**
 * useReminders — wraps pulse.store reminder actions and adds the
 * side effects needed in production: scheduling a local push
 * notification via expo-notifications, and (later) syncing with
 * the backend reminder.service.ts.
 *
 * For now schedulePush is a stub — wire it to expo-notifications
 * in Phase 16 (Push Notifications).
 */
export function useReminders() {
  const reminders = usePulseStore((s) => s.reminders);
  const addReminder = usePulseStore((s) => s.addReminder);
  const toggleReminder = usePulseStore((s) => s.toggleReminder);
  const deleteReminder = usePulseStore((s) => s.deleteReminder);
  const updateReminder = usePulseStore((s) => s.updateReminder);

  const create = useCallback(
    async (input: CreateReminderInput) => {
      const reminder: Reminder = {
        id: Date.now().toString(),
        title: input.title,
        time: input.time,
        date: input.date,
        priority: input.priority ?? "medium",
        repeat: input.repeat ?? "none",
        done: false,
      };
      addReminder(reminder);
      // TODO Phase 16: await schedulePushNotification(reminder)
      // TODO Phase 7: await reminderService.create(reminder) — sync to backend
      return reminder;
    },
    [addReminder]
  );

  const complete = useCallback(
    (id: string) => {
      toggleReminder(id);
      // TODO Phase 16: cancel scheduled push notification for this reminder
    },
    [toggleReminder]
  );

  const remove = useCallback(
    (id: string) => {
      deleteReminder(id);
      // TODO Phase 16: cancel scheduled push notification for this reminder
    },
    [deleteReminder]
  );

  const reschedule = useCallback(
    (id: string, time: string, date: string) => {
      updateReminder(id, { time, date });
      // TODO Phase 16: re-schedule push notification
    },
    [updateReminder]
  );

  const dueToday = reminders.filter((r) => !r.done && r.date === "Today");
  const upcoming = reminders.filter((r) => !r.done && r.date !== "Today");
  const completed = reminders.filter((r) => r.done);

  return {
    reminders,
    dueToday,
    upcoming,
    completed,
    create,
    complete,
    remove,
    reschedule,
  };
}