// Flow blockchain types
export interface FlowBook {
  title: string;
  author: string;
  genre: string;
  summary: string;
  edition: string;
}

export interface FlowChapter {
  bookTitle: string;
  chapterTitle: string;
  index: number;
  paragraphs: string[];
}

export interface FlowUserPreferences {
  favorites: string[];
  bookmarks: string[];
}