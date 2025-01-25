import { ComponentChildren } from 'preact';
import { usePWA } from '@/lib/pwa/usePWA.ts';
import { Signal } from '@preact/signals';
import { AIMessage } from '@/lib/ai/oai.ts';

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
  language: string;
}

export type GlobalData = {
  user: Signal<Partial<UserData> | null>;
  outOfTokens: Signal<boolean>;
  pwa: ReturnType<typeof usePWA>;
  mailEnabled: boolean;
  stripeEnabled: boolean;
  pushEnabled: boolean;
};

export interface State {
  user?: UserData;
  auth?: string;
}

export interface ChatData {
  userId: string;
  messages: AIMessage[];
}
