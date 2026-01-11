import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { CESIUM_TOKEN, ASSETS } from '../constants/assets';

// using forwardRef so parent can access the viewer
const CesiumViewer = forwardRef(function CesiumViewer(props, ref) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // expose viewer to parent component
  useImperativeHandle(ref, () => viewerRef.current, []);

  useEffect(() => {
    let mounted = true;

    async function initCesium() {
      try {
        const Cesium = await import('cesium');

        if (!mounted || !containerRef.current) return;

        Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

        // find the basemap asset
        const basemapAsset = ASSETS.find(a => a.assetId === 3830186);

        // create viewer with timeline hidden
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

        // remove default imagery and add our basemap
        viewer.imageryLayers.removeAll();

        if (basemapAsset) {
          const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(
            basemapAsset.assetId
          );
          viewer.imageryLayers.addImageryProvider(imageryProvider);
        }

        viewerRef.current = viewer;
        setIsLoading(false);

        // call onReady if provided
        if (props.onReady) {
          props.onReady(viewer);
        }
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
});

export default CesiumViewer;