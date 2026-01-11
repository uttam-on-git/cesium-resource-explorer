import { useState, useRef, useEffect } from 'react';
import { SEARCH_LOCATIONS, ASSETS } from '../constants/assets';
import {
  Search,
  MapPin,
  ChevronDown,
  Navigation,
  Map,
  Mountain,
  Building2,
  Layers,
  X,
} from 'lucide-react';

// icons for each layer type
const LAYER_ICONS = {
  imagery: Map,
  terrain: Mountain,
  '3dtiles': Building2,
  geojson: MapPin,
};

export default function LocationSearch({ viewerRef, layerStates, toggleLayer, flyTo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDynamicLoading, setIsDynamicLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // filter locations based on search query
  const filteredLocations = SEARCH_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // filter layers based on search query
  const filteredLayers = ASSETS.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // combined results for keyboard navigation
  const allResults = [
    ...filteredLocations.map(loc => ({ ...loc, resultType: 'location' })),
    ...filteredLayers.map(layer => ({ ...layer, resultType: 'layer' }))
  ];

  const hasResults = allResults.length > 0;

  // reset highlight when query changes
  useEffect(() => {
    setHighlightedIndex(-1);
    setError(null);
  }, [searchQuery]);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // fly to location using Cesium
  const flyToLocation = async (location) => {
    const viewer = viewerRef?.current;
    if (!viewer || viewer.isDestroyed()) return;

    setIsDynamicLoading(true);
    setError(null);

    try {
      const Cesium = await import('cesium');

      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          location.lon,
          location.lat,
          location.altitude || 50000 // use location altitude or default
        ),
        orientation: {
          heading: Cesium.Math.toRadians(0),
          pitch: Cesium.Math.toRadians(-45),
          roll: 0,
        },
        duration: 2,
      });

      setSelectedItem({ type: 'location', id: location.name });
      setSearchQuery(location.name);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to fly to location:', err);
      setError('Navigation failed');
    } finally {
      setIsDynamicLoading(false);
    }
  };

  // handle layer selection - toggle it on if not loaded, fly to it if loaded
  const handleLayerSelect = async (asset) => {
    const state = layerStates?.[asset.assetId];
    setError(null);

    try {
      // if layer is already loaded, fly to it
      if (state?.loaded) {
        if (flyTo) await flyTo(asset);
      } else if (toggleLayer) {
        // otherwise toggle it (load it)
        await toggleLayer(asset);
      }

      setSelectedItem({ type: 'layer', id: asset.id });
      setSearchQuery(asset.name);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to select layer:', err);
      setError('Layer selection failed');
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev + 1) % allResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < allResults.length) {
          const item = allResults[highlightedIndex];
          if (item.resultType === 'location') {
            flyToLocation(item);
          } else {
            handleLayerSelect(item);
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
    setSelectedItem(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedItem(null);
    inputRef.current?.focus();
  };

  return (
    <div className="location-search" ref={dropdownRef}>
      <div className="location-search-header">
        <span className="location-search-label">
          {isDynamicLoading ? 'Loading Core...' : error ? <span className="text-signal-error">{error}</span> : 'Search'}
        </span>
      </div>

      <div className="location-search-input-wrapper" role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" aria-controls="location-search-results">
        <Search size={14} className={`location-search-icon ${isDynamicLoading ? 'animate-pulse' : ''}`} />
        <input
          ref={inputRef}
          type="text"
          className="location-search-input"
          placeholder="Search locations or layers..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="location-search-results"
          aria-activedescendant={highlightedIndex >= 0 ? `result-item-${highlightedIndex}` : undefined}
        />
        {searchQuery && (
          <button
            className="location-search-clear"
            onClick={clearSearch}
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
        <button
          className="location-search-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title="Show results"
        >
          <ChevronDown
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </button>
      </div>

      {isOpen && (
        <div className="location-dropdown" id="location-search-results" role="listbox">
          {!hasResults ? (
            <div className="location-empty" role="status">No results found</div>
          ) : (
            <div className="location-results">
              {/* Locations section */}
              {filteredLocations.length > 0 && (
                <div className="search-group" role="group" aria-label="Locations">
                  <div className="search-group-header" aria-hidden="true">
                    <Navigation size={12} />
                    <span>Locations</span>
                    <span className="search-group-count">{filteredLocations.length}</span>
                  </div>
                  <ul className="location-list">
                    {filteredLocations.map((location, index) => {
                      const isHighlighted = highlightedIndex === index;
                      return (
                        <li
                          key={location.name}
                          id={`result-item-${index}`}
                          role="option"
                          aria-selected={isHighlighted}
                          className={`location-item ${
                            selectedItem?.type === 'location' && selectedItem?.id === location.name
                              ? 'location-item-active'
                              : ''
                          } ${isHighlighted ? 'location-item-highlighted' : ''}`}
                          onClick={() => flyToLocation(location)}
                          style={{ animationDelay: `${index * 0.03}s` }}
                        >
                          <MapPin size={14} className="location-item-icon location-icon" />
                          <div className="location-item-content">
                            <span className="location-item-name">{location.name}</span>
                            <span className="location-item-coords">
                              {location.lat.toFixed(2)}°, {location.lon.toFixed(2)}°
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Layers section */}
              {filteredLayers.length > 0 && (
                <div className="search-group" role="group" aria-label="Data Layers">
                  <div className="search-group-header" aria-hidden="true">
                    <Layers size={12} />
                    <span>Data Layers</span>
                    <span className="search-group-count">{filteredLayers.length}</span>
                  </div>
                  <ul className="location-list">
                    {filteredLayers.map((asset, index) => {
                      const LayerIcon = LAYER_ICONS[asset.type] || Map;
                      const state = layerStates?.[asset.assetId];
                      const isLoaded = state?.loaded;
                      const globalIndex = filteredLocations.length + index;
                      const isHighlighted = highlightedIndex === globalIndex;

                      return (
                        <li
                          key={asset.id}
                          id={`result-item-${globalIndex}`}
                          role="option"
                          aria-selected={isHighlighted}
                          className={`location-item ${
                            selectedItem?.type === 'layer' && selectedItem?.id === asset.id
                              ? 'location-item-active'
                              : ''
                          } ${isLoaded ? 'layer-item-loaded' : ''} ${
                            isHighlighted ? 'location-item-highlighted' : ''
                          }`}
                          onClick={() => handleLayerSelect(asset)}
                          style={{ animationDelay: `${globalIndex * 0.03}s` }}
                        >
                          <LayerIcon size={14} className={`location-item-icon layer-icon layer-icon-${asset.type}`} />
                          <div className="location-item-content">
                            <span className="location-item-name">
                              {asset.name}
                              {isLoaded && <span className="layer-status-badge">ACTIVE</span>}
                            </span>
                            <span className="location-item-meta">
                              <span className="layer-type-label">{asset.type}</span>
                              {asset.size && <span className="layer-size-label">{asset.size}</span>}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
