import { useLocalStorage } from "@uidotdev/usehooks";
import { useAtomValue } from "jotai";
import L, { Point } from "leaflet";
import { Fragment, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Marker as LeafletMarker, useMap, useMapEvents } from "react-leaflet";
import { markerSettingsElementAtom, tileCoordinatesAtom } from "./atoms";

interface MapMarker {
  // Name of the object
  name: string;
  // Family of the object
  type: string;
  // Local url
  image: string;
  // Number of tiles
  width?: number;
  height?: number;
  x: number;
  y: number;
}

interface MarkerIcon {
  name: string;
  image: string;
  width?: number;
  height?: number;
}

const availableMarkers: MarkerIcon[] = [
  {
    name: "alchemist_obj 2x1",
    image: "alchemist_obj_1x2.png",
    width: 2,
    height: 1,
  },
  { name: "alchemist_obj", image: "alchemist_obj.png" },
  { name: "bank_alchemist", image: "bank_alchemist.png" },
  { name: "bank_chef", image: "bank_chef.png" },
  { name: "bank_fisher", image: "bank_fisher.png" },
  { name: "bank_guard", image: "bank_guard.png" },
  { name: "bank_other", image: "bank_other.png" },
  { name: "bank_stone", image: "bank_stone.png" },
  { name: "board", image: "board.png" },
  { name: "chatty_npc", image: "chatty_npc.png" },
  { name: "chef_obj 1x2", image: "chef_obj_2x1.png", width: 1, height: 2 },
  { name: "chef_obj", image: "chef_obj.png" },
  { name: "enchantress", image: "enchantress.png" },
  { name: "fish_circle", image: "fish_circle.png" },
  { name: "fish_square", image: "fish_square.png" },
  { name: "forager 2x1", image: "forager_1x2.png", width: 2, height: 1 },
  { name: "forager 2x2", image: "forager_2x2.png", width: 2, height: 2 },
  { name: "forager 1x3", image: "forager_3x1.png", width: 1, height: 3 },
  { name: "forager", image: "forager.png" },
  { name: "guard_foe", image: "guard_foe.png" },
  { name: "guard_foe_aggressive", image: "guard_foe_aggressive.png" },
  { name: "hairdresser", image: "hairdresser.png" },
  {
    name: "interactable 1x2",
    image: "interactable_2x1.png",
    width: 1,
    height: 2,
  },
  {
    name: "interactable 2x1",
    image: "interactable_1x2.png",
    width: 2,
    height: 1,
  },
  {
    name: "interactable 2x2",
    image: "interactable_2x2.png",
    width: 2,
    height: 2,
  },
  { name: "interactable", image: "interactable.png" },
  {
    name: "interactable_search 2x1",
    image: "interactable_search_1x2.png",
    width: 2,
    height: 1,
  },
  { name: "item", image: "item.png" },
  { name: "item_purple", image: "item_purple.png" },
  { name: "obelisk 5x1", image: "obelisk_1x5.png", width: 5, height: 1 },
  { name: "portal_stone", image: "portal_stone.png" },
  { name: "recipe_alchemist", image: "recipe_alchemist.png" },
  { name: "recipe_chef", image: "recipe_chef.png" },
  { name: "recipe_fisher", image: "recipe_fisher.png" },
  { name: "search 2x1", image: "search_1x2.png", width: 2, height: 1 },
  { name: "search", image: "search.png" },
  { name: "shop_alchemist", image: "shop_alchemist.png" },
  { name: "shop_chef", image: "shop_chef.png" },
  { name: "shop_fisher", image: "shop_fisher.png" },
  { name: "shop_forager", image: "shop_forager.png" },
  { name: "shop_other", image: "shop_other.png" },
  { name: "strange_stone", image: "strange_stone.png" },
];

