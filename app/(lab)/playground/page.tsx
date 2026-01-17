"use client";

import React from "react";
import { PageHeader, FormShell } from "@/components/axis";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Label,
  Separator,
} from "@/components/primitives";
import {
  playgroundModels,
  playgroundModes,
  playgroundPresets,
  playgroundDefaults,
  playgroundExamples,
  type PlaygroundMode,
} from "@/lib/server/seed";
import { cn } from "@/lib/core/utils";
import { Save, Share2, RotateCcw, Play, Sparkles } from "lucide-react";

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  description,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm text-muted-foreground tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
      />
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export default function PlaygroundPage() {
  const [model, setModel] = React.useState(playgroundDefaults.model);
  const [mode, setMode] = React.useState<PlaygroundMode>(playgroundDefaults.mode);
  const [temperature, setTemperature] = React.useState(playgroundDefaults.temperature);
  const [maxLength, setMaxLength] = React.useState(playgroundDefaults.maxLength);
  const [topP, setTopP] = React.useState(playgroundDefaults.topP);
  const [prompt, setPrompt] = React.useState("");
  const [output, setOutput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const selectedModel = playgroundModels.find((m) => m.id === model);

  const applyPreset = (presetId: string) => {
    const preset = playgroundPresets.find((p) => p.id === presetId);
    if (preset) {
      setTemperature(preset.temperature);
      setMaxLength(preset.maxLength);
      setTopP(preset.topP);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setOutput("");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setOutput(`[${selectedModel?.name}] Response to: "${prompt.slice(0, 50)}..."\n\nThis is a simulated response demonstrating the playground UI. In production, this would connect to an actual AI model API.`);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Playground"
        actions={[
          { kind: "icon-button", key: "save", icon: Save, ariaLabel: "Save", onClick: () => {}, tooltip: "Save" },
          { kind: "icon-button", key: "share", icon: Share2, ariaLabel: "Share", onClick: () => {}, tooltip: "Share" },
          { kind: "button", key: "submit", label: "Submit", icon: Play, onClick: handleSubmit },
        ]}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Settings */}
          <div className="space-y-6">
            {/* Mode Tabs */}
            <div className="space-y-2">
              <Label>Mode</Label>
              <Tabs value={mode} onValueChange={(v) => setMode(v as PlaygroundMode)}>
                <TabsList className="w-full">
                  {playgroundModes.map((m) => (
                    <TabsTrigger key={m} value={m} className="flex-1 capitalize">
                      {m}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {playgroundModels.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <div className="flex flex-col">
                        <span>{m.name}</span>
                        <span className="text-xs text-muted-foreground">{m.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Presets */}
            <div className="space-y-2">
              <Label>Presets</Label>
              <div className="flex gap-2">
                {playgroundPresets.map((preset) => (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset.id)}
                    className="flex-1"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Sliders */}
            <Slider
              label="Temperature"
              value={temperature}
              onChange={setTemperature}
              min={0}
              max={2}
              step={0.1}
              description="Controls randomness: lower is more deterministic"
            />

            <Slider
              label="Maximum Length"
              value={maxLength}
              onChange={setMaxLength}
              min={1}
              max={4096}
              step={1}
              description="Maximum number of tokens to generate"
            />

            <Slider
              label="Top P"
              value={topP}
              onChange={setTopP}
              min={0}
              max={1}
              step={0.1}
              description="Nucleus sampling threshold"
            />

            <Button variant="outline" size="sm" className="w-full" onClick={() => {
              setTemperature(playgroundDefaults.temperature);
              setMaxLength(playgroundDefaults.maxLength);
              setTopP(playgroundDefaults.topP);
            }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Prompt
                </CardTitle>
                <CardDescription>Enter your prompt or select an example below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Example Buttons */}
                <div className="flex flex-wrap gap-2">
                  {playgroundExamples.map((ex) => (
                    <Button
                      key={ex.label}
                      variant="outline"
                      size="sm"
                      onClick={() => setPrompt(ex.prompt)}
                    >
                      {ex.label}
                    </Button>
                  ))}
                </div>

                <Textarea
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </CardContent>
            </Card>

            {/* Output */}
            <Card>
              <CardHeader>
                <CardTitle>Output</CardTitle>
                <CardDescription>
                  {selectedModel?.name} • Temperature: {temperature} • Max Length: {maxLength}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className={cn(
                  "min-h-[200px] p-4 rounded-md border bg-muted/50 font-mono text-sm whitespace-pre-wrap",
                  isLoading && "animate-pulse"
                )}>
                  {isLoading ? (
                    <span className="text-muted-foreground">Generating...</span>
                  ) : output ? (
                    output
                  ) : (
                    <span className="text-muted-foreground">Output will appear here...</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
