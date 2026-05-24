export const normalizeQuery = (text: string) => {
  if (!text || text.length === 0) {
    return;
  }

  return text.trim().toLowerCase().replace(/\s+/g, " ");
};
