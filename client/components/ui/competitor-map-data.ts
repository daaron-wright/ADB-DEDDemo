export type CompetitorFilter = "relevant" | "highDemand";

export type CompetitorMetricId = "rating" | "socialMentions" | "fnbGross";

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
  rating: {
    label: "Ratings",
    accent: "#0E766E",
    subtitle: "Average guest ratings aggregated across major platforms",
    legend: "Scaled from 1 to 5 based on diner reviews",
    formatter: (value) => `${value.toFixed(1)}/5`,
  },
  socialMentions: {
    label: "Social media mentions (90d)",
    accent: "#8B5CF6",
    subtitle: "Conversation volume sourced from the Investor Compass social graph",
    legend: "Rolling 90-day mention count across key platforms",
    formatter: (value) => value.toLocaleString(),
  },
  fnbGross: {
    label: "F&B gross output",
    accent: "#F97316",
    subtitle: "Estimated monthly gross value added in AED millions",
    legend: "Modeled using Omnis demand indices for the district",
    formatter: (value) => `AED ${value.toFixed(1)}M`,
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
      "Beachfront fine dining with sunset views, high tourist footfall from marina visitors and luxury hotel stays.",
    metrics: {
      rating: {
        label: "Guest rating",
        value: 4.8,
        unit: "score",
        description: "Consistently ranked in the top percentile across OpenTable and Google Reviews.",
      },
      socialMentions: {
        label: "Social buzz",
        value: 1870,
        unit: "mentions",
        description: "Weekly viral reels and influencer coverage keep brand awareness elevated.",
      },
      fnbGross: {
        label: "Monthly GVA",
        value: 3.6,
        unit: "AEDm",
        description: "High average check and premium cabana packages drive strong monthly contribution.",
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
      "Intimate dining concept with experiential tasting menus, highly referenced across social platforms.",
    metrics: {
      rating: {
        label: "Guest rating",
        value: 4.7,
        unit: "score",
        description: "Diners cite storytelling-led tasting menus and attentive service.",
      },
      socialMentions: {
        label: "Social buzz",
        value: 2140,
        unit: "mentions",
        description: "Top trending Corniche restaurant across TikTok UAE over the last quarter.",
      },
      fnbGross: {
        label: "Monthly GVA",
        value: 2.9,
        unit: "AEDm",
        description: "High table turn velocity with extended degustation experiences.",
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
      "Flagship hotel dining room with elevated Italian classics, strong corporate and tourist mix.",
    metrics: {
      rating: {
        label: "Guest rating",
        value: 4.6,
        unit: "score",
        description: "Awarded Michelin recognition with exceptional service consistency.",
      },
      socialMentions: {
        label: "Social buzz",
        value: 960,
        unit: "mentions",
        description: "Consistent social coverage anchored in award announcements and chef features.",
      },
      fnbGross: {
        label: "Monthly GVA",
        value: 3.2,
        unit: "AEDm",
        description: "Corporate tasting menus and banquet packages boost revenue mix.",
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
      "Lifestyle beach club anchoring Saadiyat nightlife with strong music calendar and day-to-night service.",
    metrics: {
      rating: {
        label: "Guest rating",
        value: 4.5,
        unit: "score",
        description: "Guests praise the all-day experience and curated live entertainment.",
      },
      socialMentions: {
        label: "Social buzz",
        value: 1680,
        unit: "mentions",
        description: "Weekly live DJ reels and influencer content drive steady reach.",
      },
      fnbGross: {
        label: "Monthly GVA",
        value: 2.5,
        unit: "AEDm",
        description: "Premium cabana packages increase basket size and beverage spend.",
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
      "Cultural destination dining connected to the Louvre Abu Dhabi evening programme.",
    metrics: {
      rating: {
        label: "Guest rating",
        value: 4.9,
        unit: "score",
        description: "Top-rated for curated tasting menus aligned with art exhibitions.",
      },
      socialMentions: {
        label: "Social buzz",
        value: 2340,
        unit: "mentions",
        description: "Influencer walkthroughs and art-led dining events trend every quarter.",
      },
      fnbGross: {
        label: "Monthly GVA",
        value: 2.7,
        unit: "AEDm",
        description: "Limited seating drives premium pricing and sold-out residencies.",
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
