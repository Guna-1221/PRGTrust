import { createFileRoute } from "@tanstack/react-router";
import { useGallery } from "@/hooks/use-gallery";
import { useDonations } from "@/hooks/use-donations";
import { combineImages } from "@/lib/combined-images";
import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, X, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — PRG Social Welfare Trust" },
      { name: "description", content: "Photo gallery of PRG Social Welfare Trust activities." },
      { property: "og:title", content: "Gallery — PRG Social Welfare Trust" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const gallery = useGallery();
  const donations = useDonations();
  const items = combineImages(gallery.items, donations.items);
  const isLoading = gallery.isLoading || donations.isLoading;
  const error = gallery.error || donations.error;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Keyboard navigation for lightbox
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedIndex === null) return;

      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") setSelectedIndex((i) => (i! > 0 ? i! - 1 : items.length - 1));
      if (e.key === "ArrowRight") setSelectedIndex((i) => (i! < items.length - 1 ? i! + 1 : 0));
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, items.length]);

  return (
    <>
      <section className="bg-brand-blue-deep text-white">
        <div className="container-x py-20 md:py-24">
          <div className="accent-bar" />
          <h1 className="mt-4 text-4xl md:text-5xl">Gallery</h1>
          <p className="mt-4 max-w-2xl text-white/85 text-lg">
            A glimpse into our initiatives and the impact we create together.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-brand-blue" size={48} />
            </div>
          ) : error ? (
            <div className="text-center py-20 text-destructive">Failed to load gallery images.</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-foreground/70">No gallery images available.</div>
          ) : (
            <div className="gallery-masonry">
              {items.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  className="gallery-masonry-card group"
                  onClick={() => setSelectedIndex(index)}
                  aria-label={`View ${item.title}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="gallery-masonry-image"
                  />
                  <span className="gallery-masonry-shade" aria-hidden="true" />
                  <span className="gallery-masonry-caption">
                    <span className="gallery-masonry-source">
                      {item.source === "donation" ? "Donation" : "Gallery"}
                    </span>
                    <span className="gallery-masonry-title">{item.title}</span>
                  </span>
                  <span className="gallery-masonry-arrow" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedIndex !== null && items[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/70 hover:text-white transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
            aria-label="Close"
          >
            <X size={32} />
          </button>

          <button
            className="absolute left-5 text-white/70 hover:text-white transition-colors p-2 hidden sm:block"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((i) => (i! > 0 ? i! - 1 : items.length - 1));
            }}
            aria-label="Previous"
          >
            <ChevronLeft size={48} />
          </button>

          <div
            className="relative max-h-[85vh] max-w-[90vw] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={items[selectedIndex].image}
              alt={items[selectedIndex].title}
              className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
            />
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-medium">{items[selectedIndex].title}</h3>
              {items[selectedIndex].description && (
                <p className="mt-2 text-white/70 text-sm max-w-2xl mx-auto">
                  {items[selectedIndex].description}
                </p>
              )}
            </div>
          </div>

          <button
            className="absolute right-5 text-white/70 hover:text-white transition-colors p-2 hidden sm:block"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex((i) => (i! < items.length - 1 ? i! + 1 : 0));
            }}
            aria-label="Next"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </>
  );
}
