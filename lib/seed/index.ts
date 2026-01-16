/**
 * Seed Data - Reusable demo/mock data
 * 
 * Import JSON seed files with type safety.
 * KISS: Single source of truth for all demo data.
 */

import tasksData from "./tasks.json";
import dashboardData from "./dashboard.json";
import playgroundData from "./playground.json";

// ============================================
// Task Types & Data
// ============================================

export type TaskStatus = "backlog" | "todo" | "in_progress" | "done" | "canceled";
export type TaskPriority = "low" | "medium" | "high";
export type TaskType = "bug" | "feature" | "documentation";

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

export const tasks = tasksData.tasks as Task[];
export const taskStatuses = tasksData.statuses as TaskStatus[];
export const taskPriorities = tasksData.priorities as TaskPriority[];
export const taskTypes = tasksData.types as TaskType[];

// ============================================
// Dashboard Types & Data
// ============================================

export type TrendDirection = "up" | "down" | "neutral";

export interface DashboardStat {
  key: string;
  label: string;
  value: string;
  trend: {
    direction: TrendDirection;
    value: string;
    label: string;
  };
}

export interface DashboardDocument {
  id: number;
  header: string;
  type: string;
  status: string;
  reviewer: string | null;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  count?: number;
}

export interface ChartPoint {
  month: string;
  visitors: number;
}

export const dashboardStats = dashboardData.stats as DashboardStat[];
export const dashboardDocuments = dashboardData.documents as DashboardDocument[];
export const dashboardNav = dashboardData.navigation as { main: NavItem[]; documents: NavItem[] };
export const dashboardChart = dashboardData.chartData as ChartPoint[];
export const dashboardTabs = dashboardData.tabs as string[];

// ============================================
// Playground Types & Data
// ============================================

export interface AIModel {
  id: string;
  name: string;
  description: string;
}

export interface AIPreset {
  id: string;
  name: string;
  temperature: number;
  maxLength: number;
  topP: number;
}

export interface AIExample {
  label: string;
  prompt: string;
}

export type PlaygroundMode = "complete" | "insert" | "edit";

export const playgroundModels = playgroundData.models as AIModel[];
export const playgroundModes = playgroundData.modes as PlaygroundMode[];
export const playgroundPresets = playgroundData.presets as AIPreset[];
export const playgroundDefaults = playgroundData.defaults as {
  model: string;
  mode: PlaygroundMode;
  temperature: number;
  maxLength: number;
  topP: number;
};
export const playgroundExamples = playgroundData.examples as AIExample[];

// ============================================
// Utility: Status/Priority display maps
// ============================================

export const statusLabels: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

export const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const typeLabels: Record<TaskType, string> = {
  bug: "Bug",
  feature: "Feature",
  documentation: "Documentation",
};
