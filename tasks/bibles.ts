#!/usr/bin/env -S deno run -A
import { $, downloadFile } from '@/lib/utils/cli.ts';
import { BibleData } from '@/lib/load-bible.ts';


const action = Deno.args[0]?.toLowerCase();
if (action == "add") await newBible();
else if (action == "rm") await removeBible();
else if (action == "list") await listBibles();
else if (action == "list-all") await listAll();
else if (action == "combine") await combineBibles();
else if (action == "add-text") await addText();
else {
  console.log('Invalid action. Use "add", "rm", "list", "add-text", or "list-all"');
  Deno.exit(1);
}

async function listAll() {
  if (Deno.build.os == 'linux') {
    await $('xdg-open', 'https://crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles');
  } else if (Deno.build.os == 'darwin') {
    await $('open', 'https://crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles');
  } else if (Deno.build.os == 'windows') {
    await $('start', '', 'https://crosswire.org/sword/modules/ModDisp.jsp?modType=Bibles');
  }
}

async function newBible() {
  const version = Deno.args[1] || prompt("Enter the Bible version (e.g., KJV):");
  const uri = `https://crosswire.org/ftpmirror/pub/sword/packages/rawzip/${version}.zip`;

  try {
    const version = uri.match(/.+\/(.+?)\.zip$/)?.[1];
    console.log("Downloading...");
    await downloadFile(uri, '.bible.temp.zip');
    await $('python3', 'lib/utils/sword_to_json.py', '--source_file', '.bible.temp.zip', '--bible_version', version!, '--output_file', `bibles/${version}.json`);
  } catch (e) {
    console.log("NOTE: Ensure the .zip file name is exactly the version name");
    console.error('Error adding bible: ', e);
  } finally {
    await Deno.remove('.bible.temp.zip');
  }
}

async function removeBible() {
  const version = Deno.args[1] || prompt("Enter the Bible version (e.g., KJV):");
  await Deno.remove(`bibles/${version}.json`);
  console.log(`Removed bible: ${version}`);
}

async function listBibles() {
  const biblesRes = await Array.fromAsync(Deno.readDir("bibles"));
  console.log(biblesRes.map(f => f.name).join('\n'));
}



async function combineBibles() {
  const version1 = Deno.args[1] || prompt("Enter the OT version (e.g., KJV):");
  const version2 = Deno.args[2] || prompt("Enter the NT version (e.g., KJV):");
  const versionName = Deno.args[3] || prompt("Ender the new version name:");
  const OT: BibleData = JSON.parse(await Deno.readTextFile(`bibles/${version1}.json`));
  const NT: BibleData = JSON.parse(await Deno.readTextFile(`bibles/${version2}.json`));

  const NTBooks = NT.books.filter(b => b.chapters[0].verses.some(v => v.text !== ''));
  const OTBooks = OT.books.filter(b => !NTBooks.some(b2 => b2.name === b.name));

  OT.books = [...OTBooks, ...NTBooks];

  await Deno.writeTextFile(`bibles/${versionName}.json`, JSON.stringify(OT));
  console.log(OT.books.map(b => b.name).join('\n'));
  console.log(`Combined bible: ${versionName} ${OT.books.length} books`);
}


async function addText() {
  const version = Deno.args[1] || prompt("Enter the Bible version (e.g., KJV):");

  const bibleData: BibleData = JSON.parse(await Deno.readTextFile(`bibles/${version}.json`));

  const textId = 'bible-' + version;

  const versionName = prompt("Enter version name (e.g., King James Version):");
  const description = prompt("Enter description:");
  const language = prompt("Enter language (e.g., en):");
  const rightToLeft = language == "he";

  const booksList = bibleData.books.map((b, i) => ({
    name: b.name,
    order: i + 1,
    chapters: b.chapters.length
  }));

  const metaData = {
    textId,
    version,
    versionName,
    tags: ["bible"],
    description,
    language,
    rightToLeft,
    books: booksList
  }

  const textDir = `texts/${textId}/${language}`;

  await Deno.mkdir(`${textDir}/books`, { recursive: true });
  await Deno.writeTextFile(`${textDir}/text.json`, JSON.stringify(metaData, null, 2));

  for (const book of bibleData.books) {
    const order = booksList.findIndex(b => b.name === book.name) + 1;

    const bookData = {
      name: book.name,
      order: order,
      chapters: book.chapters.map(c => ({
        name: c.name,
        chapter: c.chapter,
        verses: c.verses.map(v => ({
          name: v.name,
          verse: v.verse,
          text: v.text,
        }))
      }))
    }
    await Deno.writeTextFile(`${textDir}/books/${book.name}.json`, JSON.stringify(bookData, null, 2));
  }
}

// Note: Will only show verse numbers if the verses have it, if not then it doesn't