/**
 * ActionSpec Core System v2
 *
 * Centralized action rendering prevents drift between PageHeader and FilterBar.
 * Used by PageHeader.actions and FilterBar.actions (both use ActionSpec[], not ReactNode).
 *
 * v2 additions: icon-button, toggle, split-button
 */

import React from "react";
import Link from "next/link";
import { Button } from "@/components/primitives";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/primitives";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Action specification types
 *
 * Instead of allowing arbitrary ReactNode, we define safe action shapes.
 */
export type ActionSpec =
  | {
      kind: "button";
      key: string;
      label: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
      size?: "sm" | "default" | "lg";
      disabled?: boolean;
      icon?: LucideIcon;
    }
  | {
      kind: "link";
      key: string;
      label: string;
      href: string;
      variant?: "default" | "outline" | "ghost";
      external?: boolean;
      icon?: LucideIcon;
    }
  | {
      kind: "menu";
      key: string;
      label: string;
      items: Array<{
        label: string;
        onSelect: () => void;
        disabled?: boolean;
        icon?: LucideIcon;
      }>;
      icon?: LucideIcon;
    }
  | {
      kind: "icon-button";
      key: string;
      icon: LucideIcon;
      ariaLabel: string;
      onClick: () => void;
      variant?: "default" | "outline" | "ghost" | "destructive";
      size?: "sm" | "default" | "lg";
      disabled?: boolean;
      tooltip?: string;
    }
  | {
      kind: "toggle";
      key: string;
      pressed: boolean;
      onPressedChange: (pressed: boolean) => void;
      icon?: LucideIcon;
      label?: string;
      ariaLabel: string;
      disabled?: boolean;
    }
  | {
      kind: "split-button";
      key: string;
      primary: {
        label: string;
        onClick: () => void;
        icon?: LucideIcon;
      };
      items: Array<{
        label: string;
        onSelect: () => void;
        disabled?: boolean;
        icon?: LucideIcon;
      }>;
      variant?: "default" | "outline" | "secondary";
      disabled?: boolean;
    };

/**
 * Render an ActionSpec as a React element
 *
 * Centralized rendering logic ensures consistency across composites.
 *
 * @param action - Action specification
 * @returns React element
 */
export function renderActionSpec(action: ActionSpec): React.ReactElement {
  switch (action.kind) {
    case "button": {
      const Icon = action.icon;
      return (
        <Button
          key={action.key}
          variant={action.variant ?? "default"}
          size={action.size ?? "default"}
          onClick={action.onClick}
          disabled={action.disabled}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      );
    }

    case "link": {
      const Icon = action.icon;
      // Use Next.js Link for internal links, <a> for external
      const isExternal = action.external || action.href.startsWith("http");
      
      return (
        <Button key={action.key} variant={action.variant ?? "default"} asChild>
          {isExternal ? (
            <a
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </a>
          ) : (
            <Link href={action.href}>
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Link>
          )}
        </Button>
      );
    }

    case "menu": {
      const Icon = action.icon;
      return (
        <DropdownMenu key={action.key}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {action.label}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {action.items.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <DropdownMenuItem
                  key={idx}
                  onSelect={item.onSelect}
                  disabled={item.disabled}
                >
                  {ItemIcon && <ItemIcon className="mr-2 h-4 w-4" />}
                  {item.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    case "icon-button": {
      const Icon = action.icon;
      const button = (
        <Button
          key={action.key}
          variant={action.variant ?? "ghost"}
          size="icon"
          onClick={action.onClick}
          disabled={action.disabled}
          aria-label={action.ariaLabel}
          className={cn(
            action.size === "sm" && "h-8 w-8",
            action.size === "lg" && "h-12 w-12"
          )}
        >
          <Icon className={cn(
            "h-4 w-4",
            action.size === "sm" && "h-3.5 w-3.5",
            action.size === "lg" && "h-5 w-5"
          )} />
        </Button>
      );

      if (action.tooltip) {
        return (
          <TooltipProvider key={action.key}>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>{action.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return button;
    }

    case "toggle": {
      const Icon = action.icon;
      return (
        <Button
          key={action.key}
          variant={action.pressed ? "secondary" : "ghost"}
          size={action.label ? "default" : "icon"}
          onClick={() => action.onPressedChange(!action.pressed)}
          disabled={action.disabled}
          aria-label={action.ariaLabel}
          aria-pressed={action.pressed}
          data-state={action.pressed ? "on" : "off"}
        >
          {Icon && <Icon className={cn("h-4 w-4", action.label && "mr-2")} />}
          {action.label}
        </Button>
      );
    }

    case "split-button": {
      const PrimaryIcon = action.primary.icon;
      return (
        <div key={action.key} className="flex">
          <Button
            variant={action.variant ?? "default"}
            onClick={action.primary.onClick}
            disabled={action.disabled}
            className="rounded-r-none"
          >
            {PrimaryIcon && <PrimaryIcon className="mr-2 h-4 w-4" />}
            {action.primary.label}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={action.variant ?? "default"}
                disabled={action.disabled}
                className="rounded-l-none border-l-0 px-2"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {action.items.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <DropdownMenuItem
                    key={idx}
                    onSelect={item.onSelect}
                    disabled={item.disabled}
                  >
                    {ItemIcon && <ItemIcon className="mr-2 h-4 w-4" />}
                    {item.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }

    default: {
      const _exhaustive: never = action;
      throw new Error(
        `Unknown action kind: ${(_exhaustive as ActionSpec).kind}`
      );
    }
  }
}

/**
 * Render an array of ActionSpecs
 *
 * @param actions - Array of action specifications
 * @returns Array of React elements
 */
export function renderActionSpecs(actions: ActionSpec[]): React.ReactElement[] {
  return actions.map(renderActionSpec);
}
