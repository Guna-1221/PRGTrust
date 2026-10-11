import type { Donation } from "@/hooks/use-donations";
import type { GalleryImage } from "@/hooks/use-gallery";

export type CombinedImage = {
  key: string;
  source: "donation" | "gallery";
  sourceId: string;
  title: string;
  description?: string;
  image: string;
  date: string;
  displayOrder?: number;
};

export function combineImages(
  galleryImages: GalleryImage[],
  donations: Donation[],
): CombinedImage[] {
  return [
    ...galleryImages.map((item) => ({
      key: `gallery:${item.id}`,
      source: "gallery" as const,
      sourceId: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
      date: item.createdAt,
      displayOrder: item.displayOrder,
    })),
    ...donations.map((item) => ({
      key: `donation:${item.id}`,
      source: "donation" as const,
      sourceId: item.id,
      title: item.title,
      description: item.description,
      image: item.image,
      date: item.date,
    })),
  ].sort((a, b) => {
    const dateDifference = new Date(b.date).getTime() - new Date(a.date).getTime();
    return Number.isNaN(dateDifference) ? 0 : dateDifference;
  });
}
