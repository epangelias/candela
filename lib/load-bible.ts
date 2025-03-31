
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

export interface BookData {
  name: string;
  order: number;
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
}

export async function loadBook(language: string | undefined, bookName: string) {
  try {
    return JSON.parse(await Deno.readTextFile(`texts/${language || "en"}/bible/books/${bookName}.json`)) as BookData;
  } catch (e) {
    console.log("not found: " + language + " " + bookName)
    return null;
  }
}