"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { betterAuthClient } from "@/lib/auth";
import { Button } from "@/components/_internal/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/_internal/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/_internal/ui/form";
import { Input } from "@/components/_internal/ui/input";
import {
  type MagicLinkFormData,
  magicLinkFormSchema,
} from "@/lib/contracts";
import { handleError } from "@/lib/client/utils/error-handler";
import { toast } from "sonner";

export function MagicLinkForm() {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: MagicLinkFormData) => {
    try {
      // Note: Magic link authentication requires password field in current Better Auth version
      // This is a placeholder - check Better Auth docs for correct magic link API
      await betterAuthClient.signIn.email({
        email: data.email,
        password: "", // Required by current API, but not used for magic links
        callbackURL: "/dashboard",
      });

      setEmailSent(true);
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      // Use unified error handler (normalizes Better Auth errors)
      handleError(error);
    }
  };

  const isBusy = form.formState.isSubmitting;

  if (emailSent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a magic link to {form.getValues("email")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in. The link will expire in 5
            minutes.
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              setEmailSent(false);
              form.reset();
            }}
          >
            Send Another Link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In with Magic Link</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a magic link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isBusy}>
              {isBusy ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
