import { ComponentChildren } from 'preact';
import { usePWA } from '@/lib/pwa/usePWA.ts';
import { Signal } from '@preact/signals';
import { AIMessage } from '@/lib/ai/oai.ts';
import { PageState } from '@/app/SelectionState.tsx';

export interface BannerData {
  name: string;
  condition: () => boolean | undefined;
  canClose: boolean;
  content: () => ComponentChildren;
}

export interface UserData {
  id: string;
  created: number;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  stripeCustomerId?: string;
  isSubscribed: boolean;
  hasSubscribed: boolean;
  tokens: number;
  isEmailVerified: boolean;
  hasVerifiedEmail: boolean;
  pushSubscriptions: PushSubscription[];
  language?: string;
  nativeLanguage?: string;
}

export interface WordData {
  id: string;
  word: string;
  meaning: string;
  level: number;
  created: number;
}

export interface WordsData {
  id: string;
  created: number;
  language: string;
  words: WordData[];
  userId: string;
}

export type GlobalData = {
  user: Signal<Partial<UserData> | null>;
  outOfTokens: Signal<boolean>;
  pwa: ReturnType<typeof usePWA>;
  mailEnabled: boolean;
  stripeEnabled: boolean;
  pushEnabled: boolean;
  pageState: PageState;
};

export interface State {
  user: UserData | null;
  auth?: string;
}

export interface ChatData {
  userId: string;
  messages: AIMessage[];
}
