import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling entity picking (clicking on map features)
 * Returns selected feature data and handlers
 */
export function useFeaturePicker(viewerRef) {
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Close the inspector
  const clearSelection = useCallback(() => {
    setSelectedFeature(null);
  }, []);

  useEffect(() => {
    const viewer = viewerRef?.current;
    if (!viewer || viewer.isDestroyed()) return;

    let handler = null;

    // Dynamically import Cesium to set up the handler
    import('cesium').then((Cesium) => {
      if (!viewer || viewer.isDestroyed()) return;

      handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

      // Handle left click
      handler.setInputAction((event) => {
        const pickedObject = viewer.scene.pick(event.position);

        if (Cesium.defined(pickedObject) && pickedObject.id) {
          const entity = pickedObject.id;

          // Extract position if available
          let position = null;
          if (entity.position) {
            try {
              const cartesian = entity.position.getValue(Cesium.JulianDate.now());
              if (cartesian) {
                const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                position = {
                  lat: Cesium.Math.toDegrees(cartographic.latitude),
                  lon: Cesium.Math.toDegrees(cartographic.longitude),
                };
              }
            } catch (e) {
              // Position extraction failed, continue without it
            }
          }

          // Extract properties from entity
          const properties = {};
          if (entity.properties) {
            const propertyNames = entity.properties.propertyNames || [];
            propertyNames.forEach((name) => {
              try {
                properties[name] = entity.properties[name]?.getValue(Cesium.JulianDate.now());
              } catch (e) {
                properties[name] = entity.properties[name];
              }
            });
          }

          setSelectedFeature({
            id: entity.id,
            name: entity.name || 'Unnamed Feature',
            properties,
            position,
          });
        } else {
          // Clicked on empty space - clear selection
          setSelectedFeature(null);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    });

    // Cleanup
    return () => {
      if (handler && !handler.isDestroyed()) {
        handler.destroy();
      }
    };
  }, [viewerRef]);

  // Keyboard handler for Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedFeature) {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFeature, clearSelection]);

  return {
    selectedFeature,
    clearSelection,
  };
}
