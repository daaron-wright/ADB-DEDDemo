export type CompetitorFilter = "relevant" | "highDemand";

export type CompetitorMetricId = "googleRating" | "socialBuzz" | "sentiment";

export interface CompetitorMetric {
  label: string;
  value: number;
  unit: string;
  description: string;
}

export interface CompetitorPoint {
  id: string;
  name: string;
  cuisine: string;
  location: string;
  x: number;
  y: number;
  baseSize: number;
  summary: string;
  metrics: Record<CompetitorMetricId, CompetitorMetric>;
  highlights: string[];
  attributes: CompetitorFilter[];
}

export const competitorMetricsMeta: Record<CompetitorMetricId, {
  label: string;
  accent: string;
  subtitle: string;
  legend: string;
  formatter?: (value: number) => string;
}> = {
  googleRating: {
    label: "Google rating",
    accent: "#0E766E",
    subtitle: "Latest average pulled from Google reviews in the last 90 days",
    legend: "Scale from 1 to 5 refreshed nightly",
    formatter: (value) => value.toFixed(1),
  },
  socialBuzz: {
    label: "Social buzz index",
    accent: "#8B5CF6",
    subtitle: "Composite index blending Instagram, TikTok, and TripAdvisor chatter",
    legend: "0-100 index derived from the Investor Compass social graph",
    formatter: (value) => `${Math.round(value)}`,
  },
  sentiment: {
    label: "Sentiment analysis",
    accent: "#F59E0B",
    subtitle: "Positive share of social sentiment across scraped platforms",
    legend: "Percentage of positive mentions over the last 4 weeks",
    formatter: (value) => `${Math.round(value)}%`,
  },
};

export const competitorMapPoints: CompetitorPoint[] = [
  {
    id: "shurfa-bay",
    name: "Shurfa Bay",
    cuisine: "Modern Emirati Seafood",
    location: "Al Bateen Marina",
    x: 42,
    y: 46,
    baseSize: 30,
    summary:
      "Beachfront fine dining with sunset views, sustained by marina tourism and concierge partnerships.",
    metrics: {
      googleRating: {
        label: "Google rating",
        value: 4.8,
        unit: "out of 5",
        description: "Averaged from 1,300+ Google reviews captured in the last quarter.",
      },
      socialBuzz: {
        label: "Social buzz index",
        value: 92,
        unit: "index",
        description: "Influencer reels and marina event coverage keep weekly chatter elevated.",
      },
      sentiment: {
        label: "Sentiment analysis",
        value: 82,
        unit: "% positive",
        description: "Investor Compass sentiment engine shows strong praise for premium service.",
      },
    },
    highlights: [
      "Average check AED 420 per guest",
      "Signature deck experiences sell out Thursday–Saturday",
      "Strong partnerships with marina events and regattas",
    ],
    attributes: ["relevant", "highDemand"],
  },
  {
    id: "palms-pearls",
    name: "Palms & Pearls",
    cuisine: "Boutique Asian Fusion",
    location: "Corniche Waterfront",
    x: 36,
    y: 54,
    baseSize: 26,
    summary:
      "Intimate tasting journeys with heavy social amplification around Corniche sunset dining.",
    metrics: {
      googleRating: {
        label: "Google rating",
        value: 4.7,
        unit: "out of 5",
        description: "Weighted Google rating factoring verified local guide reviews.",
      },
      socialBuzz: {
        label: "Social buzz index",
        value: 95,
        unit: "index",
        description: "Top-trending Corniche concept across TikTok UAE over the last quarter.",
      },
      sentiment: {
        label: "Sentiment analysis",
        value: 85,
        unit: "% positive",
        description: "High positive sentiment tied to storytelling-led tasting menus.",
      },
    },
    highlights: [
      "Four-week waitlist for sunset seating",
      "Collaborations with Louvre Abu Dhabi for seasonal menus",
      "Viral dessert activations attracting regional visitors",
    ],
    attributes: ["relevant", "highDemand"],
  },
  {
    id: "villa-toscana",
    name: "Villa Toscana",
    cuisine: "Italian Fine Dining",
    location: "The St. Regis Abu Dhabi",
    x: 45,
    y: 50,
    baseSize: 24,
    summary:
      "Flagship hotel dining room with elevated Italian classics and a loyal corporate mix.",
    metrics: {
      googleRating: {
        label: "Google rating",
        value: 4.6,
        unit: "out of 5",
        description: "Maintains Michelin-recognised scores across Google and OpenTable.",
      },
      socialBuzz: {
        label: "Social buzz index",
        value: 78,
        unit: "index",
        description: "Award coverage and chef features keep the brand visible but niche.",
      },
      sentiment: {
        label: "Sentiment analysis",
        value: 76,
        unit: "% positive",
        description: "Feedback highlights impeccable service though menu innovation is moderate.",
      },
    },
    highlights: [
      "Michelin-selected menu with rotating regional showcases",
      "Dedicated corporate tasting menus for ADGM executives",
      "High conversion on hotel cross-promotions",
    ],
    attributes: ["relevant"],
  },
  {
    id: "cove-beach",
    name: "Cove Beach",
    cuisine: "Beach Club Dining",
    location: "Makers District",
    x: 58,
    y: 38,
    baseSize: 22,
    summary:
      "Lifestyle beach club anchoring Saadiyat nightlife with a robust day-to-night programme.",
    metrics: {
      googleRating: {
        label: "Google rating",
        value: 4.5,
        unit: "out of 5",
        description: "Google reviews emphasise atmosphere and curated music line-up.",
      },
      socialBuzz: {
        label: "Social buzz index",
        value: 84,
        unit: "index",
        description: "Weekly DJ sets and influencer partnerships sustain buzz.",
      },
      sentiment: {
        label: "Sentiment analysis",
        value: 73,
        unit: "% positive",
        description: "Positive sentiment on vibe and entertainment, with pricing flagged occasionally.",
      },
    },
    highlights: [
      "Anchored by weekly beach festival line-up",
      "Strong cross-sell with Saadiyat resort partners",
      "High-margin beverage programmes fuel profitability",
    ],
    attributes: ["highDemand"],
  },
  {
    id: "louvre-terrace",
    name: "Louvre Terrace Dining",
    cuisine: "Modern Mediterranean",
    location: "Saadiyat Cultural District",
    x: 61,
    y: 44,
    baseSize: 20,
    summary:
      "Cultural destination dining connected to Louvre Abu Dhabi's evening programme.",
    metrics: {
      googleRating: {
        label: "Google rating",
        value: 4.9,
        unit: "out of 5",
        description: "Perfect scores tied to the immersive pairing of art and cuisine.",
      },
      socialBuzz: {
        label: "Social buzz index",
        value: 97,
        unit: "index",
        description: "Influencer walkthroughs and art-led events trend every quarter.",
      },
      sentiment: {
        label: "Sentiment analysis",
        value: 88,
        unit: "% positive",
        description: "Sentiment analytics show exceptional resonance with cultural tourists.",
      },
    },
    highlights: [
      "Immersive dining paired with curated art tours",
      "Partnership with Department of Culture & Tourism",
      "High conversion from tourist itineraries",
    ],
    attributes: ["relevant", "highDemand"],
  },
];
