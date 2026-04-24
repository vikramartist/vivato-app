export const getCoords = async (address: string) => {
  const API_KEY = process.env.OPENCAGE_API_KEY;

  const res = await fetch(
    `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
      address,
    )}&key=${API_KEY}`,
  );

  const data = await res.json();

  if (!data.results.length) return [];

  const { lat, lng } = data.results[0].geometry;

  return [lng, lat];
};
