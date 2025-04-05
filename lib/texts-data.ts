export interface TextMetadata {
  textId: string;
  folder: string;
  version: string;
  versionName: string;
  tags: string[];
  description: string;
  language: string;
  rightToLeft: boolean;
  books: {
    name: string;
    order: number;
    chapters: number;
  }[];
}

export interface BookData {
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
}