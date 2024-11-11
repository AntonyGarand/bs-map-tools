import { useAtomValue } from "jotai";
import { LatLngBoundsExpression } from "leaflet";
import { useMemo } from "react";
import { Rectangle } from "react-leaflet";
import { tileCoordinatesAtom } from "./atoms";

export default function TileCoordinateDisplay() {
  const tileCoordinates = useAtomValue(tileCoordinatesAtom);
  const rectangleBounds = useMemo<LatLngBoundsExpression>(
    () => [
      [tileCoordinates.y, tileCoordinates.x],
      [tileCoordinates.y + 1, tileCoordinates.x + 1],
    ],
    [tileCoordinates]
  );

  return (
    <Rectangle
      bounds={rectangleBounds}
      pathOptions={{ color: "red" }}
      color="red"
      weight={1}
    />
  );
  return <></>;
}
