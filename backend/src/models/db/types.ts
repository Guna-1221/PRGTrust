export type TrustEvent = {
  id: string;
  title: string;
  description: string;
  image?: string;
  location?: string;
  eventDate: string;
  startTime?: string;
  endTime?: string;
  endDate?: string;
  registrationLink?: string;
  contactInfo?: string;
  createdAt: string;
  updatedAt?: string;
};

export type GalleryImage = {
  id: string;
  title: string;
  description?: string;
  image: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type Member = {
  id: string;
  name: string;
  position: string;
  image?: string;
  biography?: string;
  qualification?: string;
  experience?: string;
  phone?: string;
  email?: string;
  isLeadership: number;
  isActive: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type SiteSetting = {
  key: string;
  value: string;
  updatedAt: string;
};

export type HomeBackground = {
  id: string;
  image: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type DonationPayment = {
  id: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  message?: string;
  paymentStatus: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type Donation = {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  createdAt?: string;
  updatedAt?: string;
};

export const DEFAULT_DONATION_SEEDS: Donation[] = [
  {
    id: "seed-1",
    title: "Food drive — Anantapur streets",
    description: "Volunteer handing food packet to an elderly man on the street.",
    image: "/assets/food-donation-1.jpg",
    date: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Meals for the visually impaired",
    description: "Volunteer offering food to an elderly visually impaired man.",
    image: "/assets/food-donation-2.jpg",
    date: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "Care for elderly women",
    description: "Volunteer handing a food packet to an elderly woman in a red saree.",
    image: "/assets/food-donation-3.jpg",
    date: new Date().toISOString(),
  },
];
