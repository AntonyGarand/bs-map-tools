import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { markerSettingsElementAtom, roomSettingsElementAtom } from "./atoms";

export default function SettingsPane() {
  const [isRoomsVisible, setIsRoomsVisible] = useState(false);
  const [isMarkersVisible, setIsMarkersVisible] = useState(false);

  const roomSettingsRef = useRef<HTMLDivElement>(null);
  const setNewRoomSettings = useSetAtom(roomSettingsElementAtom);
  useEffect(() => {
    if (roomSettingsRef.current === null) return;
    setNewRoomSettings(roomSettingsRef.current);
  }, [roomSettingsRef, setNewRoomSettings]);

  const markerSettingsRef = useRef<HTMLDivElement>(null);
  const setNewMarkerSettings = useSetAtom(markerSettingsElementAtom);
  useEffect(() => {
    if (markerSettingsRef.current === null) return;
    setNewMarkerSettings(markerSettingsRef.current);
  }, [markerSettingsRef, setNewMarkerSettings]);

  return (
    <div>
      <h1>Settings</h1>
      <div>
        <h2
          style={{ cursor: "pointer" }}
          onClick={() => setIsRoomsVisible(!isRoomsVisible)}
        >
          Rooms
        </h2>
        <div
          ref={roomSettingsRef}
          style={{ display: isRoomsVisible ? "block" : "none" }}
        />
      </div>
      <div>
        <h2
          style={{ cursor: "pointer" }}
          onClick={() => setIsMarkersVisible(!isMarkersVisible)}
        >
          Markers
        </h2>
        <div
          ref={markerSettingsRef}
          style={{ display: isMarkersVisible ? "block" : "none" }}
        />
      </div>
    </div>
  );
}
