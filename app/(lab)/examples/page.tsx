"use client"

import * as React from "react"
import { useState } from "react"

import {
  Example,
  ExampleWrapper,
} from '@/components/features/showcase'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/_internal/ui/alert-dialog'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from '@/components/_internal/ui/avatar'
import { Badge } from '@/components/_internal/ui/badge'
import { Button } from '@/components/_internal/ui/button'
import { ButtonGroup } from '@/components/_internal/ui/button-group'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/_internal/ui/card'
import { Checkbox } from '@/components/_internal/ui/checkbox'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/_internal/ui/combobox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/_internal/ui/dropdown-menu'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/_internal/ui/empty'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from '@/components/_internal/ui/field'
import { Input } from '@/components/_internal/ui/input'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/_internal/ui/input-group'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/_internal/ui/item'
import { Label } from '@/components/_internal/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/_internal/ui/popover'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/_internal/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/_internal/ui/select'
import { Separator } from '@/components/_internal/ui/separator'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/_internal/ui/sheet'
import { Slider } from '@/components/_internal/ui/slider'
import { Spinner } from '@/components/_internal/ui/spinner'
import { Switch } from '@/components/_internal/ui/switch'
import { Textarea } from '@/components/_internal/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/_internal/ui/tooltip'
import { ThemeToggle } from '@/components/features/theme/theme-toggle'
import {
  Minus,
  Plus,
  ArrowLeft,
  ArrowDown,
  MailCheck,
  Archive,
  Clock,
  CalendarPlus,
  ListPlus,
  Tag,
  Trash2,
  ArrowRight,
  VolumeX,
  Check,
  UserMinus,
  Share,
  Copy,
  AlertCircle,
  Bot,
  Search,
  Star,
  AudioLines,
  ArrowUp,
  Bluetooth,
  MoreVertical,
  File,
  Folder,
  FolderOpen,
  Code,
  MoreHorizontal,
  Save,
  Download,
  Eye,
  Layout,
  Palette,
  Sun,
  Moon,
  Monitor,
  HelpCircle,
  FileText,
  LogOut,
  ShoppingBasket,
} from "lucide-react"

export default function ExamplesPage() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Component Examples</h1>
                <p className="text-muted-foreground">
                  Comprehensive showcase of AXIS UI components with Mira-style enhancements.
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
        <ExampleWrapper>
        <ObservabilityCard />
        <SmallFormExample />
        <FormExample />
        <FieldExamples />
        <ItemExample />
        <ButtonGroupExamples />
        <EmptyAvatarGroup />
        <InputGroupExamples />
          <SheetExample />
          <BadgeExamples />
        </ExampleWrapper>
      </div>
    </TooltipProvider>
  )
}

function FieldExamples() {
  const [gpuCount, setGpuCount] = React.useState(8)
  const [value, setValue] = useState([200, 800])
  
  const handleGpuAdjustment = React.useCallback((adjustment: number) => {
    setGpuCount((prevCount) =>
      Math.max(1, Math.min(99, prevCount + adjustment))
    )
  }, [])

  const handleGpuInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10)
      if (!isNaN(val) && val >= 1 && val <= 99) {
        setGpuCount(val)
      }
    },
    []
  )

  return (
    <Example title="Fields">
      <FieldSet className="w-full max-w-md">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Compute Environment</FieldLegend>
            <FieldDescription>
              Select the compute environment for your cluster.
            </FieldDescription>
            <RadioGroup defaultValue="kubernetes">
              <FieldLabel htmlFor="kubernetes-r2h">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Kubernetes</FieldTitle>
                    <FieldDescription>
                      Run GPU workloads on a K8s configured cluster.
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="kubernetes" id="kubernetes-r2h" />
                </Field>
              </FieldLabel>
              <FieldLabel htmlFor="vm-z4k">
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>Virtual Machine</FieldTitle>
                    <FieldDescription>
                      Access a VM configured cluster. (Coming soon)
                    </FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value="vm" id="vm-z4k" />
                </Field>
              </FieldLabel>
            </RadioGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="number-of-gpus">Number of GPUs</FieldLabel>
              <FieldDescription>You can add more later.</FieldDescription>
            </FieldContent>
            <ButtonGroup>
              <Input
                id="number-of-gpus"
                value={gpuCount}
                onChange={handleGpuInputChange}
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleGpuAdjustment(-1)}
                disabled={gpuCount <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleGpuAdjustment(1)}
                disabled={gpuCount >= 99}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </ButtonGroup>
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <FieldContent>
              <FieldLabel htmlFor="tinting">Wallpaper Tinting</FieldLabel>
              <FieldDescription>Allow the wallpaper to be tinted.</FieldDescription>
            </FieldContent>
            <Switch id="tinting" defaultChecked />
          </Field>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Checkbox id="checkbox-demo" defaultChecked />
            <FieldLabel htmlFor="checkbox-demo">
              I agree to the terms and conditions
            </FieldLabel>
          </Field>
          <FieldSeparator />
          <Field>
            <FieldTitle>Price Range</FieldTitle>
            <FieldDescription>
              Set your budget range (${value[0]} - ${value[1]}).
            </FieldDescription>
            <Slider
              value={value}
              onValueChange={(val) => setValue(val as number[])}
              max={1000}
              min={0}
              step={10}
              className="mt-2 w-full"
            />
          </Field>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
            <Button variant="outline" type="button">Cancel</Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </Example>
  )
}

