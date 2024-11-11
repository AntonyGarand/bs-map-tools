import { atom } from "jotai";
import { Point } from "leaflet";

// Coordinates atom: Contains the coordinates of the mouse pointer
export const mouseCoordinatesAtom = atom<Point>(new Point(0, 0));
// Tile coordinates atom: Contains the coordinates of the tile the mouse pointer is over
export const tileCoordinatesAtom = atom<Point>((get) => {
  const { x, y } = get(mouseCoordinatesAtom);
  return new Point(Math.floor(x), Math.floor(y));
});
