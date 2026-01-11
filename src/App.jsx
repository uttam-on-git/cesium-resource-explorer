import { useRef, useState } from "react";
import "./App.css";
import CesiumViewer from "./components/CesiumViewer";
import LayerManager from "./components/LayerManager";
import { useLayerManager } from "./hooks/useLayerManager";

function App() {
  const viewerRef = useRef(null);
  const [viewerReady, setViewerReady] = useState(false);

  // hook needs the viewer ref to work
  const { layerStates, toggleLayer, toggleVisibility, flyTo } = useLayerManager(viewerRef);

  // called when cesium viewer is ready
  const handleViewerReady = (viewer) => {
    viewerRef.current = viewer;
    setViewerReady(true);
  };

  return (
    <div className="app">
      <CesiumViewer ref={viewerRef} onReady={handleViewerReady} />

      {/* only show layer manager when viewer is ready */}
      {viewerReady && (
        <LayerManager
          layerStates={layerStates}
          toggleLayer={toggleLayer}
          toggleVisibility={toggleVisibility}
          flyTo={flyTo}
        />
      )}
    </div>
  );
}

export default App;
