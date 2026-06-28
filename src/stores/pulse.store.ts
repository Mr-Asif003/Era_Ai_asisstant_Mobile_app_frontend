import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotifType = "message" | "mention" | "reaction" | "voice" | "era" | "group";

export interface PulseNotification {
  id: string;
  type: NotifType;
  sender: string;
  avatar: string;
  avatarColor: [string, string];
  body: string;
  time: string;
  read: boolean;
}

export type Priority = "low" | "medium" | "high";

export interface Reminder {
  id: string;
  title: string;
  time: string;
  date: string;
  repeat: "none" | "daily" | "weekly";
  done: boolean;
  priority: Priority;
}

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  tags: string[];
  createdBy: "user" | "era";
  subtasks?: Subtask[];
}

export interface Mention {
  id: string;
  sender: string;
  avatar: string;
  avatarColor: [string, string];
  context: string;
  chat: string;
  chatType: "dm" | "group";
  time: string;
  read: boolean;
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface PulseState {
  notifications: PulseNotification[];
  reminders: Reminder[];
  tasks: Task[];
  mentions: Mention[];
  doNotDisturb: boolean;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  setDoNotDisturb: (v: boolean) => void;

  // Reminders
  addReminder: (r: Reminder) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  updateReminder: (id: string, patch: Partial<Reminder>) => void;

  // Tasks
  addTask: (t: Task) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTaskDone: (id: string) => void;
  deleteTask: (id: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  getTaskById: (id: string) => Task | undefined;

  // Mentions
  markMentionRead: (id: string) => void;
  markAllMentionsRead: () => void;

  // Derived counts (computed via getters, not stored)
  unreadNotificationCount: () => number;
  unreadMentionCount: () => number;
  dueTodayCount: () => number;
  pendingTaskCount: () => number;
}

export const usePulseStore = create<PulseState>((set, get) => ({
  notifications: [],
  reminders: [],
  tasks: [],
  mentions: [],
  doNotDisturb: false,

  // ── Notifications ──
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearAllNotifications: () => set({ notifications: [] }),

  setDoNotDisturb: (v) => set({ doNotDisturb: v }),

  // ── Reminders ──
  addReminder: (r) => set((s) => ({ reminders: [r, ...s.reminders] })),

  toggleReminder: (id) =>
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, done: !r.done } : r
      ),
    })),

  deleteReminder: (id) =>
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) })),

  updateReminder: (id, patch) =>
    set((s) => ({
      reminders: s.reminders.map((r) =>
        r.id === id ? { ...r, ...patch } : r
      ),
    })),

  // ── Tasks ──
  addTask: (t) => set((s) => ({ tasks: [t, ...s.tasks] })),

  updateTask: (id, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    })),

  toggleTaskDone: (id) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t
      ),
    })),

  deleteTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  toggleSubtask: (taskId, subtaskId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks?.map((sub) =>
                sub.id === subtaskId ? { ...sub, done: !sub.done } : sub
              ),
            }
          : t
      ),
    })),

  addSubtask: (taskId, title) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: [
                ...(t.subtasks ?? []),
                { id: Date.now().toString(), title, done: false },
              ],
            }
          : t
      ),
    })),

  deleteSubtask: (taskId, subtaskId) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks?.filter((sub) => sub.id !== subtaskId) }
          : t
      ),
    })),

  getTaskById: (id) => get().tasks.find((t) => t.id === id),

  // ── Mentions ──
  markMentionRead: (id) =>
    set((s) => ({
      mentions: s.mentions.map((m) =>
        m.id === id ? { ...m, read: true } : m
      ),
    })),

  markAllMentionsRead: () =>
    set((s) => ({
      mentions: s.mentions.map((m) => ({ ...m, read: true })),
    })),

  // ── Derived ──
  unreadNotificationCount: () =>
    get().notifications.filter((n) => !n.read).length,

  unreadMentionCount: () => get().mentions.filter((m) => !m.read).length,

  dueTodayCount: () =>
    get().reminders.filter((r) => !r.done && r.date === "Today").length,

  pendingTaskCount: () =>
    get().tasks.filter((t) => t.status !== "done").length,
}));