function ButtonGroupExamples() {
  const [label, setLabel] = React.useState("personal")

  return (
    <Example title="Button Group" className="items-center justify-center">
      <div className="flex flex-col gap-6">
        <ButtonGroup>
          <ButtonGroup className="hidden sm:flex">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="sm">Archive</Button>
            <Button variant="outline" size="sm">Report</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline" size="sm">Snooze</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><ArrowDown className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem><MailCheck className="h-4 w-4" />Mark as Read</DropdownMenuItem>
                  <DropdownMenuItem><Archive className="h-4 w-4" />Archive</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem><Clock className="h-4 w-4" />Snooze</DropdownMenuItem>
                  <DropdownMenuItem><CalendarPlus className="h-4 w-4" />Add to Calendar</DropdownMenuItem>
                  <DropdownMenuItem><ListPlus className="h-4 w-4" />Add to List</DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger><Tag className="h-4 w-4" />Label As...</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuRadioGroup value={label} onValueChange={setLabel}>
                        <DropdownMenuRadioItem value="personal">Personal</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="work">Work</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="other">Other</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4" />Trash</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
          <ButtonGroup className="hidden sm:flex">
            <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><ArrowRight className="h-4 w-4" /></Button>
          </ButtonGroup>
        </ButtonGroup>
        <div className="flex gap-4">
          <ButtonGroup>
            <Button variant="outline">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
          </ButtonGroup>
          <ButtonGroup>
            <Button variant="outline">Follow</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon"><ArrowDown className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                  <DropdownMenuItem><VolumeX className="h-4 w-4" />Mute Conversation</DropdownMenuItem>
                  <DropdownMenuItem><Check className="h-4 w-4" />Mark as Read</DropdownMenuItem>
                  <DropdownMenuItem><UserMinus className="h-4 w-4" />Block User</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                  <DropdownMenuItem><Share className="h-4 w-4" />Share Conversation</DropdownMenuItem>
                  <DropdownMenuItem><Copy className="h-4 w-4" />Copy Conversation</DropdownMenuItem>
                  <DropdownMenuItem><AlertCircle className="h-4 w-4" />Report Conversation</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4" />Delete Conversation</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </ButtonGroup>
        </div>
      </div>
    </Example>
  )
}

