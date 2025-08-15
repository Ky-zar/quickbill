
"use client"

import { Zap, LogOut, Check, ChevronsUpDown } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

import { Button } from './ui/button';
import { useAuth } from './auth-provider';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';


export default function Header() {
  const { user, userProfile, signOut, loading, workspaces, activeWorkspace, setActiveWorkspaceId } = useAuth();
  const [open, setOpen] = React.useState(false)

  const WorkspaceSwitcher = () => {
    if (loading || !activeWorkspace || workspaces.length <= 1) {
      return (
        <div className="flex items-center gap-2 font-bold text-lg mr-auto">
            <Zap className="h-6 w-6 text-primary" />
            <span>{activeWorkspace?.name ?? 'QuickBill'}</span>
        </div>
      )
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="ghost"
                role="combobox"
                aria-expanded={open}
                className="w-auto md:w-[200px] justify-between text-lg font-bold"
                >
                {activeWorkspace.name}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandGroup>
                            {workspaces.map((workspace) => (
                                <CommandItem
                                    key={workspace.id}
                                    onSelect={() => {
                                        setActiveWorkspaceId(workspace.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            activeWorkspace.id === workspace.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {workspace.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
      </Popover>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <WorkspaceSwitcher />
        <div className="ml-auto flex items-center gap-4">
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
        </div>
      </div>
    </header>
  );
}
