// Strip user data for sending to client

import { UserData } from '@/app/types.ts';
import { createUserData, deleteUserData } from '@/lib/user/user-data.ts';
import { db } from '@/lib/utils/utils.ts';

export function stripUserData(user?: UserData) {
  if (!user) return null;
  // This is the user data sent to the client
  return {
    name: user.name,
    tokens: user.tokens,
    isSubscribed: user.isSubscribed,
    hasSubscribed: user.hasSubscribed,
    isEmailVerified: user.isEmailVerified,
    email: user.email,
    hasVerifiedEmail: user.hasVerifiedEmail,
    language: user.language,
    nativeLanguage: user.nativeLanguage,
  } as Partial<UserData>;
}

export function createUser(name: string, email: string, password: string, language: string, isPremium: boolean) {
  return createUserData({
    name,
    email,
    password,
    tokens: 5,
    isSubscribed: true,//isPremium,
    hasSubscribed: isPremium,
    isEmailVerified: false,
    hasVerifiedEmail: false,
    pushSubscriptions: [],
    language: language,
    nativeLanguage: language,
  });
}

export async function deleteUser(userId: string) {
  await db.delete(['chat', userId]);
  await deleteUserData(userId);
}
