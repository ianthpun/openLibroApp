import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";

// Configure FCL for Flow Mainnet
fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
  "app.detail.title": "OpenLibro",
  "app.detail.icon": "https://openlibro.app/favicon.ico",
  "0xAlexandria": "0xccd91e42ccfcb185" // Alexandria contract address
});

// Types based on the Alexandria contract
export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  summary: string;
  edition: string;
  cover_url?: string; // We'll need to map this separately
  content?: string;   // Added for compatibility with existing code
  created_at: string;
}

export interface Chapter {
  id: string;
  book_id: number;
  bookTitle: string;
  title: string;
  index: number;
  content: string[];
  created_at: string;
}

// Get all books from Alexandria contract
export const getAllBooks = async (): Promise<Book[]> => {
  try {
    // Get all authors
    const authors = await fcl.query({
      cadence: `
        import Alexandria from 0xAlexandria

        access(all) 
        fun main(): [String] {
          let authors = Alexandria.getAuthors()
          return authors ?? []
        } 
      `,
    });

    if (!authors || authors.length === 0) return [];

    // For each author, get their books
    const booksPromises = authors.map(async (author: string) => {
      const titles = await fcl.query({
        cadence: `
          import Alexandria from 0xAlexandria

          access(all)
          fun main(author: String): [String] {
            let titles = Alexandria.getAuthor(author: author)
            return titles ?? []
          }
        `,
        args: (arg: any, t: any) => [arg(author, t.String)],
      });

      if (!titles || titles.length === 0) return [];

      // For each title, get the book details
      const bookDetailsPromises = titles.map(async (title: string, index: number) => {
        try {
          const book = await fcl.query({
            cadence: `
              import Alexandria from 0xAlexandria
              
              access(all)
              fun main(title: String): {String: String} {
                let book = Alexandria.getBook(bookTitle: title)
                
                return {
                  "title": book.Title,
                  "author": book.Author,
                  "genre": book.Genre,
                  "summary": book.Summary,
                  "edition": book.Edition
                }
              }
            `,
            args: (arg: any, t: any) => [arg(title, t.String)],
          });

          // Map to our Book interface
          return {
            id: index + 1, // Generate a sequential ID
            title: book.title,
            author: book.author,
            genre: book.genre,
            summary: book.summary,
            edition: book.edition,
            // Use a placeholder cover image based on genre
            cover_url: getCoverImageByGenre(book.genre),
            created_at: new Date().toISOString(),
          };
        } catch (error) {
          console.error(`Error fetching book details for ${title}:`, error);
          return null;
        }
      });

      const bookDetails = await Promise.all(bookDetailsPromises);
      return bookDetails.filter(Boolean) as Book[];
    });

    const allBooks = await Promise.all(booksPromises);
    return allBooks.flat();
  } catch (error) {
    console.error("Error fetching books from Flow:", error);
    return [];
  }
};

