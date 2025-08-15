
"use client";

import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';

const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { user, activeWorkspace, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !activeWorkspace)) {
      router.push('/');
    }
  }, [user, activeWorkspace, loading, router]);

  if (loading || !user || !activeWorkspace) {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-card">
                <div className="container flex h-16 items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="ml-auto">
                        <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                </div>
            </header>
            <main className="flex-1 container py-8">
                <Skeleton className="h-10 w-full md:w-[400px] mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <Skeleton className="h-96 w-full" />
                    </div>
                    <div>
                        <Skeleton className="h-80 w-full" />
                    </div>
                </div>
            </main>
        </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
