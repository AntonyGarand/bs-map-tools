import { useLocalStorage } from "@uidotdev/usehooks";
import { useAtomValue } from "jotai";
import L, { LatLngExpression, Point } from "leaflet";
import { useMemo, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { renderToString } from "react-dom/server";
import { Marker, Polygon, Polyline, useMap, useMapEvents } from "react-leaflet";
import { roomSettingsElementAtom, tileCoordinatesAtom } from "../atoms";

import hopeForestRooms from "./hopeforest.json";
import hopeportRooms from "./hopeport.json";

interface Room {
  name: string;
  points: Point[];
  polygon: L.Polygon;
}

const hopeport: Room[] = hopeportRooms.map((v) => ({
  name: v.name,
  points: v.points.map((v) => new Point(v.x, v.y)),
  polygon: L.polygon(v.points.map((v) => [v.y, v.x] as LatLngExpression)),
}));
const hopeforest = hopeForestRooms.map((v) => ({
  name: v.name,
  points: v.points.map((v) => new Point(v.x, v.y)),
  polygon: L.polygon(v.points.map((v) => [v.y, v.x] as LatLngExpression)),
}));

interface ThingTodo {
  name: string;
  icon: string;
  isAfk?: boolean;
  color: string;
  levelRequirement?: number;
  isStation?: boolean;
}

function RoomPopup({ room }: { room: Room }) {
  // const map = useMap();
  // const zoom = map.getZoom();

  // Mock list of ThingTodo items
  const thingsToDo: ThingTodo[] = [
    { name: "Fishing Spot", icon: "🎣", color: "#7bcc74", levelRequirement: 5 },
    { name: "Treasure Hunt", icon: "💰", color: "#5e8557" },
    { name: "Rest Area", icon: "🛌", color: "#64644c", levelRequirement: 2 },
  ];

  return (
    <div
      style={{
        background: "#ab6043",
        minWidth: "200px",
        borderRadius: "8px",
        padding: "10px",
        position: "relative",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-15px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#ab6043",
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.5)",
          borderRadius: "4px",
          padding: "5px 10px",
          display: "flex",
          justifyContent: "center", // Center align content horizontally
          textAlign: "center", // Center align text within the div
          alignItems: "center",
        }}
      >
        <strong>{room.name}</strong>
      </div>
      <div style={{ marginTop: "20px" }}>
        {thingsToDo.map((thing, index) => (
          <div
            key={index}
            style={{
              // border: `1px solid #ab6043`,
              background: `1px solid ${thing.color}`,
              margin: "1px 0",
              padding: "5px",
              display: "flex",
              backgroundColor: thing.color,
              color: "black",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex" }}>
              <div>{thing.icon}</div>
              <div>{thing.name}</div>
            </div>
            <div>
              {thing.levelRequirement !== undefined && (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: `2px solid ${thing.color}`,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "black",
                    color: thing.color,
                  }}
                >
                  {thing.levelRequirement}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

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

  const [visibleRoom, setVisibleRoom] = useState<Room>();

  useMapEvents({
    click() {
      // Centering around the current tile
      const centerPosition = new Point(
        tileCoordinates.x + 0.5,
        tileCoordinates.y + 0.5
      );

      const room = [...hopeport, ...hopeforest].find((room) => {
        const polygon = L.polygon(
          room.points.map((v) => [v.y, v.x] as LatLngExpression)
        );
        return polygon
          .getBounds()
          .contains([centerPosition.y, centerPosition.x]);
      });

      setVisibleRoom(room);
    },
  });

  const handleAddPoint = () => {
    setCurrentPoints((current) => [...current, tileCoordinates]);
  };

  const handleSaveRoom = () => {
    if (currentRoomName.trim() && currentPoints.length) {
      setRooms([
        ...rooms,
        {
          name: currentRoomName,
          points: currentPoints,
          polygon: L.polygon(
            currentPoints.map((v) => [v.y, v.x] as LatLngExpression)
          ),
        },
      ]);
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
          const text = L.divIcon({
            html: renderToString(RoomPopup({ room })),
            className: "",
          });

          return (
            <>
              <Polyline key={idx} positions={pointCoordinates} fillOpacity={0}>
                {/* <Marker position={center} icon={text} /> */}
                {visibleRoom?.name === room.name && (
                  <Marker position={center} icon={text} />
                )}
                {/* <Marker position={center} icon={text} /> */}
              </Polyline>
            </>
          );
        })}
      </>
    );
  }, [rooms, visibleRoom]);

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
    if (showHopeForest) enabledRooms.push(...hopeforest);

    return (
      <>
        {enabledRooms.map((room, idx) => {
          const pointCoordinates: LatLngExpression[] = room.points.map((v) => [
            v.y,
            v.x,
          ]);
          const polygon = L.polygon(pointCoordinates);
          const center = polygon.getBounds().getSouthWest();
          const text = L.divIcon({
            html: renderToString(RoomPopup({ room })),
            className: "",
          });

          return (
            <>
              <Polyline
                key={idx}
                positions={pointCoordinates}
                weight={1}
                dashArray={[1, 2]}
              >
                {visibleRoom?.name === room.name && (
                  <Marker position={center} icon={text} />
                )}
              </Polyline>
            </>
          );
        })}
      </>
    );
  }, [showHopeForest, showHopeport, visibleRoom]);

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
