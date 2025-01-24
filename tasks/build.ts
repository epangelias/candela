#!/usr/bin/env -S deno run -A --env

import { Builder } from 'fresh/dev';
import { app } from '@/main.ts';

const builder = new Builder();

await builder.build(app);
