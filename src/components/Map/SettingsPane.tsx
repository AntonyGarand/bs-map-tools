import { useSetAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { roomSettingsElementAtom } from "./atoms";

export default function SettingsPane() {
  const roomSettingsRef = useRef<HTMLDivElement>(null);
  const setNewRoomSettings = useSetAtom(roomSettingsElementAtom);
  useEffect(() => {
    if (roomSettingsRef.current === null) return;
    setNewRoomSettings(roomSettingsRef.current);
  }, [roomSettingsRef, setNewRoomSettings]);

  const [isRoomsVisible, setIsRoomsVisible] = useState(false);

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
        ></div>
      </div>
    </div>
  );
}