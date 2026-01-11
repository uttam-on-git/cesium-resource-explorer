import { useRef, useState } from "react";
import "./App.css";
import CesiumViewer from "./components/CesiumViewer";
import ErrorBoundary from "./components/ErrorBoundary";
import FeatureInspector from "./components/FeatureInspector";
import LayerManager from "./components/LayerManager";
import LocationSearch from "./components/LocationSearch";
import MyLocation from "./components/MyLocation";
import { useFeaturePicker } from "./hooks/useFeaturePicker";
import { useLayerManager } from "./hooks/useLayerManager";
import { flyToUserLocation } from "./services/cesiumService";

function App() {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);

  // Layer management hook
  const { layerStates, toggleLayer, toggleVisibility, flyTo } = useLayerManager(viewerRef);

  // Feature picking hook (for GeoJSON inspection)
  const { selectedFeature, clearSelection } = useFeaturePicker(viewerRef);

  // Called when Cesium viewer is ready
  const handleViewerReady = (viewer) => {
    viewerRef.current = viewer;
    setViewerReady(true);

    // request geolocation on app load and fly to user's location
    flyToUserLocation(viewer).catch((error) => {
      // silently handle errors on initial load - user can click the button later
      console.log('Initial geolocation:', error.message);
    });
  };

  return (
    <div className="app">
      <ErrorBoundary>
        <CesiumViewer ref={viewerRef} onReady={handleViewerReady} />

        {/* Only show UI when viewer is ready */}
        {viewerReady && (
          <>
            <LocationSearch
              viewerRef={viewerRef}
              layerStates={layerStates}
              toggleLayer={toggleLayer}
              flyTo={flyTo}
            />
            <MyLocation viewerRef={viewerRef} />
            <LayerManager
              layerStates={layerStates}
              toggleLayer={toggleLayer}
              toggleVisibility={toggleVisibility}
              flyTo={flyTo}
            />

            {/* Feature inspector - shows when a GeoJSON feature is clicked */}
            <FeatureInspector
              feature={selectedFeature}
              onClose={clearSelection}
            />
          </>
        )}
      </ErrorBoundary>
    </div>
  );
}

export default App;
