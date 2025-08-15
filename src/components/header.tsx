"use client"

import { Zap, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';

export default function Header() {
  const { user, signOut, loading } = useAuth();

  const headerContent = (
    <>
      <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg mr-auto">
        <Zap className="h-6 w-6 text-primary" />
        <span>QuickBill</span>
      </Link>
      {loading ? (
        <Skeleton className="h-9 w-9 rounded-full" />
      ) : user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} data-ai-hint="profile picture" />
                <AvatarFallback>{user.displayName?.[0]?.toUpperCase() ?? 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        {headerContent}
      </div>
    </header>
  );
}
