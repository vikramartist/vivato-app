export const extractJson = (text: string) => {
  if (!text || text.length === 0) {
    return;
  }

  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(cleaned);
};
