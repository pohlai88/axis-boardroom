"use client";

import React from "react";
import { useActionState, startTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/primitives";
import { type Task, taskStatuses, taskPriorities, taskTypes, statusLabels, priorityLabels, typeLabels } from "@/lib/seed";
import { createTaskAction, updateTaskAction, type TaskFormState } from "@/lib/actions";
import { toast } from "sonner";

// Memoize option arrays to prevent recreation
const statusOptions = taskStatuses.map((status) => ({
  value: status,
  label: statusLabels[status],
}));

const priorityOptions = taskPriorities.map((priority) => ({
  value: priority,
  label: priorityLabels[priority],
}));

const typeOptions = taskTypes.map((type) => ({
  value: type,
  label: typeLabels[type],
}));

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  onSuccess?: () => void;
}

export const TaskFormDialog = React.memo<TaskFormDialogProps>(function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}) {
  // Memoize initial form data
  const initialFormData = React.useMemo(
    () => ({
      title: task?.title || "",
      type: task?.type || "feature",
      status: task?.status || "todo",
      priority: task?.priority || "medium",
    }),
    [task]
  );

  const [formData, setFormData] = React.useState(initialFormData);

  // Use useActionState for form actions (Next.js best practice)
  const initialState: TaskFormState = { message: "" };
  const [state, formAction, pending] = useActionState(
    task ? updateTaskAction : createTaskAction,
    initialState
  );

  // Reset form when task or open state changes
  React.useEffect(() => {
    if (open) {
      if (task) {
        setFormData({
          title: task.title,
          type: task.type,
          status: task.status,
          priority: task.priority,
        });
      } else {
        setFormData({
          title: "",
          type: "feature",
          status: "todo",
          priority: "medium",
        });
      }
    }
  }, [task, open]);

  // Handle form submission with useActionState
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formDataObj = new FormData(e.currentTarget);
    
    // Add task ID if updating
    if (task) {
      formDataObj.set('id', task.id);
    }
    
    // Add form fields
    formDataObj.set('title', formData.title);
    formDataObj.set('type', formData.type);
    formDataObj.set('status', formData.status);
    formDataObj.set('priority', formData.priority);

    startTransition(() => {
      formAction(formDataObj);
    });
  };

  // Handle state changes (success/error messages)
  React.useEffect(() => {
    if (state?.message) {
      toast.success(state.message);
      onOpenChange(false);
      onSuccess?.();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription>
              {task
                ? "Update the task details below."
                : "Fill in the details to create a new task."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error message display (Next.js best practice) */}
            {state?.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive" role="alert" aria-live="polite">
                {state.error}
              </div>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter task title"
                required
                disabled={pending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, type: value as Task["type"] }))
                }
                disabled={pending}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value as Task["status"],
                  }))
                }
                disabled={pending}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: value as Task["priority"],
                  }))
                }
                disabled={pending}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : task ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});

TaskFormDialog.displayName = "TaskFormDialog";
