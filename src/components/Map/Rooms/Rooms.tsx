import { useLocalStorage } from "@uidotdev/usehooks";
import { useAtomValue } from "jotai";
import L, { LatLngExpression, Point } from "leaflet";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Marker, Polyline, useMapEvents } from "react-leaflet";
import { roomSettingsElementAtom, tileCoordinatesAtom } from "../atoms";

import hopeportRooms from "./hopeport.json";
import hopeForestRooms from "./hopeforest.json";

interface Room {
  name: string;
  points: Point[];
}

const hopeport: Room[] = hopeportRooms.map((v) => ({
  name: v.name,
  points: v.points.map((v) => new Point(v.x, v.y)),
}));
const hopeforst = hopeForestRooms.map((v) => ({
  name: v.name,
  points: v.points.map((v) => new Point(v.x, v.y)),
}));

function RoomList({
  rooms,
  onDelete,
}: {
  rooms: Room[];
  onDelete: (index: number) => void;
}) {
  return (
    <div style={{ maxHeight: "15vh", overflow: "auto" }}>
      <ul>
        {rooms.map((room, index) => (
          <li key={index}>
            {room.name}
            <button onClick={() => onDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function RoomsContainer() {
  // Will contain all the rooms
  const [rooms, setRooms] = useLocalStorage<Room[]>("rooms", []);
  const roomSettingsContainer = useAtomValue(roomSettingsElementAtom);

  const [showHopeport, setShowHopeport] = useState(true);
  const [showHopeForest, setShowHopeforest] = useState(true);

  const [isAddingRoom, setIsAddingRoom] = useState(false);

  const tileCoordinates = useAtomValue(tileCoordinatesAtom);
  const [currentRoomName, setCurrentRoomName] = useState("");
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

  const handleAddPoint = () => {
    setCurrentPoints((current) => [...current, tileCoordinates]);
  };

  const handleSaveRoom = () => {
    if (currentRoomName.trim() && currentPoints.length) {
      setRooms([...rooms, { name: currentRoomName, points: currentPoints }]);
      setCurrentRoomName("");
      setCurrentPoints([]);
      setIsAddingRoom(false);
    }
  };

  const handleDeleteRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const mappedRooms = useMemo(() => {
    return (
      <>
        {rooms.map((room, idx) => {
          const pointCoordinates: LatLngExpression[] = room.points.map((v) => [
            v.y,
            v.x,
          ]);
          const polygon = L.polygon(pointCoordinates);
          const center = polygon.getBounds().getCenter();
          const text = L.divIcon({ html: room.name, className: "" });

          return (
            <>
              <Polyline key={idx} positions={pointCoordinates}>
                <Marker position={center} icon={text} />
              </Polyline>
            </>
          );
        })}
      </>
    );
  }, [rooms]);

  const currentRoomPolyline = useMemo(() => {
    const positions: LatLngExpression[] = currentPoints.map((v) => [v.y, v.x]);
    // Preview where you'll bee adding the point
    positions.push([tileCoordinates.y, tileCoordinates.x]);

    return currentPoints.length > 0 && <Polyline positions={positions} />;
  }, [currentPoints, tileCoordinates]);

  useMapEvents({
    click() {
      if (isAddingRoom) handleAddPoint();
    },
  });

  const baseRooms = useMemo(() => {
    const enabledRooms = [];
    if (showHopeport) enabledRooms.push(...hopeport);
    if (showHopeForest) enabledRooms.push(...hopeforst);

    return (
      <>
        {enabledRooms.map((room, idx) => {
          const pointCoordinates: LatLngExpression[] = room.points.map((v) => [
            v.y,
            v.x,
          ]);
          const polygon = L.polygon(pointCoordinates);
          const center = polygon.getBounds().getSouthWest();
          const text = L.divIcon({ html: room.name, className: "" });
          return (
            <>
              <Polyline key={idx} positions={pointCoordinates}>
                <Marker position={center} icon={text} />
              </Polyline>
            </>
          );
        })}
      </>
    );
  }, [showHopeForest, showHopeport]);

  return (
    <div>
      <div>
        {roomSettingsContainer &&
          createPortal(
            <>
              <label>
                <input
                  type="checkbox"
                  checked={showHopeport}
                  onChange={() => setShowHopeport(!showHopeport)}
                />
                Hopeport
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showHopeForest}
                  onChange={() => setShowHopeforest(!showHopeForest)}
                />
                HopeForest
              </label>
              <br />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(rooms));
                  alert("Successfully copied rooms to clipboard");
                }}
              >
                Export rooms
              </button>
              {!isAddingRoom && (
                <button onClick={() => setIsAddingRoom(!isAddingRoom)}>
                  Add Room
                </button>
              )}
              {isAddingRoom && (
                <>
                  <input
                    type="text"
                    value={currentRoomName}
                    onChange={(e) => setCurrentRoomName(e.target.value)}
                    placeholder="Name the room"
                  />
                  <button onClick={handleSaveRoom}>Save Room</button>
                </>
              )}
              <RoomList rooms={rooms} onDelete={handleDeleteRoom} />
            </>,
            roomSettingsContainer
          )}
        {currentRoomPolyline}
        {mappedRooms}
        {showHopeport && baseRooms}
        {showHopeForest && baseRooms}
        {baseRooms}
      </div>
    </div>
  );
}
