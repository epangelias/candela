import { App, HttpError } from 'fresh';
import * as webPush from 'web-push';
import { site } from '@/app/site.ts';
import { STATUS_CODE } from '@std/http/status';
import { setUserData } from '@/lib/user/user-data.ts';
import { State, UserData } from '@/app/types.ts';

// import * as webPushTypes from 'npm:@types/web-push';
// const webPush = _webPush as typeof webPushTypes;

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') as string;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') as string;

let waiting: void | true = true;

export function isPushEnabled() {
  return !!(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

if (!isPushEnabled()) {
  console.warn('Notifications disabled, set the VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY');
  const { publicKey, privateKey } = webPush.generateVAPIDKeys();
  console.log(`VAPID_PUBLIC_KEY=${publicKey}`);
  console.log(`VAPID_PRIVATE_KEY=${privateKey}`);
}

export async function sendNotificationToUser(user: UserData, title: string, message: string) {
  if (waiting) waiting = webPush.setVapidDetails('mailto:' + site.email, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  if (!isPushEnabled()) return;

  let subscriptionRemoved = false;

  const subscriptions = user.pushSubscriptions;

  for (const subscription of user.pushSubscriptions) {
    try {
      const data = { body: message, icon: site.icon, title };
      await webPush.sendNotification(subscription, JSON.stringify(data), { TTL: 60 });
      console.log('Sent!', { subscription, data });
    } catch (_e) {
      const e = _e as { statusCode: number };
      if (e?.statusCode == STATUS_CODE.Gone) {
        // Removes subscription on error, change later
        console.log('Subscription gone, removing it', subscription, e);
        subscriptionRemoved = true;
        const index = subscriptions.indexOf(subscription);
        if (index > -1) subscriptions.splice(index, 1);
      } else console.error('Error sending to ' + subscription.endpoint, e);
    }
  }

  if (subscriptionRemoved) await setUserData(user.id, (u) => u.pushSubscriptions = subscriptions);
}

export function pushPlugin(app: App<State>) {
  app.get('/api/vapid-public-key', () => Response.json(VAPID_PUBLIC_KEY));
  app.post('/api/subscribe-notifications', async (ctx) => {
    const user = ctx.state.user;
    if (!user) throw new HttpError(STATUS_CODE.Unauthorized);
    const { subscription } = await ctx.req.json();
    console.log('Received subscription', subscription);
    const resultUser = await setUserData(user.id, (u) => u.pushSubscriptions.push(subscription));
    console.log({ resultUser }); // rm
    return Response.json({}, { status: 201 });
  });
}
