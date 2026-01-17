import { NeonLoginForm } from "@/components/features/auth/neon-login-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <NeonLoginForm />
      </div>
    </div>
  );
}