function InputGroupExamples() {
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [voiceEnabled, setVoiceEnabled] = React.useState(false)

  return (
    <Example title="Input Group">
      <div className="flex flex-col gap-6">
        <InputGroup>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon><Search className="h-4 w-4" /></InputGroupAddon>
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupInput placeholder="example.com" className="!pl-1" />
          <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <InputGroupButton size="sm"><AlertCircle className="h-4 w-4" /></InputGroupButton>
              </TooltipTrigger>
              <TooltipContent>This is content in a tooltip.</TooltipContent>
            </Tooltip>
          </InputGroupAddon>
        </InputGroup>
        <Field>
          <Label htmlFor="input-secure-19" className="sr-only">Input Secure</Label>
          <InputGroup>
            <InputGroupInput id="input-secure-19" className="!pl-0.5" />
            <Popover>
              <PopoverTrigger asChild>
                <InputGroupAddon>
                  <InputGroupButton variant="secondary" size="sm"><AlertCircle className="h-4 w-4" /></InputGroupButton>
                </InputGroupAddon>
              </PopoverTrigger>
              <PopoverContent align="start" alignOffset={10} className="flex flex-col gap-1 rounded-xl text-sm">
                <p className="font-medium">Your connection is not secure.</p>
                <p>You should not enter any sensitive information on this site.</p>
              </PopoverContent>
            </Popover>
            <InputGroupAddon className="text-muted-foreground !pl-1">https://</InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                onClick={() => setIsFavorite(!isFavorite)}
                size="sm"
              >
                <Star className={`h-4 w-4 ${isFavorite ? 'fill-primary stroke-primary' : ''}`} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <ButtonGroup className="w-full">
          <ButtonGroup>
            <Button variant="outline" size="icon"><Plus className="h-4 w-4" /></Button>
          </ButtonGroup>
          <ButtonGroup className="flex-1">
            <InputGroup>
              <InputGroupInput
                placeholder={voiceEnabled ? "Record and send audio..." : "Send a message..."}
                disabled={voiceEnabled}
              />
              <InputGroupAddon align="inline-end">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InputGroupButton
                      onClick={() => setVoiceEnabled(!voiceEnabled)}
                      data-active={voiceEnabled}
                      className={voiceEnabled ? "bg-primary text-primary-foreground" : ""}
                      size="sm"
                    >
                      <AudioLines className="h-4 w-4" />
                    </InputGroupButton>
                  </TooltipTrigger>
                  <TooltipContent>Voice Mode</TooltipContent>
                </Tooltip>
              </InputGroupAddon>
            </InputGroup>
          </ButtonGroup>
        </ButtonGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Ask, Search or Chat..." />
          <InputGroupAddon align="block-end">
            <InputGroupButton variant="outline" size="sm"><Plus className="h-4 w-4" /></InputGroupButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <InputGroupButton variant="ghost">Auto</InputGroupButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start">
                <DropdownMenuItem>Auto</DropdownMenuItem>
                <DropdownMenuItem>Agent</DropdownMenuItem>
                <DropdownMenuItem>Manual</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <InputGroupText className="ml-auto">52% used</InputGroupText>
            <Separator orientation="vertical" className="!h-4" />
            <InputGroupButton variant="default" size="sm">
              <ArrowUp className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </Example>
  )
}

function EmptyAvatarGroup() {
  return (
    <Example title="Empty State">
      <Empty className="h-full flex-none border">
        <EmptyHeader>
          <EmptyMedia>
            <AvatarGroup className="grayscale">
              <Avatar size="lg">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </AvatarGroup>
          </EmptyMedia>
          <EmptyTitle>No Team Members</EmptyTitle>
          <EmptyDescription>
            Invite your team to collaborate on this project.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Show Dialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>Connect Mouse</Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogMedia>
                    <Bluetooth className="h-6 w-6" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Allow accessory to connect?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to allow the USB accessory to connect to this device?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Don&apos;t allow</AlertDialogCancel>
                  <AlertDialogAction>Allow</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </EmptyContent>
      </Empty>
    </Example>
  )
}

