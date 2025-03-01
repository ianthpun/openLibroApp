import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client for when Supabase is unavailable
const createMockClient = () => {
  const mockData = {
    books: [
      {
        id: 1,
        title: "The Midnight Chronicles",
        author: "Eliza Morgan",
        cover_url: "https://images.unsplash.com/photo-1531901599143-df5010ab9438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        summary: "A tale of mystery and adventure in a world where night and day are controlled by ancient magical forces.",
        content: "The clock struck midnight as Lyra stepped into the abandoned clocktower...",
        created_at: new Date().toISOString(),
        genre: "Fantasy",
        edition: "1st"
      },
      {
        id: 2,
        title: "Whispers of the Forgotten Sea",
        author: "Marcus Chen",
        cover_url: "https://images.unsplash.com/photo-1551373884-8a0750074df7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        summary: "An epic fantasy about a young sailor who discovers an underwater civilization with technology far beyond human understanding.",
        content: "The salt spray stung Kai's eyes as he leaned over the bow of the Wavecutter...",
        created_at: new Date().toISOString(),
        genre: "Science Fiction",
        edition: "1st"
      },
      {
        id: 3,
        title: "Echoes of Tomorrow",
        author: "Sophia Williams",
        cover_url: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        summary: "A science fiction novel exploring the ethical implications of memory transfer technology in a post-scarcity society.",
        content: "Dr. Amara Chen stared at the readout on her tablet...",
        created_at: new Date().toISOString(),
        genre: "Science Fiction",
        edition: "1st"
      },
      {
        id: 4,
        title: "The Garden of Hidden Truths",
        author: "Jonathan Rivera",
        cover_url: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        summary: "A magical realism story about a family garden that grows plants corresponding to secrets kept by those who tend it.",
        content: "Rosa Mendez had always known there was something unusual about her grandmother's garden...",
        created_at: new Date().toISOString(),
        genre: "Magical Realism",
        edition: "1st"
      },
      {
        id: 5,
        title: "Beyond the Fractured Sky",
        author: "Aiden Patel",
        cover_url: "https://images.unsplash.com/photo-1579566346927-c68383817a25?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        summary: "A young adult fantasy about a world where the sky shattered into a thousand pieces, each reflecting a different reality.",
        content: "On the day the sky broke, Zara was sketching clouds...",
        created_at: new Date().toISOString(),
        genre: "Fantasy",
        edition: "1st"
      }
    ],
    chapters: [
      {
        id: "1-1",
        book_id: 1,
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
        title: "The Chronos Artifact",
        index: 2,
        content: [
          "\"The Chronos Artifact,\" she whispered. \"Someone's found it, haven't they?\"",
          "Theo's grim expression was all the confirmation she needed. The artifact was supposed to be a myth, a story to frighten apprentice timekeepers - a relic with the power to manipulate the very fabric of time itself.",
          "\"We need to find it,\" Lyra said, already moving toward the spiral staircase that led to the top of the tower. \"Before whoever has it plunges the world into darkness.\""
        ],
        created_at: new Date().toISOString()
      }
    ]
  };

  return {
    from: (table: string) => ({
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          data: mockData[table as keyof typeof mockData]?.filter((item: any) => item[column] === value) || [],
          error: null
        }),
        order: (column: string, { ascending = true } = {}) => ({
          data: [...(mockData[table as keyof typeof mockData] || [])].sort((a: any, b: any) => {
            if (ascending) {
              return a[column] > b[column] ? 1 : -1;
            } else {
              return a[column] < b[column] ? 1 : -1;
            }
          }),
          error: null
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => ({
            data: { ...data, id: Math.floor(Math.random() * 1000) },
            error: null
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null
        })
      })
    })
  };
};

// Try to create a real Supabase client, but fall back to mock if needed
let supabase;
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase credentials not found, using mock data');
    supabase = createMockClient();
  }
} catch (error) {
  console.warn('Error creating Supabase client, using mock data:', error);
  supabase = createMockClient();
}

export { supabase };