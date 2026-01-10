import { useEffect, useRef, useState } from 'react';
import { CESIUM_TOKEN, ASSETS } from '../constants/assets';

export default function CesiumViewer() {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function initCesium() {
      try {
        // Dynamically import Cesium to ensure proper loading
        const Cesium = await import('cesium');

        if (!mounted || !containerRef.current) return;

        // Set the access token
        Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

        // Find the basemap asset (asset ID 3830186)
        const basemapAsset = ASSETS.find(a => a.assetId === 3830186);

        // Create the viewer with timeline hidden
        const viewer = new Cesium.Viewer(containerRef.current, {
          timeline: false,
          animation: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: true,
          sceneModePicker: true,
          navigationHelpButton: false,
          fullscreenButton: true,
        });

        // Remove default imagery layer
        viewer.imageryLayers.removeAll();

        // Add Ion asset 3830186 as basemap
        if (basemapAsset) {
          const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(
            basemapAsset.assetId
          );
          viewer.imageryLayers.addImageryProvider(imageryProvider);
        }

        viewerRef.current = viewer;
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Cesium:', err);
        setError(err.message);
        setIsLoading(false);
      }
    }

    initCesium();

    return () => {
      mounted = false;
      if (viewerRef.current && !viewerRef.current.isDestroyed()) {
        viewerRef.current.destroy();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="cesium-error">
        <p>Failed to load Cesium: {error}</p>
      </div>
    );
  }

  return (
    <div className="cesium-wrapper">
      {isLoading && (
        <div className="cesium-loading">
          <p>Loading Cesium viewer...</p>
        </div>
      )}
      <div ref={containerRef} className="cesium-container" />
    </div>
  );
}
