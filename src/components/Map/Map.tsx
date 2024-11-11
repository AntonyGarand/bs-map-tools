import { atom, useAtom, useAtomValue } from "jotai";
import L, { LatLngBoundsExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Marker,
  Rectangle,
  TileLayer,
  useMapEvent
} from "react-leaflet";

interface Point {
  x: number;
  y: number;
}

const coordinatesAtom = atom<Point>({ x: 0, y: 0 });

function MouseCoordinateDisplay() {
  const [coordinates, setCoordinates] = useAtom(coordinatesAtom);

  useMapEvent("mousemove", (event) => {
    const { lat, lng } = event.latlng;
    const x = Math.floor(lng);
    const y = Math.floor(lat);
    setCoordinates({
      x,
      y,
    });
  });

  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 1000,
          background: "white",
          color: "black",
          padding: "5px",
        }}
      >
        Coordinates: ({coordinates.x}, {coordinates.y})
      </div>
    </>
  );
}

// Leaflet has a coordinate system where Y 0 = bottom: Ingame has Y 0 = top, so flipping the Y axis
const CRSPixel = L.Util.extend(L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

const worldBounds = L.latLngBounds([0, 0], [300, 300]);

export default function Map() {
  const mouseCoords = useAtomValue(coordinatesAtom);
  const rectangleBounds = useMemo<LatLngBoundsExpression>(
    () => [
      [mouseCoords.y, mouseCoords.x],
      [mouseCoords.y + 1, mouseCoords.x + 1],
    ],
    [mouseCoords]
  );

  const MapCtnr = useRef<L.Map>(null);
  useEffect(() => {
    if (MapCtnr.current) {
      MapCtnr.current.on("zoomend", (a) => {
        console.log("Zoom level changed", a);
      });
    }
  }, [MapCtnr]);

  return (
    <div>
      <h1>Map</h1>
      <MapContainer
        ref={MapCtnr}
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
          // Size = Next power of 2 / actual size 
          tileSize={300 * 1.137777}
          noWrap={true}
          errorTileUrl="/mydz/blank.png"
          minNativeZoom={0}
          maxNativeZoom={6}
          zoomOffset={0}
          minZoom={0}
          maxZoom={8}
        />
        <MouseCoordinateDisplay />

        <Marker position={[0, 0]} />
        <Marker position={[300, 0]} />
        <Marker position={[0, 300]} />
        <Marker position={[300, 300]} />

        {/* <ImageOverlay url="/world-map.png" bounds={worldBounds} /> */}
        <Rectangle
          bounds={rectangleBounds}
          pathOptions={{ color: "red" }}
          color="red"
          weight={1}
        />


      {/* <FeatureGroup>
        <Popup>Popup in FeatureGroup</Popup>
        <Circle center={[50,50]} radius={20} />
        <Rectangle bounds={[[10,10],[20,20]]} />
      </FeatureGroup> */}
      </MapContainer>
    </div>
  );
}
