import { useSetAtom } from "jotai";
import { Point } from "leaflet";
import { useMapEvent } from "react-leaflet";
import { mouseCoordinatesAtom } from "./atoms";

export default function MapVariables() {
  const setCoordinates = useSetAtom(mouseCoordinatesAtom);

  useMapEvent("mousemove", (event) => {
    const { lat, lng } = event.latlng;
    setCoordinates(new Point(lng, lat));
  });

  return <></>;
}
