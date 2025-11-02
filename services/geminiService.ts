
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not defined in environment variables. Using fallback data.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const FALLBACK_WORDS = ["книга", "столб", "карта", "слово", "жизнь", "школа", "ручка", "море", "поле", "дверь", "лампа", "зерно", "трава", "песня", "танец"];

export const getWords = async (): Promise<string[]> => {
  if (!ai) {
      return FALLBACK_WORDS;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Сгенерируй 20 случайных русских имен существительных в единственном числе из 5 букв. Не используй имена собственные.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        },
      },
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    if (result.words && Array.isArray(result.words)) {
      const filteredWords = result.words
        .map((word: string) => word.toLowerCase().trim())
        .filter((word: string) => word.length === 5 && /^[а-яё]+$/.test(word));
      return filteredWords.length > 0 ? filteredWords : FALLBACK_WORDS;
    }
    
    throw new Error("Invalid response format from API");

  } catch (error) {
    console.error("Error fetching words from Gemini API:", error);
    return FALLBACK_WORDS;
  }
};

export const validateWord = async (word: string): Promise<boolean> => {
  if (!word || word.length !== 5 || !/^[а-яё]+$/.test(word)) return false;
  if (!ai) {
    // If no API key, we cannot validate, so we accept any 5-letter word
    return true; 
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Является ли слово "${word}" существующим русским именем существительным в единственном числе, не именем собственным? Ответь только "да" или "нет".`,
       config: {
         temperature: 0,
       }
    });
    
    const textResponse = response.text.trim().toLowerCase();
    return textResponse === "да";
  } catch (error) {
    console.error("Error validating word with Gemini API:", error);
    return false;
  }
};
