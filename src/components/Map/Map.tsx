import L, { Point } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import MouseCoordinateDisplay from "./MouseCoordinateDisplay";
import TileHoverDisplay from "./TileHoverDisplay";
import MapVariables from "./Variables";
import RoomsContainer from "./Rooms/Rooms";
import SettingsPane from "./SettingsPane";
import Markers from "./Markers";

// Leaflet has a coordinate system where Y 0 = bottom: Ingame has Y 0 = top, so flipping the Y axis
const CRSPixel = L.Util.extend(L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

const worldBounds = L.latLngBounds([0, 0], [300, 600]);

// Size of the canvas, assuming tiles are 48x48
const baseX = 28800;
const baseY = 28800;
// Finds the next power of 2 that is higher than the given number
function higherPow2(n: number) {
  const p = Math.ceil(Math.log(n) / Math.log(2));
  return Math.pow(2, p);
}
const worldXRatio = higherPow2(baseX) / baseX;
const worldYRatio = higherPow2(baseY) / baseY;

export default function Map() {
  return (
    <div>
      <div>
        <h1>Map</h1>
        <SettingsPane />
      </div>
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
          tileSize={
            new Point((baseX / 48) * worldXRatio, (baseY / 48) * worldYRatio)
          }
          noWrap={true}
          errorTileUrl="/mydz/blank.png"
          minNativeZoom={0}
          maxNativeZoom={7}
          zoomOffset={0}
          minZoom={0}
          maxZoom={7}
        />
        <MapVariables />
        <MouseCoordinateDisplay />
        <TileHoverDisplay />
        <RoomsContainer />
        <Markers />

        <Marker position={[0, 0]} />
        <Marker position={[300, 0]} />
        <Marker position={[0, 600]} />
        <Marker position={[300, 600]} />
      </MapContainer>
    </div>
  );
}
