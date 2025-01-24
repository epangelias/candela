#!/usr/bin/env -S deno run -A

import * as Path from 'jsr:@std/path@1';
import { generateImages } from 'npm:pwa-asset-generator';
import { site } from '@/app/site.ts';
import puppeteer from 'npm:puppeteer';
import { Builder } from 'fresh/dev';
import { app } from '@/main.ts';
import { delay } from '@std/async/delay';
import { Spinner } from 'jsr:@std/cli@1.0.9/unstable-spinner';


const localURL = 'http://0.0.0.0:8000';

const spinner = new Spinner({ color: 'green' });

spinner.start();
spinner.message = 'Ensure app running locally...';

try {
  await fetch(localURL);
} catch (_e) {
  console.warn('Running app locally...');
  const builder = new Builder();
  builder.listen(app);
  await delay(1000);
}

// const generatedIconPath = Path.join(import.meta.dirname!, '../static/img/icon.png');
// async function convertToImage() {
//   spinner.message = 'Converting Icon...';

//   const browser = await puppeteer.launch({ browser: "chrome", headless: false });
//   const page = await browser.newPage();
//   page.setViewport({ width: 1024, height: 1024 });
//   await page.goto(site.icon);
//   await delay(3000);
//   await page.screenshot({
//     path: generatedIconPath,
//     omitBackground: true
//   });
//   await browser.close();
// }

async function takeScreenshot(filename: string, width: number, height: number) {
  spinner.message = 'Generating screenshot...';

  const path = Path.join(import.meta.dirname!, '../static/img/' + filename);
  const browser = await puppeteer.launch({ browser: 'chrome', headless: true });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.goto(localURL, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.body.style.zoom = '2';
      document.body.style.fontSize = '1rem';
    });
    await page.screenshot({ path });
  } catch (e) {
    console.error(e);
  }

  await browser.close();
}

async function generateAssets(inputIcon: string, outputDir: string) {
  spinner.message = 'Generating assets...';

  const result = await generateImages(inputIcon, outputDir, {
    background: site.backgroundColor,
    favicon: true,
    padding: '20%',
    pathOverride: '/img/gen',
  });

  const iconsJSON = new URL('../static/img/gen/icons.json', import.meta.url);
  await Deno.writeTextFile(iconsJSON, JSON.stringify(result.manifestJsonContent, null, 2));
}

async function URLtoPath(url: string) {
  const res = await fetch(url);
  // const contentType = res.headers.get('content-type')?.split('/')[1].split('+')[0];
  const filePath = Path.join(import.meta.dirname!, `../static/img/gen/icon`);//.${contentType}`);
  const imageData = new Uint8Array(await res.arrayBuffer());
  await Deno.writeFile(filePath, imageData);
  return filePath;
}

async function prepareIconPath(iconPath: string) {
  if (iconPath.startsWith('/') || iconPath.startsWith('file:')) {
    return Path.join(import.meta.dirname!, '../static/', iconPath);
  }
  return await URLtoPath(iconPath);
}

const outputDir = Path.join(import.meta.dirname!, '../static/img/gen');
const iconPath = await prepareIconPath(site.icon);

await takeScreenshot('screenshot-wide.jpg', 1280, 720);
await takeScreenshot('screenshot-narrow.jpg', 750, 1280);
await generateAssets(iconPath, outputDir);

spinner.stop();

console.log('"Assets generated!');

Deno.exit();
