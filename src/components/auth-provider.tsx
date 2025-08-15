
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, writeBatch, query, where, getDocs } from 'firebase/firestore';
import type { UserProfile, Workspace } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_WORKSPACE_ID_KEY = 'activeWorkspaceId';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        const userRef = doc(db, 'userProfiles', firebaseUser.uid);
        let userSnap = await getDoc(userRef);
        let profile: UserProfile;

        if (!userSnap.exists()) {
          // New user, create profile and personal workspace
          const batch = writeBatch(db);
          const workspaceRef = doc(collection(db, 'workspaces'));
          const newWorkspace: Omit<Workspace, 'id'> = {
            name: `${firebaseUser.displayName}'s Workspace`,
            members: [firebaseUser.uid],
            ownerId: firebaseUser.uid,
          };
          batch.set(workspaceRef, newWorkspace);
          
          const newUserProfile: Omit<UserProfile, 'id'> = {
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            workspaces: [workspaceRef.id]
          };
          batch.set(userRef, newUserProfile);

          await batch.commit();
          userSnap = await getDoc(userRef); // Re-fetch the snap
        }
        
        profile = { id: userSnap.id, ...userSnap.data() } as UserProfile;
        setUserProfile(profile);

        if (profile.workspaces && profile.workspaces.length > 0) {
            const workspacesQuery = query(collection(db, 'workspaces'), where('__name__', 'in', profile.workspaces));
            const workspacesSnapshot = await getDocs(workspacesQuery);
            const userWorkspaces = workspacesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
            setWorkspaces(userWorkspaces);
            
            const lastActiveId = localStorage.getItem(ACTIVE_WORKSPACE_ID_KEY);
            const workspaceToActivate = userWorkspaces.find(ws => ws.id === lastActiveId) || userWorkspaces[0];
            
            if (workspaceToActivate) {
                setActiveWorkspace(workspaceToActivate);
                localStorage.setItem(ACTIVE_WORKSPACE_ID_KEY, workspaceToActivate.id);
            }
        }
        
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setWorkspaces([]);
        setActiveWorkspace(null);
        localStorage.removeItem(ACTIVE_WORKSPACE_ID_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setActiveWorkspaceId = (workspaceId: string | null) => {
    if (!workspaceId) {
        setActiveWorkspace(null);
        localStorage.removeItem(ACTIVE_WORKSPACE_ID_KEY);
        return;
    }
    const newActiveWorkspace = workspaces.find(ws => ws.id === workspaceId);
    if (newActiveWorkspace) {
        setActiveWorkspace(newActiveWorkspace);
        localStorage.setItem(ACTIVE_WORKSPACE_ID_KEY, newActiveWorkspace.id);
    } else {
        toast({ title: "Error", description: "Could not switch to workspace.", variant: "destructive" });
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      toast({ title: "Sign-in Failed", description: "Could not sign in with Google.", variant: "destructive" });
    } finally {
      // onAuthStateChanged will set loading to false
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
      toast({ title: "Sign-out Failed", description: "Could not sign out.", variant: "destructive" });
    }
  };

  const contextValue = {
    user,
    userProfile,
    workspaces,
    activeWorkspace,
    loading: loading,
    signInWithGoogle,
    signOut,
    setActiveWorkspaceId
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
