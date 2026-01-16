"use client";

import React from "react";
import {
  PageHeader,
  FilterBar,
  DataTableShell,
  DetailPanel,
  StatCard,
  StatCardGrid,
  FormShell,
  EmptyState,
  ConfirmDialog,
  useConfirmDialog,
  StatusBadge,
  PriorityBadge,
} from "@/components/axis";
import { Input, Label, Textarea, Button } from "@/components/primitives";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  RefreshCw,
  Filter,
  Download,
  Trash2,
} from "lucide-react";

export default function DemoPage() {
  const [formState, setFormState] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [showDelete, setShowDelete] = React.useState(false);
  const [showEmptyState, setShowEmptyState] = React.useState(false);
  const { dialog, confirm } = useConfirmDialog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("loading");
    await new Promise(r => setTimeout(r, 1500));
    setFormState("success");
    setTimeout(() => setFormState("idle"), 2000);
  };

  const handleAsyncConfirm = async () => {
    const confirmed = await confirm({
      title: "Confirm Action",
      description: "This will perform an async operation.",
      variant: "warning",
      confirmLabel: "Proceed",
    });
    if (confirmed) {
      console.log("Async action confirmed!");
    }
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Page Header Demo */}
      <PageHeader
        title="AXIS Design System Demo"
        subtitle="Showcasing all composites and patterns"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Demo" },
        ]}
        actions={[
          { 
            kind: "icon-button", 
            key: "refresh", 
            icon: RefreshCw, 
            ariaLabel: "Refresh",
            onClick: () => console.log("Refresh"),
            tooltip: "Refresh data"
          },
          { 
            kind: "toggle", 
            key: "filter", 
            icon: Filter,
            pressed: false, 
            onPressedChange: () => {},
            ariaLabel: "Toggle filters"
          },
          { 
            kind: "split-button", 
            key: "create", 
            primary: { label: "Create", onClick: () => {}, icon: Plus },
            items: [
              { label: "Create Request", onSelect: () => {} },
              { label: "Create Todo", onSelect: () => {} },
            ]
          },
        ]}
      />

      <div className="p-6 space-y-12">
        {/* StatCard Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">StatCard Grid</h2>
          <StatCardGrid columns={4}>
            <StatCard
              label="Total Requests"
              value={1234}
              icon={FileText}
              trend={{ direction: "up", value: "+12%", label: "vs last month" }}
            />
            <StatCard
              label="Pending"
              value={45}
              icon={Clock}
              trend={{ direction: "neutral", value: "0%", label: "no change" }}
            />
            <StatCard
              label="Approved"
              value={892}
              icon={CheckCircle}
              trend={{ direction: "up", value: "+8%", label: "vs last month" }}
              highlight
            />
            <StatCard
              label="Rejected"
              value={23}
              icon={XCircle}
              trend={{ direction: "down", value: "-5%", label: "vs last month" }}
            />
          </StatCardGrid>
        </section>

        {/* DetailPanel Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">DetailPanel</h2>
          <DetailPanel
            title="Request #1234"
            description="Created on January 15, 2026"
            headerSlot={<StatusBadge status="pending" />}
            fields={[
              { label: "Title", value: "Budget Approval Request" },
              { label: "Status", value: <StatusBadge status="pending" /> },
              { label: "Priority", value: <PriorityBadge priority="high" /> },
              { label: "Assignee", value: "John Doe" },
              { label: "Description", value: "Request for Q1 budget allocation for marketing department.", fullWidth: true },
              { label: "Notes", value: null, isEmpty: true },
            ]}
            footerSlot={
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Delete</Button>
              </div>
            }
          />
        </section>

        {/* FilterBar Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">FilterBar</h2>
          <FilterBar
            searchValue=""
            onSearchChange={() => {}}
            searchPlaceholder="Search requests..."
            statusOptions={[
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "rejected", label: "Rejected" },
            ]}
            statusValue=""
            onStatusChange={() => {}}
            actions={[
              { kind: "icon-button", key: "download", icon: Download, ariaLabel: "Export", onClick: () => {} },
            ]}
          />
        </section>

        {/* FormShell Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">FormShell</h2>
          <div className="max-w-2xl">
            <FormShell
              title="Create New Request"
              description="Fill out the details to create a new request."
              state={formState}
              successMessage="Request created successfully!"
              onSubmit={handleSubmit}
              submitLabel="Create Request"
              onCancel={() => console.log("Cancelled")}
            >
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter request title..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Description</Label>
                <Textarea id="body" placeholder="Describe your request..." rows={4} />
              </div>
            </FormShell>
          </div>
        </section>

        {/* EmptyState Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">EmptyState</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState
              preset="no-data"
              title="No requests yet"
              description="Create your first request to get started."
              action={{ label: "Create Request", onClick: () => {} }}
              variant="card"
            />
            <EmptyState
              preset="no-results"
              title="No results found"
              description="Try adjusting your search or filters."
              action={{ label: "Clear Filters", onClick: () => {}, variant: "outline" }}
              variant="card"
            />
          </div>
        </section>

        {/* ConfirmDialog Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">ConfirmDialog</h2>
          <div className="flex gap-4">
            <Button 
              variant="destructive" 
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Item
            </Button>
            <Button 
              variant="outline" 
              onClick={handleAsyncConfirm}
            >
              Async Confirm (Hook)
            </Button>
          </div>
          
          <ConfirmDialog
            open={showDelete}
            onOpenChange={setShowDelete}
            title="Delete Request"
            description="Are you sure you want to delete this request? This action cannot be undone."
            variant="destructive"
            confirmLabel="Delete"
            onConfirm={() => console.log("Deleted!")}
          />
          {dialog}
        </section>

        {/* DataTableShell Demo */}
        <section>
          <h2 className="text-xl font-semibold mb-4">DataTableShell</h2>
          <DataTableShell
            isLoading={false}
            count={showEmptyState ? 0 : 2}
            emptyTitle="No data available"
            emptyDescription="Create some records to see them here."
            emptyAction={<Button onClick={() => setShowEmptyState(false)}>Create</Button>}
            table={
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Created</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-4">Budget Approval</td>
                    <td className="p-4"><StatusBadge status="pending" /></td>
                    <td className="p-4">Jan 15, 2026</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-4">Marketing Campaign</td>
                    <td className="p-4"><StatusBadge status="approved" /></td>
                    <td className="p-4">Jan 14, 2026</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            }
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => setShowEmptyState(!showEmptyState)}
          >
            Toggle Empty State
          </Button>
        </section>
      </div>
    </div>
  );
}
