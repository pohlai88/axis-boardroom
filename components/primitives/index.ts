/**
 * Primitives - Re-export shadcn components
 *
 * This is the only allowed import source for composites.
 * No logic, no modifications - pure re-exports.
 */

// Form & Input
export { Button, buttonVariants } from "@/components/_internal/ui/button";
export { Input } from "@/components/_internal/ui/input";
export { Label } from "@/components/_internal/ui/label";
export { Textarea } from "@/components/_internal/ui/textarea";
export { Checkbox } from "@/components/_internal/ui/checkbox";
export { RadioGroup, RadioGroupItem } from "@/components/_internal/ui/radio-group";
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_internal/ui/select";
export { Switch } from "@/components/_internal/ui/switch";

// Layout
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/_internal/ui/card";
export { Separator } from "@/components/_internal/ui/separator";
export { Skeleton } from "@/components/_internal/ui/skeleton";

// Navigation
export {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/_internal/ui/breadcrumb";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/_internal/ui/tabs";
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/_internal/ui/sidebar";

// Data Display
export { Badge } from "@/components/_internal/ui/badge";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/_internal/ui/table";
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/_internal/ui/pagination";
export { Progress } from "@/components/_internal/ui/progress";

// Overlay
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/_internal/ui/dialog";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/_internal/ui/dropdown-menu";
export {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/_internal/ui/popover";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/_internal/ui/tooltip";

// Feedback
export { Alert, AlertDescription, AlertTitle } from "@/components/_internal/ui/alert";
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/_internal/ui/alert-dialog";