function FormExample() {
  return (
    <Example title="Complex Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>All transactions are secure and encrypted</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="card-name">Name on Card</FieldLabel>
                    <Input id="card-name" placeholder="John Doe" required />
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field className="col-span-2">
                      <FieldLabel htmlFor="card-number">Card Number</FieldLabel>
                      <Input id="card-number" placeholder="1234 5678 9012 3456" required />
                      <FieldDescription>Enter your 16-digit number.</FieldDescription>
                    </Field>
                    <Field className="col-span-1">
                      <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                      <Input id="cvv" placeholder="123" required />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="exp-month">Month</FieldLabel>
                      <Select defaultValue="">
                        <SelectTrigger id="exp-month"><SelectValue placeholder="MM" /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="exp-year">Year</FieldLabel>
                      <Select defaultValue="">
                        <SelectTrigger id="exp-year"><SelectValue placeholder="YYYY" /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {[2024, 2025, 2026, 2027, 2028, 2029].map((year) => (
                              <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Billing Address</FieldLegend>
                <FieldDescription>The billing address associated with your payment.</FieldDescription>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <Checkbox id="same-as-shipping" defaultChecked />
                    <FieldLabel htmlFor="same-as-shipping" className="font-normal">
                      Same as shipping address
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="comments">Comments</FieldLabel>
                    <Textarea id="comments" placeholder="Add any additional comments" />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="outline" type="button">Cancel</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Example>
  )
}

const frameworks = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] as const

function SmallFormExample() {
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    push: true,
  })
  const [theme, setTheme] = React.useState("light")

  return (
    <Example title="Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="small-form-name">Name</FieldLabel>
                  <Input id="small-form-name" placeholder="Enter your name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="small-form-role">Role</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="small-form-role"><SelectValue placeholder="Select a role" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="designer">Designer</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="small-form-framework">Framework</FieldLabel>
                <Combobox items={frameworks}>
                  <ComboboxInput id="small-form-framework" placeholder="Select a framework" />
                  <ComboboxContent>
                    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>{item}</ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <Field>
                <FieldLabel htmlFor="small-form-comments">Comments</FieldLabel>
                <Textarea id="small-form-comments" placeholder="Add any additional comments" />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="outline" type="button">Cancel</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </Example>
  )
}

function ObservabilityCard() {
  return (
    <Example title="Card" className="items-center justify-center">
      <Card className="relative w-full max-w-sm overflow-hidden pt-0">
        <div className="bg-primary absolute inset-0 z-30 aspect-video opacity-50 mix-blend-color" />
        <img
          src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Photo by mymind on Unsplash"
          className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale"
        />
        <CardHeader>
          <CardTitle>Observability Plus is replacing Monitoring</CardTitle>
          <CardDescription>
            Switch to the improved way to explore your data, with natural language.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button>
            Create Query <Plus className="h-4 w-4 ml-1" />
          </Button>
          <Badge variant="secondary" className="ml-auto">Warning</Badge>
        </CardFooter>
      </Card>
    </Example>
  )
}

function ItemExample() {
  return (
    <Example title="Item">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Item variant="outline">
          <ItemContent>
            <ItemTitle>Two-factor authentication</ItemTitle>
            <ItemDescription>Verify via email or phone number.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button size="sm" variant="secondary">Enable</Button>
          </ItemActions>
        </Item>
        <Item variant="outline" size="sm" asChild>
          <a href="#">
            <ItemMedia variant="icon"><ShoppingBasket className="h-4 w-4" /></ItemMedia>
            <ItemContent>
              <ItemTitle>Your order has been shipped.</ItemTitle>
            </ItemContent>
          </a>
        </Item>
      </div>
    </Example>
  )
}

function BadgeExamples() {
  return (
    <Example title="Badge" className="items-center justify-center">
      <div className="flex items-center justify-center gap-2">
        <Badge><Spinner className="mr-1" />Syncing</Badge>
        <Badge variant="secondary"><Spinner className="mr-1" />Updating</Badge>
        <Badge variant="outline"><Spinner className="mr-1" />Loading</Badge>
      </div>
    </Example>
  )
}

const SHEET_SIDES = ["top", "right", "bottom", "left"] as const

function SheetExample() {
  return (
    <Example title="Sheet">
      <div className="flex gap-2">
        {SHEET_SIDES.map((side) => (
          <Sheet key={side}>
            <SheetTrigger asChild>
              <Button variant="secondary" className="flex-1 capitalize">{side}</Button>
            </SheetTrigger>
            <SheetContent
              side={side}
              className="data-[side=bottom]:max-h-[50vh] data-[side=top]:max-h-[50vh]"
            >
              <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you&apos;re done.
                </SheetDescription>
              </SheetHeader>
              <div className="overflow-y-auto px-4 text-sm">
                {Array.from({ length: 5 }).map((_, index) => (
                  <p key={index} className="mb-4 leading-normal">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  </p>
                ))}
              </div>
              <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </Example>
  )
}
