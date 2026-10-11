import { useEffect, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, Image as ImageIcon, Disc3 } from "lucide-react";

export type AlbumRailItem = {
  key: string;
  image: string;
  title: string;
  description?: string;
};

type AlbumStyleRailProps = {
  items: AlbumRailItem[];
  onSelect: (image: string) => void;
};

const MAX_SIDE_COVERS = 3;

export function AlbumStyleRail({ items, onSelect }: AlbumStyleRailProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isRecordVisible, setIsRecordVisible] = useState(false);

  useEffect(() => {
    setSelectedIndex((current) => Math.min(current, Math.max(items.length - 1, 0)));
    setIsRecordVisible(false);
  }, [items.length]);

  if (items.length === 0) return null;

  const visibleItems = items
    .map((item, index) => ({ item, index, offset: index - selectedIndex }))
    .filter(({ offset }) => Math.abs(offset) <= MAX_SIDE_COVERS);
  const selectedItem = items[selectedIndex];

  const moveSelection = (direction: -1 | 1) => {
    setSelectedIndex((current) => {
      if (direction < 0) return current > 0 ? current - 1 : items.length - 1;
      return current < items.length - 1 ? current + 1 : 0;
    });
    setIsRecordVisible(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSelection(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSelection(1);
    }
    if (event.key === "Escape") setIsRecordVisible(false);
  };

  return (
    <div
      className="album-style-rail"
      role="region"
      aria-label="Community photo album rail"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={`album-rail-stage ${isRecordVisible ? "album-record-visible" : ""}`}>
        {visibleItems.map(({ item, index, offset }) => (
          <button
            key={item.key}
            type="button"
            className={`album-rail-sleeve ${offset === 0 ? "album-rail-sleeve-active" : ""}`}
            data-offset={offset}
            aria-label={
              offset === 0
                ? `${item.title}. Focused album cover. Activate to ${
                    isRecordVisible ? "view the image" : "reveal the record"
                  }.`
                : `Focus album cover: ${item.title}`
            }
            aria-current={offset === 0 ? "true" : undefined}
            onClick={() => {
              if (offset !== 0) {
                setSelectedIndex(index);
                setIsRecordVisible(false);
              } else if (isRecordVisible) {
                onSelect(item.image);
              } else {
                setIsRecordVisible(true);
              }
            }}
          >
            <span className="album-rail-disc" aria-hidden="true">
              <span className="album-rail-disc-label">
                <img src={item.image} alt="" loading="eager" decoding="async" />
              </span>
            </span>
            <span className="album-rail-cover">
              <img src={item.image} alt="" loading="eager" decoding="async" />
              <span className="album-rail-cover-shade" />
            </span>
          </button>
        ))}
      </div>

      <div className="album-rail-caption" aria-live="polite" aria-atomic="true">
        <h3>{selectedItem.title}</h3>
        {selectedItem.description && <p>{selectedItem.description}</p>}
      </div>

      <div className="album-rail-controls">
        <button
          type="button"
          className="album-rail-arrow"
          onClick={() => moveSelection(-1)}
          aria-label="Previous gallery image"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="album-rail-markers" aria-label={`${selectedIndex + 1} of ${items.length}`}>
          {items.map((item, index) => (
            <button
              key={item.key}
              type="button"
              className={`album-rail-marker ${
                selectedIndex === index ? "album-rail-marker-active" : ""
              }`}
              onClick={() => {
                setSelectedIndex(index);
                setIsRecordVisible(false);
              }}
              aria-label={`Show image ${index + 1}: ${item.title}`}
              aria-current={selectedIndex === index ? "true" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="album-rail-open"
          onClick={() =>
            isRecordVisible ? onSelect(selectedItem.image) : setIsRecordVisible(true)
          }
          aria-label={isRecordVisible ? "Open selected gallery image" : "Reveal selected record"}
        >
          {isRecordVisible ? <ImageIcon size={19} /> : <Disc3 size={20} />}
        </button>
        <button
          type="button"
          className="album-rail-arrow"
          onClick={() => moveSelection(1)}
          aria-label="Next gallery image"
        >
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
