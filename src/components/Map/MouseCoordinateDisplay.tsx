import { useAtomValue } from "jotai";
import { tileCoordinatesAtom } from "./atoms";

export default function MouseCoordinateDisplay() {
  const coordinates = useAtomValue(tileCoordinatesAtom);
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
  return <></>;
}
