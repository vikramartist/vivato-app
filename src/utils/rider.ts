export const generateRiderId = (name: string): string => {
  return `Vivato-${name.toLowerCase().replace(/\s+/g, "")}-${Math.floor(1000 * Math.random() * 9000)}`;
};
