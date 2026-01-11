import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { CESIUM_TOKEN, ASSETS } from '../constants/assets';

// using forwardRef so parent can access the viewer
const CesiumViewer = forwardRef(function CesiumViewer(props, ref) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState('INITIALIZING SYSTEMS');
  const [error, setError] = useState(null);

  // expose viewer to parent component
  useImperativeHandle(ref, () => viewerRef.current, []);

  useEffect(() => {
    let mounted = true;

    async function initCesium() {
      try {
        setLoadStatus('LOADING CESIUM ENGINE');
        const Cesium = await import('cesium');

        if (!mounted || !containerRef.current) return;

        setLoadStatus('AUTHENTICATING ION ACCESS');
        Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;

        // find the basemap asset
        const basemapAsset = ASSETS.find(a => a.assetId === 3830186);

        setLoadStatus('INITIALIZING 3D VIEWER');
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
          setLoadStatus('LOADING BASE IMAGERY');
          const imageryProvider = await Cesium.IonImageryProvider.fromAssetId(
            basemapAsset.assetId
          );
          viewer.imageryLayers.addImageryProvider(imageryProvider);
        }

        setLoadStatus('SYSTEMS ONLINE');
        viewerRef.current = viewer;

        // brief delay to show "systems online" message
        await new Promise(resolve => setTimeout(resolve, 300));
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
        <div className="loading-orbital" style={{ marginBottom: '2rem' }}>
          <div className="loading-ring" style={{ borderColor: '#ef4444', opacity: 0.5 }} />
          <div className="loading-ring" style={{ borderColor: '#ef4444', opacity: 0.7 }} />
          <div className="loading-core" style={{ background: 'radial-gradient(circle, #ef4444 0%, transparent 70%)' }} />
        </div>
        <p style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>SYSTEM FAILURE</p>
        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="cesium-wrapper">
      {isLoading && (
        <div className="cesium-loading">
          <div className="loading-orbital">
            <div className="loading-ring" />
            <div className="loading-ring" />
            <div className="loading-ring" />
            <div className="loading-core" />
          </div>
          <p className="loading-text">Cesium Resource Explorer</p>
          <p className="loading-status">{loadStatus}</p>
        </div>
      )}
      <div ref={containerRef} className="cesium-container" />
    </div>
  );
});

export default CesiumViewer;
