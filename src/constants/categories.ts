export const MAIN_CATEGORIES = [
  {
    title: "Politics",
    slug: "politics",
    description: "Political news and government updates",
  },
  {
    title: "Sports",
    slug: "sports",
    description: "Sports news and match results",
  },
  {
    title: "Technology",
    slug: "technology",
    description: "Technology, AI, and innovation news",
  },
  {
    title: "Business",
    slug: "business",
    description: "Business, economy, and finance news",
  },
  {
    title: "Entertainment",
    slug: "entertainment",
    description: "Entertainment, movies, and culture news",
  },
  {
    title: "Activities",
    slug: "activities",
    description: "Department activities, events, and field updates",
  },
  {
    title: "Services",
    slug: "services",
    description: "Service notices, guidance, and public service updates",
  },
  {
    title: "Announcements",
    slug: "announcements",
    description: "Official announcements and notices",
  },
] as const;

export const MAIN_CATEGORY_TITLES = new Set<string>(
  MAIN_CATEGORIES.map((category) => category.title)
);

export const MAIN_CATEGORY_SLUGS = new Set<string>(
  MAIN_CATEGORIES.map((category) => category.slug)
);

export const CATEGORY_ORDER = new Map<string, number>(
  MAIN_CATEGORIES.map((category, index) => [category.slug, index])
);

export const slugifyCategoryTitle = (title: string) =>
  title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
