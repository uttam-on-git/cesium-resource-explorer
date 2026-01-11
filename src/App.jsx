import { useRef, useState } from "react";
import "./App.css";
import CesiumViewer from "./components/CesiumViewer";
import LayerManager from "./components/LayerManager";
import LocationSearch from "./components/LocationSearch";
import MyLocation from "./components/MyLocation";
import { useLayerManager } from "./hooks/useLayerManager";
import { flyToUserLocation } from "./services/cesiumService";

function App() {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);

  // hook needs the viewer ref to work
  const { layerStates, toggleLayer, toggleVisibility, flyTo } = useLayerManager(viewerRef);

  // called when cesium viewer is ready
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
      <CesiumViewer ref={viewerRef} onReady={handleViewerReady} />

      {/* only show UI when viewer is ready */}
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
        </>
      )}
    </div>
  );
}

export default App;
