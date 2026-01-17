"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { PageHeader, FilterBar, EmptyState } from "@/components/axis";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/primitives";
import {
  taskStatuses,
  taskPriorities,
  statusLabels,
  priorityLabels,
  typeLabels,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/server/seed";
import { deleteTaskAction, deleteTasksAction, updateTaskAction } from "@/lib/server/actions";
import { handleError, handleApiResult } from "@/lib/client/utils/error-handler";
import { cn } from "@/lib/core/utils";
import { toast } from "sonner";
import {
  MoreHorizontal,
  ArrowUpDown,
  Circle,
  CircleCheck,
  CircleDot,
  CircleX,
  Timer,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Plus,
  SlidersHorizontal,
  Edit,
  Trash2,
} from "lucide-react";

// Lazy load the dialog component to reduce initial bundle size
const TaskFormDialog = dynamic(
  () => import("./task-form-dialog").then((mod) => ({ default: mod.TaskFormDialog })),
  {
    loading: () => null,
    ssr: false,
  }
);

const PAGE_SIZE = 10;

// Memoize icon maps to prevent recreation on every render
const statusIcons: Record<TaskStatus, React.ElementType> = {
  backlog: Circle,
  todo: CircleDot,
  in_progress: Timer,
  done: CircleCheck,
  canceled: CircleX,
} as const;

const priorityIcons: Record<TaskPriority, React.ElementType> = {
  high: ArrowUp,
  medium: ArrowRight,
  low: ArrowDown,
} as const;

interface TasksClientProps {
  initialTasks: Task[];
}

// Memoized task row component to prevent unnecessary re-renders
interface TaskRowProps {
  task: Task;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskRow = React.memo<TaskRowProps>(function TaskRow({
  task,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) {
  const StatusIcon = statusIcons[task.status];
  const PriorityIcon = priorityIcons[task.priority];

  return (
    <TableRow
      key={task.id}
      data-state={isSelected ? "selected" : undefined}
    >
      <TableCell>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onSelect(task.id)}
          aria-label={`Select ${task.id}`}
        />
      </TableCell>
      <TableCell className="font-medium">{task.id}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {typeLabels[task.type]}
          </Badge>
          <span className="truncate max-w-md">{task.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <StatusIcon className="h-4 w-4 text-muted-foreground" />
          <span className="capitalize">
            {statusLabels[task.status]}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <PriorityIcon
            className={cn(
              "h-4 w-4",
              task.priority === "high" && "text-red-500",
              task.priority === "medium" && "text-yellow-500",
              task.priority === "low" && "text-blue-500"
            )}
          />
          <span className="capitalize">
            {priorityLabels[task.priority]}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

TaskRow.displayName = "TaskRow";

export function TasksClient({ initialTasks }: TasksClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for tasks (can be updated after mutations)
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);

  // Initialize state from URL params (memoized to prevent unnecessary recalculations)
  const initialSearch = React.useMemo(
    () => searchParams.get("search") || "",
    [searchParams]
  );
  const initialStatus = React.useMemo(
    () => searchParams.get("status") || "",
    [searchParams]
  );
  const initialPriority = React.useMemo(
    () => searchParams.get("priority")?.split(",").filter(Boolean) || [],
    [searchParams]
  );
  const initialPage = React.useMemo(
    () => Number(searchParams.get("page")) || 1,
    [searchParams]
  );

  const [search, setSearch] = React.useState(initialSearch);
  const [statusFilter, setStatusFilter] = React.useState<string>(initialStatus);
  const [priorityFilter, setPriorityFilter] = React.useState<string[]>(initialPriority);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [page, setPage] = React.useState(initialPage);

  // Sync tasks when initialTasks changes (after server revalidation)
  React.useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Update URL when filters change (debounced with useMemo to prevent excessive updates)
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (priorityFilter.length > 0)
      params.set("priority", priorityFilter.join(","));
    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    router.replace(
      queryString ? `/tasks?${queryString}` : "/tasks",
      { scroll: false }
    );
  }, [search, statusFilter, priorityFilter, page, router]);

  // Filter tasks client-side (using server-fetched data) - memoized for performance
  const filtered = React.useMemo(() => {
    const searchLower = search.toLowerCase();
    return tasks.filter((task) => {
      const matchSearch =
        !search ||
        task.title.toLowerCase().includes(searchLower) ||
        task.id.toLowerCase().includes(searchLower);
      const matchStatus = statusFilter === "" || statusFilter === task.status;
      const matchPriority =
        priorityFilter.length === 0 || priorityFilter.includes(task.priority);
      return matchSearch && matchStatus && matchPriority;
    });
  }, [search, statusFilter, priorityFilter, tasks]);

  // Refresh tasks from server - memoized callback
  const refreshTasks = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      router.refresh(); // Triggers server component to re-fetch
    } catch (error) {
      console.error("Failed to refresh tasks:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [router]);

  // Handle task creation - memoized callback
  const handleCreateTask = React.useCallback(() => {
    setEditingTask(null);
    setDialogOpen(true);
  }, []);

  // Handle task edit - memoized callback
  const handleEditTask = React.useCallback((task: Task) => {
    setEditingTask(task);
    setDialogOpen(true);
  }, []);

  // Handle task delete - memoized callback
  const handleDeleteTask = React.useCallback(async (task: Task) => {
    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) {
      return;
    }

    const result = await deleteTaskAction({ id: task.id });
    const data = handleApiResult(result);
    
    if (data) {
      toast.success("Task deleted successfully");
      // Optimistically update local state
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      // Refresh from server
      await refreshTasks();
    }
    // Error was automatically handled by handleApiResult
  }, [refreshTasks]);

  // Handle bulk delete - memoized callback
  const handleBulkDelete = React.useCallback(async () => {
    if (selected.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selected.size} task(s)?`)) {
      return;
    }

    const ids = Array.from(selected);
    const result = await deleteTasksAction({ ids });
    const data = handleApiResult(result);
    
    if (data) {
      toast.success(`Deleted ${data.deletedCount} task(s)`);
      // Optimistically update local state
      setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
      setSelected(new Set());
      // Refresh from server
      await refreshTasks();
    }
    // Error was automatically handled by handleApiResult
  }, [selected, refreshTasks]);

  // Handle dialog success - memoized callback
  const handleDialogSuccess = React.useCallback(async () => {
    await refreshTasks();
  }, [refreshTasks]);

  // Paginate - memoized calculations
  const { totalPages, paginated } = React.useMemo(() => {
    const total = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    return { totalPages: total, paginated };
  }, [filtered, page]);

  const toggleSelect = React.useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = React.useCallback(() => {
    setSelected((prev) => {
      if (prev.size === paginated.length && paginated.length > 0) {
        return new Set();
      } else {
        return new Set(paginated.map((t) => t.id));
      }
    });
  }, [paginated]);

  // Memoize filter options to prevent recreation
  const statusOptions = React.useMemo(
    () => taskStatuses.map((s) => ({
      value: s,
      label: statusLabels[s],
    })),
    []
  );

  const priorityMenuItems = React.useMemo(
    () => taskPriorities.map((p) => ({
      label: priorityLabels[p],
      onSelect: () => {
        setPriorityFilter((prev) =>
          prev.includes(p)
            ? prev.filter((x) => x !== p)
            : [...prev, p]
        );
      },
    })),
    []
  );

  // Memoize page header actions
  const pageHeaderActions = React.useMemo(
    () => [
      {
        kind: "button" as const,
        key: "delete",
        label: `Delete (${selected.size})`,
        variant: "outline" as const,
        onClick: handleBulkDelete,
        disabled: selected.size === 0,
      },
      {
        kind: "button" as const,
        key: "add",
        label: "Add Task",
        icon: Plus,
        onClick: handleCreateTask,
      },
    ],
    [selected.size, handleBulkDelete, handleCreateTask]
  );

  return (
    <>
      <PageHeader
        title="Welcome back!"
        subtitle="Here's a list of your tasks for this month."
        actions={pageHeaderActions}
      />

      <div className="p-6 space-y-4">
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Filter tasks..."
          statusOptions={statusOptions}
          statusValue={statusFilter}
          onStatusChange={setStatusFilter}
          actions={[
            {
              kind: "menu",
              key: "priority",
              label: "Priority",
              icon: SlidersHorizontal,
              items: priorityMenuItems,
            },
          ]}
        />

        {filtered.length === 0 ? (
          <EmptyState
            preset="no-results"
            title="No tasks found"
            description="Try adjusting your filters or create a new task."
            action={{
              label: "Clear Filters",
              onClick: () => {
                setSearch("");
                setStatusFilter("");
                setPriorityFilter([]);
                setPage(1);
              },
              variant: "outline",
            }}
            variant="card"
          />
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selected.size === paginated.length &&
                          paginated.length > 0
                        }
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="w-24">Task</TableHead>
                    <TableHead>
                      <Button variant="ghost" size="sm" className="-ml-3 h-8">
                        Title
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-32">Status</TableHead>
                    <TableHead className="w-28">Priority</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      isSelected={selected.has(task.id)}
                      onSelect={toggleSelect}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {selected.size} of {filtered.length} row(s) selected.
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={page > 1 ? `/tasks?page=${page - 1}` : "#"}
                        onClick={(e) => {
                          if (page > 1) {
                            e.preventDefault();
                            setPage((p) => Math.max(1, p - 1));
                          } else {
                            e.preventDefault();
                          }
                        }}
                        aria-disabled={page === 1}
                        className={
                          page === 1 ? "pointer-events-none opacity-50" : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href={`/tasks?page=${p}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setPage(p);
                            }}
                            isActive={p === page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href={
                          page < totalPages ? `/tasks?page=${page + 1}` : "#"
                        }
                        onClick={(e) => {
                          if (page < totalPages) {
                            e.preventDefault();
                            setPage((p) => Math.min(totalPages, p + 1));
                          } else {
                            e.preventDefault();
                          }
                        }}
                        aria-disabled={page === totalPages}
                        className={
                          page === totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </>
        )}
      </div>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}
