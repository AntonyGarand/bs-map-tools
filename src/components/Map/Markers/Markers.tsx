import { useLocalStorage } from "@uidotdev/usehooks";
import { useAtomValue } from "jotai";
import L, { Point } from "leaflet";
import { Fragment, useCallback, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Marker as LeafletMarker, useMap, useMapEvents } from "react-leaflet";
import { markerSettingsElementAtom, tileCoordinatesAtom } from "../atoms";

import hopeportMarkers from "./hopeport.json";

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
  { name: "Alchemist obj", image: "alchemist_obj.png", width: 1, height: 1 },
  {
    name: "Alchemist obj 2x1",
    image: "alchemist_obj_2x1.png",
    width: 2,
    height: 1,
  },
  { name: "Bank alchemist", image: "bank_alchemist.png", width: 1, height: 1 },
  { name: "Bank bone 2x1", image: "bank_bone_2x1.png", width: 2, height: 1 },
  { name: "Bank chef", image: "bank_chef.png", width: 1, height: 1 },
  { name: "Bank fisher", image: "bank_fisher.png", width: 1, height: 1 },
  { name: "Bank guard", image: "bank_guard.png", width: 1, height: 1 },
  { name: "Bank lumber", image: "bank_lumber.png", width: 1, height: 1 },
  { name: "Bank other", image: "bank_other.png", width: 1, height: 1 },
  { name: "Bank stone 2x1", image: "bank_stone_2x1.png", width: 2, height: 1 },
  {
    name: "Bank timber 2x1",
    image: "bank_timber_2x1.png",
    width: 2,
    height: 1,
  },
  { name: "Board", image: "board.png", width: 1, height: 1 },
  { name: "Carpenter obj", image: "carpenter_obj.png", width: 1, height: 1 },
  {
    name: "Carpenter obj 2x1",
    image: "carpenter_obj_2x1.png",
    width: 2,
    height: 1,
  },
  {
    name: "Carpenter obj 2x2",
    image: "carpenter_obj_2x2.png",
    width: 2,
    height: 2,
  },
  {
    name: "Carpenter obj 5x1",
    image: "carpenter_obj_5x1.png",
    width: 5,
    height: 1,
  },
  { name: "Chef obj", image: "chef_obj.png", width: 1, height: 1 },
  { name: "Chef obj 1x2", image: "chef_obj_1x2.png", width: 1, height: 2 },
  { name: "Dyes", image: "dyes.png", width: 1, height: 1 },
  { name: "Enchantress", image: "enchantress.png", width: 1, height: 1 },
  { name: "Fish circle", image: "fish_circle.png", width: 1, height: 1 },
  { name: "Fish square", image: "fish_square.png", width: 1, height: 1 },
  { name: "Forager", image: "forager.png", width: 1, height: 1 },
  { name: "Forager 1x3", image: "forager_1x3.png", width: 1, height: 4 },
  { name: "Forager 2x1", image: "forager_2x1.png", width: 2, height: 1 },
  { name: "Forager 2x2", image: "forager_2x2.png", width: 2, height: 2 },
  { name: "Gatherer", image: "gatherer.png", width: 1, height: 1 },
  { name: "Gatherer 1x3", image: "gatherer_1x3.png", width: 1, height: 3 },
  { name: "Gatherer 2x2", image: "gatherer_2x2.png", width: 2, height: 2 },
  { name: "Guard foe", image: "guard_foe.png", width: 1, height: 1 },
  {
    name: "Guard foe_aggressive",
    image: "guard_foe_aggressive.png",
    width: 1,
    height: 1,
  },
  { name: "Hairdresser", image: "hairdresser.png", width: 1, height: 1 },
  { name: "Interactable", image: "interactable.png", width: 1, height: 1 },
  {
    name: "Interactable 1x2",
    image: "interactable_1x2.png",
    width: 1,
    height: 2,
  },
  {
    name: "Interactable 1x3",
    image: "interactable_1x3.png",
    width: 1,
    height: 3,
  },
  {
    name: "Interactable 2x1",
    image: "interactable_2x1.png",
    width: 2,
    height: 1,
  },
  {
    name: "Interactable 2x2",
    image: "interactable_2x2.png",
    width: 2,
    height: 2,
  },
  {
    name: "Interactable 3x1",
    image: "interactable_3x1.png",
    width: 3,
    height: 1,
  },
  {
    name: "Interactable 3x3",
    image: "interactable_3x3.png",
    width: 3,
    height: 3,
  },
  {
    name: "Interactable 3x4",
    image: "interactable_3x4.png",
    width: 3,
    height: 4,
  },
  {
    name: "Interactable gray",
    image: "interactable_gray.png",
    width: 1,
    height: 1,
  },
  {
    name: "Interactable search 1x2",
    image: "interactable_search_1x2.png",
    width: 1,
    height: 2,
  },
  { name: "Item", image: "item.png", width: 1, height: 1 },
  { name: "Item purple", image: "item_purple.png", width: 1, height: 1 },
  { name: "Npc brown", image: "npc_brown.png", width: 1, height: 1 },
  { name: "Npc gray", image: "npc_gray.png", width: 1, height: 1 },
  { name: "Npc green", image: "npc_green.png", width: 1, height: 1 },
  { name: "Npc purple", image: "npc_purple.png", width: 1, height: 1 },
  { name: "Obelisk 5x1", image: "obelisk_5x1.png", width: 5, height: 1 },
  { name: "Portal stone", image: "portal_stone.png", width: 1, height: 1 },
  {
    name: "Recipe alchemist",
    image: "recipe_alchemist.png",
    width: 1,
    height: 1,
  },
  { name: "Recipe brown", image: "recipe_brown.png", width: 1, height: 1 },
  { name: "Recipe fisher", image: "recipe_fisher.png", width: 1, height: 1 },
  { name: "Scout foe", image: "scout_foe.png", width: 1, height: 1 },
  { name: "Scout foe 2x2", image: "scout_foe_2x2.png", width: 2, height: 2 },
  {
    name: "Scout foe aggressive",
    image: "scout_foe_aggressive.png",
    width: 1,
    height: 1,
  },
  { name: "Search", image: "search.png", width: 1, height: 1 },
  { name: "Search 2x1", image: "search_2x1.png", width: 2, height: 1 },
  { name: "Shop alchemist", image: "shop_alchemist.png", width: 1, height: 1 },
  { name: "Shop brown", image: "shop_brown.png", width: 1, height: 1 },
  { name: "Shop fisher", image: "shop_fisher.png", width: 1, height: 1 },
  { name: "Shop gray", image: "shop_gray.png", width: 1, height: 1 },
  { name: "Shop green", image: "shop_green.png", width: 1, height: 1 },
  { name: "Shop yellow", image: "shop_yellow.png", width: 1, height: 1 },
  { name: "Strange stone", image: "strange_stone.png", width: 1, height: 1 },
  { name: "Woodcutter", image: "woodcutter.png", width: 1, height: 1 },
  { name: "Woodcutter 1x3", image: "woodcutter_1x3.png", width: 1, height: 3 },
  { name: "Woodcutter 3x1", image: "woodcutter_3x1.png", width: 3, height: 1 },
];

