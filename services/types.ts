export type Service = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  kind: "category" | "service";
};
export type Review = {
  _id: string;
  customer: string;
  rating: number;
  comment: string;
};
export type Creator = {
  application?: Record<string, string | number | boolean | string[]>;
  _id: string;
  businessName: string;
  ownerName: string;
  slug: string;
  profileImage: string;
  coverImage: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  city: string;
  state: string;
  description: string;
  services: string[];
  gallery: string[];
  packages: { name: string; price: number; description: string }[];
  availability: string[];
  rating: number;
  reviewCount: number;
  reviews?: Review[];
  featured: boolean;
  status: "Active" | "Inactive" | "Pending";
  socialLinks: { instagram: string; facebook: string; website: string };
};
export type CreatorResult = {
  items: Creator[];
  total: number;
  page: number;
  pages: number;
};
export type Content = {
  slides: { image: string; label: string }[];
  gallery: string[];
  stats: { creators: number; users: number; events: number; cities: number };
  reviews: Review[];
};