// Get book chapters from Alexandria contract
export const getBookChapters = async (bookTitle: string): Promise<Chapter[]> => {
  try {
    // Fixed Cadence script to properly handle the chapter names
    // Instead of trying to return the chapterNames.keys directly,
    // we'll create a new array and return that
    const chapterNames = await fcl.query({
      cadence: `
        import Alexandria from 0xAlexandria
        
        access(all)
        fun main(title: String): [String] {
          let book = Alexandria.getBook(bookTitle: title)
          
          // Create a new array to hold the chapter names
          let chapterNamesArray: [String] = []
          
          // Iterate through the keys and add them to our array
          for name in book.chapterNames.keys {
            chapterNamesArray.append(name)
          }
          
          return chapterNamesArray
        }
      `,
      args: (arg: any, t: any) => [arg(bookTitle, t.String)],
    });

    if (!chapterNames || chapterNames.length === 0) return [];

    // For each chapter name, get the chapter content
    const chaptersPromises = chapterNames.map(async (chapterName: string, index: number) => {
      try {
        // Fixed Cadence script to properly handle optional chaining
        console.log("chapterName", chapterName)
        console.log("inde", index)
        const chapterData = await fcl.query({
          cadence: `
            import Alexandria from 0xAlexandria
            
           access(all) 
          fun main(bookTitle: String, chapterTitle: String): Alexandria.Chapter?  {
             return Alexandria.getBookChapter(bookTitle: bookTitle, chapterTitle: chapterTitle)
          }
          `,
          args: (arg: any, t: any) => [
            arg(bookTitle, t.String),
            arg(chapterName, t.String)
          ],
        });

        console.log("chapterdata", chapterData)

        return {
          id: `${bookTitle}-${index + 1}`,
          book_id: index + 1,
          bookTitle: bookTitle,
          title: chapterName,
          index: parseInt(chapterData.index) || index,
          content: chapterData.paragraphs || [],
          created_at: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error fetching chapter ${chapterName} for book ${bookTitle}:`, error);
        // Return a default chapter as fallback
        return {
          id: `${bookTitle}-${index + 1}`,
          book_id: index + 1,
          bookTitle: bookTitle,
          title: chapterName,
          index: index,
          content: [`Chapter content for ${chapterName} could not be loaded.`],
          created_at: new Date().toISOString(),
        };
      }
    });

    const chapters = await Promise.all(chaptersPromises);
    return chapters.filter(Boolean) as Chapter[];
  } catch (error) {
    console.error(`Error fetching chapters for book ${bookTitle}:`, error);
    // Return mock chapters for this book as fallback
    return getMockChaptersForTitle(bookTitle);
  }
};

// Get user favorites from Alexandria contract
export const getUserFavorites = async (userAddress: string): Promise<string[]> => {
  try {
    const favorites = await fcl.query({
      cadence: `
        import Alexandria from 0xAlexandria

        access(all)
        fun main(address: Address): [String] {
          let account = getAccount(address)
          let capability = account.capabilities.get<&{Alexandria.UserPreferencesPublic}>(
            Alexandria.UserPreferencePublic
          )
          
          if let preferences = capability.borrow() {
            return preferences.getFavorites()
          }
          
          return []
        }
      `,
      args: (arg: any, t: any) => [arg(userAddress, t.Address)],
    });

    return favorites || [];
  } catch (error) {
    console.error(`Error fetching favorites for user ${userAddress}:`, error);
    return [];
  }
};

// Get user bookmarks from Alexandria contract
export const getUserBookmarks = async (userAddress: string): Promise<string[]> => {
  try {
    const bookmarks = await fcl.query({
      cadence: `
        import Alexandria from 0xAlexandria

        access(all)
        fun main(address: Address): [String] {
          let account = getAccount(address)
          let capability = account.capabilities.get<&{Alexandria.UserPreferencesPublic}>(
            Alexandria.UserPreferencePublic
          )
          
          if let preferences = capability.borrow() {
            return preferences.getBookmarks()
          }
          
          return []
        }
      `,
      args: (arg: any, t: any) => [arg(userAddress, t.Address)],
    });

    return bookmarks || [];
  } catch (error) {
    console.error(`Error fetching bookmarks for user ${userAddress}:`, error);
    return [];
  }
};

// Add a book to user favorites
export const addFavorite = async (userAddress: string, bookTitle: string): Promise<boolean> => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import Alexandria from 0xAlexandria

        transaction(bookTitle: String) {
          prepare(signer: AuthAccount) {
            // Get the user preferences resource
            let preferences = signer.borrow<&Alexandria.UserPreferences>(
              from: Alexandria.UserPreferenceStorage
            ) ?? panic("Could not borrow user preferences")
            
            // Add the book to favorites
            preferences.addFavorite(bookName: bookTitle)
          }
        }
      `,
      args: (arg: any, t: any) => [arg(bookTitle, t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    });

    await fcl.tx(transactionId).onceSealed();
    return true;
  } catch (error) {
    console.error(`Error adding favorite for user ${userAddress}:`, error);
    return false;
  }
};

// Remove a book from user favorites
export const removeFavorite = async (userAddress: string, bookTitle: string): Promise<boolean> => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import Alexandria from 0xAlexandria

        transaction(bookTitle: String) {
          prepare(signer: AuthAccount) {
            // Get the user preferences resource
            let preferences = signer.borrow<&Alexandria.UserPreferences>(
              from: Alexandria.UserPreferenceStorage
            ) ?? panic("Could not borrow user preferences")
            
            // Remove the book from favorites
            preferences.removeFavorite(bookName: bookTitle)
          }
        }
      `,
      args: (arg: any, t: any) => [arg(bookTitle, t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    });

    await fcl.tx(transactionId).onceSealed();
    return true;
  } catch (error) {
    console.error(`Error removing favorite for user ${userAddress}:`, error);
    return false;
  }
};

// Add a bookmark for a book
export const addBookmark = async (userAddress: string, bookTitle: string): Promise<boolean> => {
  try {
    const transactionId = await fcl.mutate({
      cadence: `
        import Alexandria from 0xAlexandria

        transaction(bookTitle: String) {
          prepare(signer: AuthAccount) {
            // Get the user preferences resource
            let preferences = signer.borrow<&Alexandria.UserPreferences>(
              from: Alexandria.UserPreferenceStorage
            ) ?? panic("Could not borrow user preferences")
            
            // Add the bookmark
            preferences.addBookmark(bookName: bookTitle)
          }
        }
      `,
      args: (arg: any, t: any) => [arg(bookTitle, t.String)],
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 999,
    });

    await fcl.tx(transactionId).onceSealed();
    return true;
  } catch (error) {
    console.error(`Error adding bookmark for user ${userAddress}:`, error);
    return false;
  }
};

// Helper function to get a cover image based on genre
const getCoverImageByGenre = (genre: string): string => {
  const genreMap: Record<string, string> = {
    "Fantasy": "https://images.unsplash.com/photo-1531901599143-df5010ab9438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Science Fiction": "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Magical Realism": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Adventure": "https://images.unsplash.com/photo-1551373884-8a0750074df7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Mystery": "https://images.unsplash.com/photo-1579566346927-c68383817a25?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Romance": "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Thriller": "https://images.unsplash.com/photo-1478720568477-152d9b164e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Horror": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Biography": "https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "History": "https://images.unsplash.com/photo-1461360228754-6e81c478b882?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Philosophy": "https://images.unsplash.com/photo-1544396821-4dd40b938ad3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Psychology": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Literature": "https://images.unsplash.com/photo-1490633874781-1c63cc424610?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Feminist Literature": "https://images.unsplash.com/photo-1596496181871-9681eacf9764?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Western": "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Fiction": "https://images.unsplash.com/photo-1476275466078-4007374efbbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Dystopian": "https://images.unsplash.com/photo-1470115636492-6d2b56f9146d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "Realism": "https://images.unsplash.com/photo-1516979187457-637abb4f9353?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  };

  return genreMap[genre] || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";
};

// Mock data for development/fallback
export const getMockBooks = (): Book[] => {
  return [
    {
      id: 1,
      title: "The Midnight Chronicles",
      author: "Eliza Morgan",
      cover_url: "https://images.unsplash.com/photo-1531901599143-df5010ab9438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      summary: "A tale of mystery and adventure in a world where night and day are controlled by ancient magical forces.",
      genre: "Fantasy",
      edition: "1st",
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      title: "Whispers of the Forgotten Sea",
      author: "Marcus Chen",
      cover_url: "https://images.unsplash.com/photo-1551373884-8a0750074df7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      summary: "An epic fantasy about a young sailor who discovers an underwater civilization with technology far beyond human understanding.",
      genre: "Science Fiction",
      edition: "1st",
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      title: "Echoes of Tomorrow",
      author: "Sophia Williams",
      cover_url: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      summary: "A science fiction novel exploring the ethical implications of memory transfer technology in a post-scarcity society.",
      genre: "Science Fiction",
      edition: "1st",
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      title: "The Garden of Hidden Truths",
      author: "Jonathan Rivera",
      cover_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      summary: "A magical realism story about a family garden that grows plants corresponding to secrets kept by those who tend it.",
      genre: "Magical Realism",
      edition: "1st",
      created_at: new Date().toISOString()
    },
    {
      id: 5,
      title: "Beyond the Fractured Sky",
      author: "Aiden Patel",
      cover_url: "https://images.unsplash.com/photo-1579566346927-c68383817a25?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      summary: "A young adult fantasy about a world where the sky shattered into a thousand pieces, each reflecting a different reality.",
      genre: "Fantasy",
      edition: "1st",
      created_at: new Date().toISOString()
    }
  ];
};

// Helper function to get mock chapters by book title
const getMockChaptersForTitle = (bookTitle: string): Chapter[] => {
  const mockBooks = getMockBooks();
  const book = mockBooks.find(b => b.title === bookTitle);
  if (!book) return [];
  return getMockChapters(book.id);
};

// Mock chapters for development/fallback
export const getMockChapters = (bookId: number): Chapter[] => {
  const mockChaptersMap: Record<number, Chapter[]> = {
    1: [
      {
        id: "1-1",
        book_id: 1,
        bookTitle: "The Midnight Chronicles",
        title: "The Abandoned Clocktower",
        index: 1,
        content: [
          "The clock struck midnight as Lyra stepped into the abandoned clocktower. Dust particles danced in the moonlight that streamed through the broken windows, casting long shadows across the wooden floor.",
          "She had been tracking the anomalies for weeks now - moments when time seemed to stretch or compress, when the night lasted too long or day broke too early. The Council insisted it was nothing more than astronomical curiosities, but Lyra knew better.",
          "\"You shouldn't be here,\" a voice echoed from the darkness. Lyra spun around, her hand instinctively reaching for the timepiece in her pocket."
        ],
        created_at: new Date().toISOString()
      },
      {
        id: "1-2",
        book_id: 1,
        bookTitle: "The Midnight Chronicles",
        title: "The Chronos Artifact",
        index: 2,
        content: [
          "\"The Chronos Artifact,\" she whispered. \"Someone's found it, haven't they?\"",
          "Theo's grim expression was all the confirmation she needed. The artifact was supposed to be a myth, a story to frighten apprentice timekeepers - a relic with the power to manipulate the very fabric of time itself.",
          "\"We need to find it,\" Lyra said, already moving toward the spiral staircase that led to the top of the tower. \"Before whoever has it plunges the world into darkness.\""
        ],
        created_at: new Date().toISOString()
      }
    ],
    2: [
      {
        id: "2-1",
        book_id: 2,
        bookTitle: "Whispers of the Forgotten Sea",
        title: "The Wavecutter",
        index: 1,
        content: [
          "The salt spray stung Kai's eyes as he leaned over the bow of the Wavecutter. Three weeks at sea, and still no sign of the mythical Cerulean Current that his grandmother's maps had promised would lead them to riches beyond imagination.",
          "\"Captain says we're turning back tomorrow if we don't find it,\" said Elara, the ship's navigator and Kai's closest friend since childhood. Her dark hair whipped around her face in the strong wind.",
          "\"We can't,\" Kai replied, gripping the weathered parchment tighter. \"We're close. I can feel it.\""
        ],
        created_at: new Date().toISOString()
      }
    ],
    3: [
      {
        id: "3-1",
        book_id: 3,
        bookTitle: "Echoes of Tomorrow",
        title: "The Mnemosyne Project",
        index: 1,
        content: [
          "Dr. Amara Chen stared at the readout on her tablet, the blue light illuminating her face in the dimly lit laboratory. Test subject 37 showed perfect memory integration - the third successful transfer this week. She should have been elated; after fifteen years of research, the Mnemosyne Project was finally yielding consistent results.",
          "Instead, a knot of unease tightened in her stomach.",
          "\"Another green across the board,\" her assistant, Devin, said from his workstation. \"At this rate, we'll be ready for human trials by next quarter.\""
        ],
        created_at: new Date().toISOString()
      }
    ],
    4: [
      {
        id: "4-1",
        book_id: 4,
        bookTitle: "The Garden of Hidden Truths",
        title: "Rosa's Inheritance",
        index: 1,
        content: [
          "Rosa Mendez had always known there was something unusual about her grandmother's garden. As a child, she'd noticed how visitors would pause at the gate, their expressions shifting from curiosity to unease before they entered. How certain plants seemed to appear overnight, blooming out of season. How her grandmother would sometimes harvest strange flowers at dawn, brewing them into teas that she insisted certain neighbors drink.",
          "But it wasn't until Rosa inherited the house at twenty-nine, after her grandmother's passing, that she began to understand."
        ],
        created_at: new Date().toISOString()
      }
    ],
    5: [
      {
        id: "5-1",
        book_id: 5,
        bookTitle: "Beyond the Fractured Sky",
        title: "The Day the Sky Broke",
        index: 1,
        content: [
          "On the day the sky broke, Zara was sketching clouds. She'd been trying to capture the perfect cumulus formation when the first crack appeared – a jagged line of darkness splitting the blue expanse above her village.",
          "No one else seemed to notice at first. Not her mother, hanging laundry in their small yard. Not old Mr. Harlow, tending his vegetable garden next door. Not even the village watchman, whose job it was to scan the horizons for approaching storms or raiders.",
          "Only Zara, with her artist's eye for detail, saw the fracture spreading like ice breaking on a spring pond."
        ],
        created_at: new Date().toISOString()
      }
    ]
  };

  return mockChaptersMap[bookId] || [];
};