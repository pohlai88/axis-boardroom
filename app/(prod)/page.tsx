import Link from "next/link";
import { Button } from "@/components/primitives";
import { 
  LayoutDashboard, 
  ListTodo, 
  BarChart3, 
  Layers,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/_internal/ui/card";
import { Badge } from "@/components/_internal/ui/badge";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          Production-Safe UI Governance System
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          AXIS BoardRoom
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          A comprehensive SaaS ERP platform with enterprise-grade components,
          analytics, and task management built on Next.js 16.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              <LayoutDashboard className="h-5 w-5" />
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/showcase">
            <Button size="lg" variant="outline" className="gap-2">
              <Layers className="h-5 w-5" />
              View Component Showcase
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Enterprise Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                <LayoutDashboard className="h-6 w-6" />
              </div>
              <CardTitle>Intelligent Dashboard</CardTitle>
              <CardDescription>
                Real-time insights and metrics with customizable widgets and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full">
                  View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                <ListTodo className="h-6 w-6" />
              </div>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                Comprehensive task tracking with status updates, priorities, and assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/tasks">
                <Button variant="ghost" className="w-full">
                  Manage Tasks <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Deep analytics with 70+ chart types and real-time web vitals tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/analytics">
                <Button variant="ghost" className="w-full">
                  View Analytics <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                <Layers className="h-6 w-6" />
              </div>
              <CardTitle>150+ Components</CardTitle>
              <CardDescription>
                Production-ready component library with AXIS Design System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/showcase">
                <Button variant="ghost" className="w-full">
                  Browse Library <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle>Secure Authentication</CardTitle>
              <CardDescription>
                Enterprise-grade authentication with Neon Auth integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/sign-in">
                <Button variant="ghost" className="w-full">
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle>Performance Optimized</CardTitle>
              <CardDescription>
                Built on Next.js 16 with Server Components and streaming
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/docs">
                <Button variant="ghost" className="w-full">
                  Documentation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">150+</div>
            <div className="text-muted-foreground">Components</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">70+</div>
            <div className="text-muted-foreground">Chart Types</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">32+</div>
            <div className="text-muted-foreground">Calendar Variants</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">100%</div>
            <div className="text-muted-foreground">TypeScript</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto border-primary/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Explore our comprehensive component library and start building your enterprise application today.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/showcase">
              <Button size="lg" className="gap-2">
                Explore Components
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline">
                View Live Demo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2026 AXIS BoardRoom. Built with Next.js 16.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/showcase" className="text-muted-foreground hover:text-foreground">
                Components
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
              <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
                Analytics
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
