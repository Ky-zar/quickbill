
"use client"

import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from './auth-provider';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { inviteUserFlow } from '@/ai/flows/invite-user-flow';
import { Skeleton } from './ui/skeleton';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function WorkspaceSettings() {
  const { activeWorkspace, user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const fetchMembers = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const memberProfiles: UserProfile[] = [];
      for (const memberId of activeWorkspace.members) {
        const userDocRef = doc(db, 'userProfiles', memberId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          memberProfiles.push({ id: userDocSnap.id, ...userDocSnap.data() } as UserProfile);
        }
      }
      setMembers(memberProfiles);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Could not load workspace members.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [activeWorkspace]);

  const isOwner = activeWorkspace?.ownerId === user?.uid;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!activeWorkspace) {
      toast({ title: "Error", description: "No active workspace selected.", variant: "destructive" });
      return;
    }
    
    form.reset();

    try {
      const result = await inviteUserFlow({ email: values.email, workspaceId: activeWorkspace.id });
      if (result.success) {
        toast({ title: "Success", description: result.message });
        await fetchMembers(); // Refresh member list
      } else {
        toast({ title: "Invitation Failed", description: result.message, variant: "destructive" });
      }
    } catch (error) {
        console.error("Invitation flow error:", error)
        toast({ title: "Error", description: "An unexpected error occurred while sending the invitation.", variant: "destructive" });
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite Members</CardTitle>
          <CardDescription>
            {isOwner ? "Add new members to collaborate in this workspace." : "Only the workspace owner can invite new members."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} disabled={!isOwner} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting || !isOwner}>
                {form.formState.isSubmitting ? 'Inviting...' : 'Invite'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
          <CardDescription>These users have access to this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ul className="space-y-4">
              {members.map(member => (
                <li key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.photoURL ?? undefined} data-ai-hint="member avatar" />
                      <AvatarFallback>{member.displayName?.[0] ?? '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.displayName}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  {activeWorkspace?.ownerId === member.id && (
                     <span className="text-xs font-semibold text-muted-foreground bg-secondary px-2 py-1 rounded-full">Owner</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
