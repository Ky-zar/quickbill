
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp, arrayUnion, writeBatch } from 'firebase/firestore';
import type { UserProfile, Workspace } from '@/lib/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  activeWorkspace: Workspace | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoading(true);
        const userRef = doc(db, 'userProfiles', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          // User exists, load their profile and workspace
          const profile = { id: userSnap.id, ...userSnap.data() } as UserProfile;
          setUserProfile(profile);
          if (profile.workspaces && profile.workspaces.length > 0) {
            const workspaceRef = doc(db, 'workspaces', profile.workspaces[0]);
            const workspaceSnap = await getDoc(workspaceRef);
            if (workspaceSnap.exists()) {
              setActiveWorkspace({ id: workspaceSnap.id, ...workspaceSnap.data() } as Workspace);
            }
          }
        } else {
          // New user, create profile and personal workspace
          const batch = writeBatch(db);

          // 1. Create workspace
          const workspaceRef = doc(collection(db, 'workspaces'));
          const newWorkspace = {
            id: workspaceRef.id,
            name: `${firebaseUser.displayName}'s Workspace`,
            members: [firebaseUser.uid],
          };
          batch.set(workspaceRef, newWorkspace);
          
          // 2. Create user profile
          const newUserProfile: UserProfile = {
            id: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            workspaces: [workspaceRef.id]
          };
          batch.set(userRef, newUserProfile);

          await batch.commit();
          setUserProfile(newUserProfile);
          setActiveWorkspace(newWorkspace as Workspace);
        }
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserProfile(null);
        setActiveWorkspace(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    } finally {
      // The onAuthStateChanged listener will handle setting loading to false
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const contextValue = {
    user,
    userProfile,
    activeWorkspace,
    loading: loading || (!!user && !activeWorkspace),
    signInWithGoogle,
    signOut,
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
