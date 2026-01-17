import { AuthView } from "@neondatabase/neon-js/auth/react/ui";
import { authViewPaths } from "@neondatabase/neon-js/auth/react/ui/server";
import { authPathParamSchema } from "@/lib/contracts";
import { devAssert } from "@/lib/shared/utils/dev-assert";

export function generateStaticParams() {
  return Object.values(authViewPaths).map((path) => ({ path }));
}

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const resolvedParams = await params;
  
  // Validate params in dev, zero cost in prod
  const { path } = devAssert(
    authPathParamSchema,
    resolvedParams,
    "AuthPageParams"
  );
  
  return <AuthView pathname={path} />;
}
