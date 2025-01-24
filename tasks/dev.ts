#!/usr/bin/env -S deno run -A --env --watch=static/,routes/

import { Builder } from 'fresh/dev';
import { app } from '@/main.ts';

const builder = new Builder();

await builder.listen(app);
