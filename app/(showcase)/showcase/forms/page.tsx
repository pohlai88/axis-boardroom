"use client";

import React from "react";
import { PageHeader } from "@/components/axis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_internal/ui/card";
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
} from "@/components/_internal/ui/field";
import { Input } from "@/components/_internal/ui/input";
import { Textarea } from "@/components/_internal/ui/textarea";
import { Button } from "@/components/_internal/ui/button";
import { Checkbox } from "@/components/_internal/ui/checkbox";
import { Switch } from "@/components/_internal/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/_internal/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/_internal/ui/radio-group";
import { Slider } from "@/components/_internal/ui/slider";

export default function FormsPage() {
  const [value, setValue] = React.useState([50]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Form Components & Patterns"
        subtitle="Comprehensive form patterns with validation and accessibility"
        breadcrumbs={[
          { label: "Showcase", href: "/showcase" },
          { label: "Forms" },
        ]}
      />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Basic Form */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Form</CardTitle>
            <CardDescription>Simple form with standard input fields</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input id="name" placeholder="John Doe" />
                  <FieldDescription>Enter your full legal name</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input id="email" type="email" placeholder="john@example.com" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </Field>
                <Field orientation="horizontal">
                  <Button type="submit">Submit</Button>
                  <Button type="button" variant="outline">Cancel</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Form with Selections */}
        <Card>
          <CardHeader>
            <CardTitle>Form with Selections</CardTitle>
            <CardDescription>Form including dropdowns and radio buttons</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="country">Country</FieldLabel>
                  <Select defaultValue="">
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="au">Australia</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <FieldSet>
                  <FieldLegend>Subscription Plan</FieldLegend>
                  <FieldDescription>Choose your preferred subscription tier</FieldDescription>
                  <RadioGroup defaultValue="standard">
                    <FieldLabel htmlFor="basic">
                      <Field orientation="horizontal">
                        <RadioGroupItem value="basic" id="basic" />
                        <FieldContent>
                          <FieldTitle>Basic - $9/month</FieldTitle>
                          <FieldDescription>Essential features for individuals</FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="standard">
                      <Field orientation="horizontal">
                        <RadioGroupItem value="standard" id="standard" />
                        <FieldContent>
                          <FieldTitle>Standard - $29/month</FieldTitle>
                          <FieldDescription>Advanced features for small teams</FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                    <FieldLabel htmlFor="premium">
                      <Field orientation="horizontal">
                        <RadioGroupItem value="premium" id="premium" />
                        <FieldContent>
                          <FieldTitle>Premium - $99/month</FieldTitle>
                          <FieldDescription>Full features for large organizations</FieldDescription>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                </FieldSet>

                <Field orientation="horizontal">
                  <Button type="submit">Continue</Button>
                  <Button type="button" variant="outline">Go Back</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Form with Checkboxes & Switches */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences Form</CardTitle>
            <CardDescription>Toggle switches and checkboxes for settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <FieldGroup>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="notifications">Email Notifications</FieldLabel>
                    <FieldDescription>Receive email updates</FieldDescription>
                  </FieldContent>
                  <Switch id="notifications" defaultChecked />
                </Field>
                
                <FieldSeparator />
                
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="marketing">Marketing Emails</FieldLabel>
                    <FieldDescription>Receive promotional content</FieldDescription>
                  </FieldContent>
                  <Switch id="marketing" />
                </Field>
                
                <FieldSeparator />
                
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldLabel htmlFor="push">Push Notifications</FieldLabel>
                    <FieldDescription>Browser push notifications</FieldDescription>
                  </FieldContent>
                  <Switch id="push" defaultChecked />
                </Field>

                <FieldSeparator />

                <FieldSet>
                  <FieldLegend>Additional Preferences</FieldLegend>
                  <Field orientation="horizontal">
                    <Checkbox id="terms" />
                    <FieldLabel htmlFor="terms">I agree to the terms and conditions</FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <Checkbox id="newsletter" />
                    <FieldLabel htmlFor="newsletter">Subscribe to monthly newsletter</FieldLabel>
                  </Field>
                </FieldSet>

                <Field orientation="horizontal">
                  <Button type="submit">Save Preferences</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Form with Slider & Textarea */}
        <Card>
          <CardHeader>
            <CardTitle>Feedback Form</CardTitle>
            <CardDescription>Form with range slider and textarea</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <FieldGroup>
                <Field>
                  <FieldTitle>How satisfied are you? ({value[0]}/100)</FieldTitle>
                  <FieldDescription>
                    Rate your satisfaction level with our service
                  </FieldDescription>
                  <Slider
                    value={value}
                    onValueChange={setValue}
                    max={100}
                    min={0}
                    step={1}
                    className="mt-2"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="feedback">Your Feedback</FieldLabel>
                  <Textarea 
                    id="feedback" 
                    placeholder="Tell us what you think..." 
                    rows={6}
                  />
                  <FieldDescription>
                    Your feedback helps us improve our service
                  </FieldDescription>
                </Field>

                <Field orientation="horizontal">
                  <Button type="submit">Submit Feedback</Button>
                  <Button type="button" variant="ghost">Clear</Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        {/* Form Features List */}
        <div className="p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Form Features</h3>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
            <li>✓ Input fields</li>
            <li>✓ Textarea</li>
            <li>✓ Select dropdowns</li>
            <li>✓ Radio groups</li>
            <li>✓ Checkboxes</li>
            <li>✓ Switches</li>
            <li>✓ Sliders</li>
            <li>✓ Field validation</li>
            <li>✓ Error messages</li>
            <li>✓ Helper text</li>
            <li>✓ Disabled states</li>
            <li>✓ Accessibility</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
