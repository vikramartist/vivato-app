import AiSearchCache from "../../models/aiSearchCache.js";
import { ai } from "../gemini.js";
import { restaurantSearchPrompt } from "../prompts/restaurant-search-prompt.js";
import { normalizeQuery } from "../utils/normalize-query.js";
import { extractJson } from "../utils/parse-json.js";

type AIContent = {
  query: string;
  cuisines: string[] | [];
  foodType: string[] | [];
  intent: string | null;
  priceFilter: {
    operator: string | null;
    value: number | null;
    min: number | null;
    max: number | null;
  };
};

export const getFoodsearchFilters = async (
  useQuery: string,
): Promise<AIContent | undefined> => {
  try {
    const normalizedQuery = normalizeQuery(useQuery) as string;

    //check usage
    const existingCache = await AiSearchCache.findOne({
      normalizedQuery,
      expiresAt: { $gt: new Date() },
    });

    if (existingCache) {
      console.log("Ai Cache hit!");

      return existingCache.aiResult;
    }

    console.log("AI Cache miss!");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: restaurantSearchPrompt(useQuery),
    });

    const text = response.text || "";

    const parsed = extractJson(text);

    //store cache
    await AiSearchCache.create({
      query: useQuery,
      normalizedQuery,
      aiResult: parsed,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    console.log("Success, Cache stored in db");

    return parsed;
  } catch (error) {
    console.log("Error in ai food search service: ", error);
  }
};
