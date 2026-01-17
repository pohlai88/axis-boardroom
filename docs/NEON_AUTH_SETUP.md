# Neon Auth with Stack Auth - Setup Guide

## ✅ Current Status

Neon Auth is **already provisioned** for your AXIS project!

- **Project:** AXIS (curly-surf-86073016)
- **Auth Provider:** Stack Auth (configured)
- **Email Provider:** Custom SMTP (Zoho)
- **Configuration:** Email/password authentication enabled

## 📋 Configuration Details

### Neon Auth Setup
```json
{
  "project": "AXIS",
  "endpoint_id": "ep-hidden-mountain-a1ckcj1m",
  "trusted_origins": [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://www.nexuscanon.com"
  ],
  "email_and_password": {
    "enabled": true,
    "requireEmailVerification": true,
    "autoSignInAfterVerification": true
  },
  "allow_localhost": true
}
```

## 🔑 Get Your Stack Auth Credentials

1. **Go to Neon Console:**
   - Visit: https://console.neon.tech
   - Navigate to: Projects > AXIS > Integrations > Auth

2. **Copy the credentials:**
   - `NEXT_PUBLIC_STACK_PROJECT_ID`
   - `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
   - `STACK_SECRET_SERVER_KEY`

3. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_STACK_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-client-key"
   STACK_SECRET_SERVER_KEY="your-secret-key"
   ```

## 🚀 Stack Auth Integration

### 1. Install Stack Auth SDK
```bash
npm install @stackframe/stack
```

### 2. Initialize Stack Auth
```bash
npx @stackframe/init-stack . --no-browser
```

This will:
- Add Stack Auth dependency to `package.json`
- Create `stack.ts` configuration file
- Wrap root layout with `StackProvider`
- Create auth handler routes at `app/handler/[...stack]/page.tsx`
- Add loading boundary for auth state

### 3. Create Stack Configuration

**File: `stack.ts`**
```typescript
import { StackServerApp } from "@stackframe/stack"

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
    afterSignOut: "/",
  },
})
```

### 4. Protect Routes with Middleware

**File: `middleware.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from './stack'

export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser()
  
  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/handler/sign-in', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/tasks/:path*', '/analytics/:path*']
}
```

## 🔄 Sync Neon Auth with axis_tenant

### Automatic Sync Strategy

When users sign up/sign in via Stack Auth:

1. **User created in `neon_auth.user`** (automatic)
2. **Create organization** (your logic):
   ```typescript
   import { organizations } from '@/lib/server/drizzle/schema-multitenant'
   
   const org = await db.insert(organizations).values({
     name: user.displayName + "'s Organization",
     slug: generateSlug(user.displayName),
     neonAuthOrgId: orgId, // Link to neon_auth.organization
     createdBy: user.id
   }).returning()
   ```

3. **Create membership** (your logic):
   ```typescript
   import { memberships } from '@/lib/server/drizzle/schema-multitenant'
   
   await db.insert(memberships).values({
     userId: user.id,
     organizationId: org.id,
     role: 'owner',
     status: 'active',
     neonAuthMemberId: memberId, // Link to neon_auth.member
     acceptedAt: new Date()
   })
   ```

### Example: Post-Signup Hook

**File: `lib/server/actions/auth-sync.ts`**
```typescript
'use server'

import { db } from '@/lib/server/drizzle/db'
import { organizations, memberships } from '@/lib/server/drizzle/schema-multitenant'
import { stackServerApp } from '@/stack'

export async function syncUserOnSignup(userId: string) {
  const user = await stackServerApp.getUser({ userId })
  if (!user) throw new Error('User not found')
  
  // Create personal organization
  const [org] = await db.insert(organizations).values({
    name: `${user.displayName}'s Workspace`,
    slug: `user-${userId.substring(0, 8)}`,
    status: 'active',
    createdBy: userId
  }).returning()
  
  // Create owner membership
  await db.insert(memberships).values({
    userId: userId,
    organizationId: org.id,
    role: 'owner',
    status: 'active',
    acceptedAt: new Date()
  })
  
  return org
}
```

## 🎨 UI Components

### Use Pre-built Components

```typescript
import { SignIn, SignUp, UserButton } from '@stackframe/stack'

// Sign in page
export default function SignInPage() {
  return <SignIn />
}

// Sign up page
export default function SignUpPage() {
  return <SignUp />
}

// User menu in header
export default function Header() {
  return (
    <header>
      <UserButton />
    </header>
  )
}
```

### Client Component: Check Auth

```typescript
'use client'

import { useUser } from '@stackframe/stack'

export function DashboardClient() {
  const user = useUser({ or: 'redirect' }) // Auto-redirect if not logged in
  
  return <div>Welcome, {user.displayName}!</div>
}
```

### Server Component: Check Auth

```typescript
import { stackServerApp } from '@/stack'

export default async function DashboardPage() {
  const user = await stackServerApp.getUser({ or: 'redirect' })
  
  return <div>Welcome, {user.displayName}!</div>
}
```

## 📊 Database Sync Views

Check sync status between Neon Auth and axis_tenant:

```sql
-- View: Neon Auth sync status (already created)
SELECT * FROM axis_tenant.v_neon_auth_sync_status;

-- Expected output:
-- axis_org_id | neon_auth_org_id | neon_auth_org_name | axis_org_name | sync_status
-- ------------|------------------|-------------------|---------------|------------
-- <uuid>      | <uuid>           | Org Name          | Org Name      | synced
-- <uuid>      | NULL             | NULL              | Org Name      | not_synced
```

## ✅ Verification Checklist

- [ ] Stack Auth credentials added to `.env.local`
- [ ] `@stackframe/stack` package installed
- [ ] `stack.ts` configuration created
- [ ] Auth handler routes created (`app/handler/[...stack]/page.tsx`)
- [ ] Middleware protecting routes
- [ ] Post-signup hook syncing to `axis_tenant`
- [ ] Sign in/sign up pages using Stack Auth components
- [ ] User button in header/navigation

## 🔗 Resources

- [Stack Auth Documentation](https://docs.stackauth.com)
- [Neon Auth Guide](https://neon.tech/docs/guides/neon-authorize)
- [Multi-Tenant Starter](https://github.com/stack-auth/multi-tenant-starter-template.git)

---

**Next Steps:**
1. Get credentials from Neon Console
2. Run `npx @stackframe/init-stack . --no-browser`
3. Test authentication flow
4. Implement organization sync logic
