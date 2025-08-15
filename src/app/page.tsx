import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">QuickBill</span>
          </Link>
          <nav>
            <Button asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <div className="container relative flex flex-col items-center justify-center gap-6 text-center py-20 md:py-32">
            <div className="absolute top-0 -z-10 h-full w-full bg-white"><div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(50,133,255,0.5)] opacity-50 blur-[80px]"></div></div>
          <h1 className="text-4xl font-extrabold tracking-tighter md:text-6xl">
            Invoicing Made Simple
          </h1>
          <p className="max-w-[700px] text-lg text-muted-foreground md:text-xl">
            QuickBill helps you create, manage, and track your invoices
            effortlessly. Spend less time on paperwork and more time on what
            matters.
          </p>
          <div className="flex gap-4">
            <Button asChild size="lg">
              <Link href="/dashboard">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
