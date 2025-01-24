import { App, HttpError } from 'fresh';
import { State } from '@/app/types.ts';
import { getStripePremiumPlanPriceId, GetStripeWebhookEvent, isStripeEnabled, stripe } from '@/lib/stripe/stripe.ts';
import { getUserByStripeCustomer, setUserData } from '@/lib/user/user-data.ts';
import { STATUS_CODE } from '@std/http/status';

export function stripePlugin(app: App<State>) {
  app.post('/api/stripe/webhooks', async (ctx) => {
    const event = await GetStripeWebhookEvent(ctx);

    const { customer } = event.data.object;

    console.log('Received hook: ' + event.type);

    const user = await getUserByStripeCustomer(customer);
    if (!user) throw new HttpError(STATUS_CODE.NotFound, 'User not found');

    switch (event.type) {
      case 'customer.subscription.created': {
        await setUserData(user.id, (u) => {
          u.isSubscribed = true;
          u.hasSubscribed = true;
        });
        return new Response(null, { status: STATUS_CODE.Created });
      }
      case 'customer.subscription.deleted': {
        await setUserData(user.id, (u) => u.isSubscribed = false);
        return new Response(null, { status: STATUS_CODE.Accepted });
      }
      default: {
        throw new HttpError(STATUS_CODE.BadRequest, 'Event type not supported');
      }
    }
  });

  app.get('/user/subscription', async (ctx) => {
    if (!isStripeEnabled()) throw new HttpError(STATUS_CODE.NotFound);
    if (!ctx.state.user?.stripeCustomerId) throw new HttpError(STATUS_CODE.Unauthorized);
    const { url } = await stripe.billingPortal.sessions.create({
      customer: ctx.state.user.stripeCustomerId,
      return_url: ctx.url.origin + '/user',
    });
    return ctx.redirect(url);
  });

  app.get('/user/subscribe', async (ctx) => {
    if (!isStripeEnabled()) throw new HttpError(STATUS_CODE.NotFound);
    const stripePremiumPlanPriceId = getStripePremiumPlanPriceId();
    if (!stripePremiumPlanPriceId) {
      throw new Error('"STRIPE_PREMIUM_PLAN_PRICE_ID" environment variable not set');
    }

    if (!ctx.state.user) throw new HttpError(STATUS_CODE.Unauthorized);

    const { url } = await stripe.checkout.sessions.create({
      success_url: ctx.url.origin + '/user',
      customer: ctx.state.user.stripeCustomerId,
      line_items: [
        {
          price: stripePremiumPlanPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
    });

    if (url === null) throw new HttpError(STATUS_CODE.InternalServerError);

    return ctx.redirect(url);
  });
}
