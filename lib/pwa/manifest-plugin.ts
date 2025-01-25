import { App } from 'fresh';
import { State } from '@/app/types.ts';
import { site } from '@/app/site.ts';
import icons from '@/static/img/gen/icons.json' with { type: 'json' };
import { asset } from 'fresh/runtime';

const manifest = {
  name: site.name,
  short_name: site.name,
  id: site.name.toLowerCase(),
  start_url: '/',
  lang: site.lang,
  // theme_color: site.themeColor,
  background_color: site.backgroundColor,
  display: 'standalone',
  description: site.description,
  handle_links: 'preferred',
  launch_handler: { 'client_mode': 'focus-existing' },
  display_override: ['window-controls-overlay', 'standalone', 'browser'],
  orientation: 'any',
  icons,
  screenshots: [
    { src: asset('/img/screenshot-wide.jpg'), form_factor: 'wide', sizes: '1280x720' },
    { src: asset('/img/screenshot-narrow.jpg'), form_factor: 'narrow', sizes: '750x1280' },
  ],
};

export function manifestPlugin(app: App<State>) {
  app.get('/manifest.json', () => {
    return Response.json(manifest);
  });
}
