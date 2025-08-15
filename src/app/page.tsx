"use client"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/auth-provider';

export default function LandingPage() {
  const { user, signInWithGoogle, loading } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="z-40 bg-background">
        <div className="container flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">InvoiceFlow</span>
          </Link>
          <nav>
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button onClick={signInWithGoogle} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="relative">
          <div className="absolute top-0 -z-10 h-full w-full bg-white dark:bg-transparent"><div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(50,133,255,0.3)] opacity-50 blur-[80px]"></div></div>
          <div className="container flex flex-col items-center justify-center gap-6 text-center py-20 md:py-32">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Invoicing Made Simple
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
              InvoiceFlow helps you create, manage, and track your invoices
              effortlessly. Spend less time on paperwork and more time on what
              matters.
            </p>
            <div className="flex gap-4">
              <Button asChild size="lg">
                <Link href="/dashboard">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-8 md:py-12 lg:py-24">
            <div className="container">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">Features</h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Everything you need to streamline your invoicing process and get paid faster.
                    </p>
                </div>
                <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-12">
                    <Card>
                        <CardHeader>
                            <Zap className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Effortless Invoicing</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Create professional invoices in seconds with our intuitive form.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Clock className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Automated Tracking</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Keep track of paid, pending, and overdue invoices automatically.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CheckCircle className="h-10 w-10 text-primary mb-2" />
                            <CardTitle>Simple Status Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Mark invoices as paid with a single click and keep your records up-to-date.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section id="how-it-works" className="bg-slate-50 dark:bg-slate-900/50 py-16 md:py-20 lg:py-28">
            <div className="container">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
                    <h2 className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl">How It Works</h2>
                    <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    Get started in just 3 simple steps.
                    </p>
                </div>
                <div className="mx-auto grid gap-8 md:grid-cols-3 md:gap-12 md:max-w-[58rem] mt-12">
                    <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">1</div>
                    <h3 className="text-xl font-bold">Add Invoice</h3>
                    <p className="text-muted-foreground">Fill in the project details, client, amount, and due date.</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">2</div>
                    <h3 className="text-xl font-bold">Track Status</h3>
                    <p className="text-muted-foreground">View all your invoices and their status—pending, paid, or overdue—at a glance.</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-bold text-2xl mb-4">3</div>
                    <h3 className="text-xl font-bold">Get Paid</h3>
                    <p className="text-muted-foreground">Update invoice status to paid once you receive payment.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>
      <footer className="mt-10">
        <div className="container py-8">
            <p className="text-center text-sm text-muted-foreground">
              © 2024 InvoiceFlow. All rights reserved.
            </p>
        </div>
      </footer>
    </div>
  );
}
