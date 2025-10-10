export type CompetitorMetricId = "tourism" | "social" | "fnb";

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
}

export const competitorMetricsMeta: Record<CompetitorMetricId, {
  label: string;
  accent: string;
  subtitle: string;
  legend: string;
  formatter?: (value: number) => string;
}> = {
  tourism: {
    label: "Tourism pull",
    accent: "#F97316",
    subtitle: "Share of visitor demand captured by the venue",
    legend: "Indexed to neighbouring visitor nights",
    formatter: (value) => `${value}% share`,
  },
  social: {
    label: "Social buzz",
    accent: "#8B5CF6",
    subtitle: "Relative social media engagement over 30 days",
    legend: "Indexed to Abu Dhabi dining conversations",
    formatter: (value) => `${value} pts`,
  },
  fnb: {
    label: "F&B contribution",
    accent: "#0E766E",
    subtitle: "Estimated monthly gross value added",
    legend: "Calculated in AED millions",
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
      tourism: {
        label: "Visitor share",
        value: 34,
        unit: "%",
        description: "Captures one third of premium leisure visitors staying in Al Bateen hotels.",
      },
      social: {
        label: "Buzz index",
        value: 92,
        unit: "index",
        description: "Weekly viral reels and influencer coverage keep brand awareness elevated.",
      },
      fnb: {
        label: "GVA",
        value: 3.4,
        unit: "AEDm",
        description: "High average check drives strong monthly contribution to F&B gross value added.",
      },
    },
    highlights: [
      "Average check AED 420 per guest",
      "Signature deck experiences sell out Thursday–Saturday",
      "Strong partnerships with marina events and regattas",
    ],
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
      tourism: {
        label: "Visitor share",
        value: 27,
        unit: "%",
        description: "Drives stay extensions among 5-star Corniche hotels and holiday home guests.",
      },
      social: {
        label: "Buzz index",
        value: 97,
        unit: "index",
        description: "Top trending Corniche restaurant across TikTok UAE over the last quarter.",
      },
      fnb: {
        label: "GVA",
        value: 2.8,
        unit: "AEDm",
        description: "High table turn velocity with extended degustation experiences.",
      },
    },
    highlights: [
      "Four-week waitlist for sunset seating",
      "Collaborations with Louvre Abu Dhabi for seasonal menus",
      "Viral dessert activations attracting regional visitors",
    ],
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
      tourism: {
        label: "Visitor share",
        value: 22,
        unit: "%",
        description: "Captures in-house guests and premium business travellers in St. Regis cluster.",
      },
      social: {
        label: "Buzz index",
        value: 74,
        unit: "index",
        description: "Consistent social coverage anchored in award announcements and chef features.",
      },
      fnb: {
        label: "GVA",
        value: 3.1,
        unit: "AEDm",
        description: "Strong contribution via banquet packages and private dining suites.",
      },
    },
    highlights: [
      "Michelin-selected menu with rotating regional showcases",
      "Dedicated corporate tasting menus for ADGM executives",
      "High conversion on hotel cross-promotions",
    ],
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
      tourism: {
        label: "Visitor share",
        value: 31,
        unit: "%",
        description: "High draw amongst package tourists and day-trippers to Saadiyat cultural district.",
      },
      social: {
        label: "Buzz index",
        value: 89,
        unit: "index",
        description: "Weekly live DJ reels and influencer content drive steady reach.",
      },
      fnb: {
        label: "GVA",
        value: 2.4,
        unit: "AEDm",
        description: "Premium cabana packages increase basket size and beverage spend.",
      },
    },
    highlights: [
      "Anchored by weekly beach festival line-up",
      "Strong cross-sell with Saadiyat resort partners",
      "High-margin beverage programmes fuel profitability",
    ],
  },
];
