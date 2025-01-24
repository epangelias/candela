import { HttpError } from 'fresh';
import { STATUS_CODE } from '@std/http/status';
import { isProductionMode } from '@/lib/utils/utils.ts';

const defaultOptions: Options = {
  maxRequests: 10,
  interval: 60,
};

interface Options {
  maxRequests: number;
  interval: number;
}

export class RateLimiter {
  requests = 0;
  maxRequests: number;
  interval: number;
  enabled = false;

  constructor(_options: Partial<Options> = {}) {
    const options = { ...defaultOptions, ..._options };

    this.maxRequests = options.maxRequests;
    this.interval = options.interval * 1000;

    // Prevent from issue on github actions
    if (Deno.env.get('GITHUB_ACTIONS') === 'true') return;
    // if (!isProduction) return; // THIS IS THE CULPRIT< GETTING ISPRODUCTIN BREAKS IT
    if (!isProductionMode()) return;

    this.enabled = true;
    setInterval(() => this.requests = 0, this.interval);
  }

  request() {
    if (!this.enabled) return;

    if (this.requests >= this.maxRequests) {
      throw new HttpError(
        STATUS_CODE.TooManyRequests,
        `Rate limit exceeded. Try again in ${this.interval / 1000} seconds.`,
      );
    }
    this.requests++;
  }
}