function MarkerList({
  markers,
  onDelete,
}: {
  markers: MapMarker[];
  onDelete: (index: number) => void;
}) {
  return (
    <ul>
      {markers.map((marker, index) => (
        <li key={index}>
          {marker.name}
          <button onClick={() => onDelete(index)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

export default function Markers() {
  const [allMarkers, setMarkers] = useLocalStorage<MapMarker[]>("markers", []);
  const markerSettingContainer = useAtomValue(markerSettingsElementAtom);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerName, setNewMarkerName] = useState("");
  const [newMarkerPosition, setNewMarkerPosition] = useState<Point>();
  const [newMarkerIcon, setNewMarkerIcon] = useState<MarkerIcon>(
    availableMarkers.find((v) => v.name === "item")!
  );

  const tileCoordinates = useAtomValue(tileCoordinatesAtom);
  const map = useMap();

  useMapEvents({
    click() {
      if (isAddingMarker) {
        setNewMarkerPosition(tileCoordinates);
      }
    },
  });

  const handleDeleteMarker = (index: number) => {
    setMarkers(allMarkers.filter((_, i) => i !== index));
  };
  const handleCreateMarker = () => {
    setMarkers([
      ...allMarkers,
      {
        ...newMarkerIcon,
        type: "marker",
        name: newMarkerName,
        x: newMarkerPosition?.x || tileCoordinates.x,
        y: newMarkerPosition?.y || tileCoordinates.y,
      },
    ]);
  };

  const convertMarker = useCallback(
    (marker: MapMarker) => {
      const height = marker.height || 1;
      const width = marker.width || 1;
      // Always assume current position is bottom left
      const bottom = marker.y - height * 0.5 + 1;
      const left = marker.x + width * 0.5;
      return (
        <LeafletMarker
          position={[bottom, left]}
          title="Marker"
          icon={L.icon({
            iconUrl: "/icons/" + marker.image,
            iconSize: [
              width * (Math.pow(2, map.getZoom()) - 1),
              height * (Math.pow(2, map.getZoom()) - 1),
            ],
          })}
        />
      );
    },
    [map]
  );

  const leafletMarkers = useMemo(() => {
    return (
      <>
        {allMarkers.map((marker, idx) => (
          <Fragment key={idx}>{convertMarker(marker)}</Fragment>
        ))}
      </>
    );
  }, [allMarkers, convertMarker]);

  const currentMarker = useMemo(() => {
    if (!isAddingMarker) return;
    return convertMarker({
      image: newMarkerIcon.image,
      type: "marker",
      name: newMarkerName,
      x: newMarkerPosition?.x || tileCoordinates.x,
      y: newMarkerPosition?.y || tileCoordinates.y,
      height: newMarkerIcon.height,
      width: newMarkerIcon.width,
    });
  }, [
    isAddingMarker,
    newMarkerIcon,
    newMarkerPosition,
    tileCoordinates,
    newMarkerName,
    convertMarker,
  ]);

  return (
    <>
      {leafletMarkers}
      {currentMarker}

      {markerSettingContainer &&
        createPortal(
          <>
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(allMarkers));
                alert("Successfully copied markers to clipboard");
              }}
            >
              Export markers
            </button>
            <div>
              <button onClick={() => setIsAddingMarker(!isAddingMarker)}>
                Add Marker
              </button>
            </div>
            {isAddingMarker && (
              <div>
                <input
                  type="text"
                  value={newMarkerName}
                  onChange={(e) => setNewMarkerName(e.target.value)}
                  placeholder="Enter marker name"
                />
                <select
                  value={newMarkerIcon.name}
                  onChange={(e) =>
                    setNewMarkerIcon(
                      availableMarkers.find(
                        (icon) => icon.name === e.target.value
                      )!
                    )
                  }
                >
                  {availableMarkers.map((icon) => (
                    <option key={icon.name} value={icon.name}>
                      {icon.name}
                    </option>
                  ))}
                </select>
                <button onClick={() => handleCreateMarker()}>Save</button>
              </div>
            )}
            <MarkerList markers={allMarkers} onDelete={handleDeleteMarker} />
          </>,
          markerSettingContainer
        )}
    </>
  );
}
