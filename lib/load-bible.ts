
export interface BibleData {
  books: {
    name: string;
    chapters: {
      chapter: number,
      name: string,
      verses: {
        verse: number,
        chapter: number,
        name: string,
        text: string,
      }[]
    }[]
  }[]
}

export async function loadBible(language: string) {
  const bible = {
    'en': 'KJV',
    'es': 'SpaRV',
    'la': 'Vulgate',
    'gr': 'LXXTR',
    'he': 'WLCNT',
  }[language];

  return JSON.parse(await Deno.readTextFile(`bibles/${bible}.json`)) as BibleData;
}