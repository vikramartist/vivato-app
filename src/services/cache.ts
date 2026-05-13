type RouteCacheValue = {
  data: {
    distance: number;
    duration: number;
    geometry: string;
  };
  timestamp: number;
};

export const routeCache = new Map<string, RouteCacheValue>();

export const generateRouteKey = (
  source: { lat: number; lng: number },
  target: { lat: number; lng: number },
) => {
  return [
    source.lng.toFixed(4),
    source.lat.toFixed(4),
    target.lng.toFixed(4),
    target.lat.toFixed(4),
  ].join("_");
};
