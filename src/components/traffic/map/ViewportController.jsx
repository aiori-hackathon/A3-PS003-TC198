// Viewport Controller for Leaflet Map transitions
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function ViewportController({
  targetCenter,
  targetZoom,
  targetBounds,
  triggerCount,
  isFullscreen
}) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 150);
    return () => clearTimeout(timer);
  }, [map, isFullscreen]);

  useEffect(() => {
    if (triggerCount > 0) {
      if (targetBounds) {
        map.flyToBounds(targetBounds, {
          padding: [45, 45],
          duration: 0.75,
          easeLinearity: 0.25
        });
      } else if (targetCenter) {
        map.flyTo(targetCenter, targetZoom || 13.5, {
          duration: 0.75,
          easeLinearity: 0.25
        });
      }
    }
  }, [triggerCount, targetCenter, targetZoom, targetBounds, map]);

  return null;
}
