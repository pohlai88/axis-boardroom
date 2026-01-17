"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/primitives";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/primitives";
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/primitives";
import { type Task, type TaskFormData, taskFormSchema } from "@/lib/contracts";
import { createTaskAction, updateTaskAction } from "@/lib/server/actions";
import { applyServerIssuesToForm } from "@/lib/shared/utils/form-issues";
import { handleError } from "@/lib/client/utils/error-handler";
import { toast } from "sonner";

const statusLabels = {
  backlog: "Backlog",
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
} as const;

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

const typeLabels = {
  bug: "Bug",
  feature: "Feature",
  documentation: "Documentation",
} as const;

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
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || "",
      type: task?.type || "feature",
      status: (task?.status || "todo") as "backlog" | "todo" | "in_progress" | "done" | "canceled",
      priority: (task?.priority || "medium") as "low" | "medium" | "high",
    },
  });

  // Reset form when dialog opens/closes or task changes
  React.useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title || "",
        type: task?.type || "feature",
        status: (task?.status || "todo") as "backlog" | "todo" | "in_progress" | "done" | "canceled",
        priority: (task?.priority || "medium") as "low" | "medium" | "high",
      });
    }
  }, [task, open, form]);

  const onSubmit = async (data: TaskFormData) => {
    const input = task ? { ...data, id: task.id } : data;
    const result = task 
      ? await updateTaskAction(input) 
      : await createTaskAction(input);

    if (!result.ok) {
      // Map server validation issues back to form fields
      applyServerIssuesToForm(form.setError, result.error.issues);
      // Use standardized error handler (toast is handled automatically)
      handleError(result, { showToast: true });
      return;
    }

    toast.success(task ? "Task updated successfully" : "Task created successfully");
    onOpenChange(false);
    onSuccess?.();
  };

  const isBusy = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {task
                  ? "Update the task details below."
                  : "Fill in the details to create a new task."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} disabled={isBusy} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type Field */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isBusy}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status Field */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isBusy}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority Field */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isBusy}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(priorityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isBusy}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isBusy || !form.formState.isValid}>
                {isBusy ? "Saving..." : task ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
});

TaskFormDialog.displayName = "TaskFormDialog";
