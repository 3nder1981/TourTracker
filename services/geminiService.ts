import { GoogleGenAI, Type } from "@google/genai";
import type { Concert } from '../types';

const concertSchema = {
  type: Type.OBJECT,
  properties: {
    bandName: { type: Type.STRING, description: "The name of the band." },
    date: { type: Type.STRING, description: "The concert date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)." },
    city: { type: Type.STRING, description: "The city where the concert is held." },
    country: { type: Type.STRING, description: "The country where the concert is held." },
    venue: { type: Type.STRING, description: "The name of the concert venue." },
    ticketUrl: { type: Type.STRING, description: "A fictional URL to buy tickets." },
  },
  required: ["bandName", "date", "city", "country", "venue", "ticketUrl"],
};

export const fetchConcertsForBands = async (bandNames: string[]): Promise<Omit<Concert, 'isFavorite'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    You are a concert data aggregator API. Your job is to find upcoming concert information for a list of music artists.
    Generate a realistic list of 3 to 5 upcoming (but not past) concerts for each of the following bands: ${bandNames.join(', ')}.
    The concerts should be scheduled within the next 12 months from today.
    Distribute the concerts across various cities and countries in North America, Europe, and Australia.
    Ensure the concert dates are plausible and the venues are realistic for the bands' popularity.
    Do not return any concerts for bands not in the provided list.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: concertSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
      console.warn("Gemini API returned an empty response.");
      return [];
    }
    const concerts = JSON.parse(jsonText);
    return concerts;

  } catch (error) {
    console.error("Error fetching or parsing concert data from Gemini API:", error);
    throw new Error("Failed to get concert data from AI model.");
  }
};

export const extractBandsFromText = async (text: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        You are a music library assistant. Your task is to extract all unique artist names from the following text, which is a dump from a music library or playlist.
        Ignore track names, album names, durations, and any other metadata. Return only the artist names.
        Ensure there are no duplicates and that each entry is a valid artist, not a generic term.
        Present the result as a clean JSON array of strings. For example: ["Artist Name 1", "Artist Name 2"].
        The text to parse is:
        ---
        ${text}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                        description: "An artist name"
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            console.warn("Gemini API returned an empty response for band extraction.");
            return [];
        }
        const bandNames = JSON.parse(jsonText);
        return bandNames;
    } catch (error) {
        console.error("Error extracting band data from text via Gemini API:", error);
        throw new Error("Failed to extract bands from text using AI model.");
    }
};

export const extractBandsFromUrl = async (url: string): Promise<string[]> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // FIX: Updated prompt to ask for a comma-separated list instead of JSON, to comply with googleSearch guidelines.
    const prompt = `
        You are a web scraping assistant specialized in music platforms. Your task is to analyze the content of the provided URL, which points to a public music playlist or library (like Apple Music, Spotify, etc.).
        
        1.  Access the content of this URL: ${url}
        2.  Identify and extract all the unique artist names mentioned on that page.
        3.  Ignore track titles, album names, playlist descriptions, and any other text.
        4.  Return the result as a comma-separated list of strings. For example: Artist A, Artist B, Artist C.
        5.  Crucially, your entire response must be ONLY the comma-separated list. Do not include any introductory text, explanations, or labels.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const text = response.text.trim();
        if (!text) {
            console.warn("Gemini API returned an empty response for URL extraction.");
            return [];
        }

        // FIX: Parse the comma-separated string instead of trying to parse JSON.
        return text.split(',').map(band => band.trim()).filter(Boolean);

    } catch (error) {
        console.error("Error extracting band data from URL via Gemini API:", error);
        throw new Error("Failed to extract bands from the URL using AI model.");
    }
};
