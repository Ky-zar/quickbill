/**
 * @fileoverview Flow for inviting a user to a workspace.
 */
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  getFirestore,
  FieldValue,
} from 'firebase-admin/firestore';
import {getAuth} from 'firebase-admin/auth';
import {getApps, initializeApp, cert} from 'firebase-admin/app';

// Initialize Firebase Admin SDK if not already initialized
if (!getApps().length) {
  initializeApp();
}

const InviteUserRequestSchema = z.object({
  email: z.string().email(),
  workspaceId: z.string(),
});

export type InviteUserInput = z.infer<typeof InviteUserRequestSchema>;

const InviteUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export type InviteUserOutput = z.infer<typeof InviteUserResponseSchema>;

export const inviteUserFlow = ai.defineFlow(
  {
    name: 'inviteUserFlow',
    inputSchema: InviteUserRequestSchema,
    outputSchema: InviteUserResponseSchema,
  },
  async ({email, workspaceId}) => {
    const auth = getAuth();
    const db = getFirestore();

    try {
      // 1. Find the user by email
      const userRecord = await auth.getUserByEmail(email);
      const userId = userRecord.uid;

      // 2. Get the workspace document
      const workspaceRef = db.collection('workspaces').doc(workspaceId);
      const workspaceSnap = await workspaceRef.get();

      if (!workspaceSnap.exists) {
        return {success: false, message: 'Workspace not found.'};
      }

      // 3. Get the user profile document
      const userProfileRef = db.collection('userProfiles').doc(userId);
      const userProfileSnap = await userProfileRef.get();

      if (!userProfileSnap.exists) {
        // This case is unlikely if the user exists in Auth, but good to handle.
        return {success: false, message: 'User profile not found.'};
      }
      
      const workspaceData = workspaceSnap.data();
      if (workspaceData?.members.includes(userId)) {
          return { success: false, message: 'User is already a member of this workspace.' };
      }

      // 4. Update both documents in a transaction
      await db.runTransaction(async (transaction) => {
        transaction.update(workspaceRef, {
          members: FieldValue.arrayUnion(userId),
        });
        transaction.update(userProfileRef, {
          workspaces: FieldValue.arrayUnion(workspaceId),
        });
      });

      return {success: true, message: `Successfully invited ${email}.`};
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return {success: false, message: 'User with that email does not exist.'};
      }
      console.error('Error in inviteUserFlow:', error);
      return {
        success: false,
        message: 'An unexpected error occurred.',
      };
    }
  }
);
