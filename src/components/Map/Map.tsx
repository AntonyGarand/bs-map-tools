import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  TileLayer
} from "react-leaflet";
import MouseCoordinateDisplay from "./MouseCoordinateDisplay";
import TileHoverDisplay from "./TileHoverDisplay";
import MapVariables from "./Variables";

// Leaflet has a coordinate system where Y 0 = bottom: Ingame has Y 0 = top, so flipping the Y axis
const CRSPixel = L.Util.extend(L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

const worldBounds = L.latLngBounds([0, 0], [300, 300]);

export default function Map() {
  return (
    <div>
      <h1>Map</h1>
      <MapContainer
        bounds={worldBounds}
        maxBounds={worldBounds}
        style={{ height: "100vh", width: "100vw" }}
        crs={CRSPixel}
        center={[65, 30]}
        zoom={0}
      >
        <TileLayer
          bounds={worldBounds}
          url="/mydz/{z}/{y}/{x}.jpg"
          // Size = actual size * ({Next power of 2} / actual size)
          tileSize={300 * 1.137777}
          noWrap={true}
          errorTileUrl="/mydz/blank.png"
          minNativeZoom={0}
          maxNativeZoom={6}
          zoomOffset={0}
          minZoom={0}
          maxZoom={8}
        />
        <MapVariables />
        <MouseCoordinateDisplay />
        <TileHoverDisplay />

        <Marker position={[0, 0]} />
        <Marker position={[300, 0]} />
        <Marker position={[0, 300]} />
        <Marker position={[300, 300]} />

      </MapContainer>
    </div>
  );
}
