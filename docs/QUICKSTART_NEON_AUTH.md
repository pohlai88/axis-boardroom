# Quick Start - Neon Auth

## 🚀 Setup (3 steps)

### 1. Create `.env.local`

```bash
NEON_AUTH_BASE_URL=https://ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
NEXT_PUBLIC_NEON_AUTH_URL=https://ep-hidden-mountain-a1ckcj1m.neonauth.ap-southeast-1.aws.neon.tech/neondb/auth
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Test Auth Pages

- Sign Up: http://localhost:3000/auth/sign-up
- Sign In: http://localhost:3000/auth/sign-in

## 📝 Usage Examples

### Get Current User (Client)

```typescript
"use client";
import { authClient } from "@/lib/auth/client";

export function Profile() {
  const session = authClient.useSession();
  
  if (session.isPending) return <div>Loading...</div>;
  if (!session.data) return <div>Please sign in</div>;
  
  return <div>Hello, {session.data.user.name}!</div>;
}
```

### Protect Server Page

```typescript
import { authClient } from "@/lib/auth/client";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await authClient.getSession();
  
  if (!session) {
    redirect("/auth/sign-in");
  }
  
  return <div>Protected content</div>;
}
```

### Add User Button

```typescript
import { UserButton, SignedIn, SignedOut } from "@neondatabase/neon-js/auth/react/ui";
import Link from "next/link";

export function Header() {
  return (
    <header>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <Link href="/auth/sign-in">Sign In</Link>
      </SignedOut>
    </header>
  );
}
```

## 📂 Files Created

```
app/
├── api/auth/[...path]/route.ts    ← Auth API endpoints
├── (prod)/auth/[path]/page.tsx    ← Auth pages (sign-in, sign-up, etc.)
├── ClientLayout.tsx               ← Updated with AuthProvider
└── globals.css                    ← Added Neon Auth CSS

lib/
└── auth/
    ├── client.ts                  ← Auth client config
    └── index.ts                   ← Exports

components/
└── features/auth/
    ├── auth-provider.tsx          ← Auth context provider
    └── index.ts                   ← Updated exports

docs/
├── NEON_AUTH_MIGRATION.md         ← Full migration guide
└── NEON_AUTH_SETUP_COMPLETE.md    ← Setup summary
```

## 🔗 Resources

- [Full Migration Guide](./NEON_AUTH_MIGRATION.md)
- [Neon Auth Docs](https://neon.com/docs/auth/overview)
- [Get Neon Auth URL](https://console.neon.tech)

---

**Status**: ✅ Ready to use!
