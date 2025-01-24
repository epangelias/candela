import Mailjet from 'node-mailjet';
import { RateLimiter } from '@/lib/utils/rate-limiter.ts';

export interface MailOptions {
  fromName: string;
  toName: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

const limiter = new RateLimiter({ maxRequests: 2, interval: 60 }); // 2 per minute

let mailjet: Mailjet.Client;

const MJ_APIKEY_PUBLIC = Deno.env.get('MJ_APIKEY_PUBLIC');
const MJ_APIKEY_PRIVATE = Deno.env.get('MJ_APIKEY_PRIVATE');

export function isMailEnabled() {
  return !!MJ_APIKEY_PUBLIC && !!MJ_APIKEY_PRIVATE;
}

if (!isMailEnabled()) console.warn('Mailjet disabled. Missing environment variables.');

export async function sendMail(options: MailOptions) {
  if (!isMailEnabled()) return;

  if (!mailjet) {
    mailjet = new Mailjet.Client({
      apiKey: Deno.env.get('MJ_APIKEY_PUBLIC'),
      apiSecret: Deno.env.get('MJ_APIKEY_PRIVATE'),
    });
  }

  limiter.request();

  await mailjet.post('send', { 'version': 'v3.1' }).request({
    Messages: [
      {
        From: { Email: options.from, Name: options.fromName },
        To: [{ Email: options.to, Name: options.toName }],
        Subject: options.subject,
        TextPart: options.text,
        HTMLPart: options.html,
      },
    ],
  });
}
