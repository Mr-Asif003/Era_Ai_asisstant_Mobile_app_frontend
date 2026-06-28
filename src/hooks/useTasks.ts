import { useCallback } from "react";
import { usePulseStore, Task, Priority, TaskStatus } from "@/stores/pulse.store";

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  tags?: string[];
  createdBy?: "user" | "era";
}

/**
 * useTasks — wraps pulse.store task actions. Used by both the
 * Tasks list screen and the Era agent (when Era creates a task
 * on the user's behalf via the create_task tool).
 */
export function useTasks() {
  const tasks = usePulseStore((s) => s.tasks);
  const addTask = usePulseStore((s) => s.addTask);
  const updateTask = usePulseStore((s) => s.updateTask);
  const toggleTaskDone = usePulseStore((s) => s.toggleTaskDone);
  const deleteTask = usePulseStore((s) => s.deleteTask);
  const toggleSubtask = usePulseStore((s) => s.toggleSubtask);
  const addSubtask = usePulseStore((s) => s.addSubtask);
  const deleteSubtask = usePulseStore((s) => s.deleteSubtask);
  const getTaskById = usePulseStore((s) => s.getTaskById);

  const create = useCallback(
    (input: CreateTaskInput) => {
      const task: Task = {
        id: Date.now().toString(),
        title: input.title,
        description: input.description,
        priority: input.priority ?? "medium",
        status: "todo",
        dueDate: input.dueDate,
        tags: input.tags ?? [],
        createdBy: input.createdBy ?? "user",
      };
      addTask(task);
      // TODO Phase 7: await taskService.create(task) — sync to backend
      return task;
    },
    [addTask]
  );

  const setStatus = useCallback(
    (id: string, status: TaskStatus) => updateTask(id, { status }),
    [updateTask]
  );

  const sortByPriority = useCallback(
    (list: Task[]) => {
      const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
      return [...list].sort((a, b) => order[a.priority] - order[b.priority]);
    },
    []
  );

  const todo = tasks.filter((t) => t.status === "todo");
  const inProgress = tasks.filter((t) => t.status === "in_progress");
  const done = tasks.filter((t) => t.status === "done");
  const eraCreated = tasks.filter((t) => t.createdBy === "era");

  const progressOf = useCallback((task: Task) => {
    if (!task.subtasks || task.subtasks.length === 0) return null;
    const completed = task.subtasks.filter((s) => s.done).length;
    return {
      completed,
      total: task.subtasks.length,
      percent: Math.round((completed / task.subtasks.length) * 100),
    };
  }, []);

  return {
    tasks,
    todo,
    inProgress,
    done,
    eraCreated,
    create,
    setStatus,
    toggleTaskDone,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    getTaskById,
    sortByPriority,
    progressOf,
  };
}