function MarkerList({
  markers,
  onDelete,
}: {
  markers: MapMarker[];
  onDelete: (index: number) => void;
}) {
  return (
    <div style={{ maxHeight: "15vh", overflow: "auto" }}>
      <ul>
        {markers.map((marker, index) => (
          <li key={index}>
            {marker.name}
            <button onClick={() => onDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Markers() {
  const [allMarkers, setMarkers] = useLocalStorage<MapMarker[]>("markers", []);
  const markerSettingContainer = useAtomValue(markerSettingsElementAtom);
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [newMarkerName, setNewMarkerName] = useState("");
  const [newMarkerPosition, setNewMarkerPosition] = useState<Point>();
  const [newMarkerIcon, setNewMarkerIcon] = useState<MarkerIcon>(
    availableMarkers.find((v) => v.name === "Item")!
  );

  const [showHopeportMarkers, setShowHopeportMarkers] = useState(true);

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
        {showHopeportMarkers &&
          hopeportMarkers.map((marker, idx) => (
            <Fragment key={idx}>{convertMarker(marker)}</Fragment>
          ))}
      </>
    );
  }, [allMarkers, showHopeportMarkers, convertMarker]);

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
            <label>
              <input
                type="checkbox"
                checked={showHopeportMarkers}
                onChange={() => setShowHopeportMarkers(!showHopeportMarkers)}
              />
              Show Hopeport Markers
            </label>
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
