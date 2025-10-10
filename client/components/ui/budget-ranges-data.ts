export type ConceptKey = "boutique" | "flagship";

export type BudgetBand = {
  area: string;
  totalRange: string;
  licensing: string;
  fitOut: string;
  staffing: string;
  marketing: string;
  timeframe: string;
  insight: string;
  desirabilityIndex: number;
};

export const conceptMeta: Record<
  ConceptKey,
  { label: string; description: string }
> = {
  boutique: {
    label: "Boutique concept",
    description: "1,800 – 2,400 sq ft, 70 – 90 covers",
  },
  flagship: {
    label: "Flagship dining",
    description: "3,200 – 4,800 sq ft, 120 – 160 covers",
  },
};

export const conceptBudgets: Record<ConceptKey, BudgetBand[]> = {
  boutique: [
    {
      area: "Corniche Waterfront",
      totalRange: "AED 950K – 1.35M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 420K – 560K",
      staffing: "AED 150K – 185K",
      marketing: "AED 65K – 90K",
      timeframe: "16 – 20 weeks",
      insight:
        "Scenic strip with premium leisure visitors seeking sunset dining.",
      desirabilityIndex: 88,
    },
    {
      area: "Al Maryah Island",
      totalRange: "AED 1.05M – 1.48M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 470K – 620K",
      staffing: "AED 165K – 210K",
      marketing: "AED 75K – 95K",
      timeframe: "18 – 22 weeks",
      insight:
        "Financial district lunch and executive dining with corporate events.",
      desirabilityIndex: 84,
    },
    {
      area: "Al Reem Island",
      totalRange: "AED 780K – 1.12M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 360K – 480K",
      staffing: "AED 130K – 170K",
      marketing: "AED 55K – 75K",
      timeframe: "14 – 18 weeks",
      insight:
        "High-density residential demand with strong evening family trade.",
      desirabilityIndex: 79,
    },
    {
      area: "Yas Island",
      totalRange: "AED 860K – 1.26M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 410K – 540K",
      staffing: "AED 140K – 180K",
      marketing: "AED 60K – 85K",
      timeframe: "18 – 22 weeks",
      insight: "Tourist-driven mix with race-day and concert spikes in demand.",
      desirabilityIndex: 82,
    },
    {
      area: "Saadiyat Island",
      totalRange: "AED 840K – 1.18M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 390K – 520K",
      staffing: "AED 135K – 170K",
      marketing: "AED 58K – 80K",
      timeframe: "16 – 20 weeks",
      insight: "Cultural district attracting art patrons and resort guests.",
      desirabilityIndex: 80,
    },
    {
      area: "Al Zahiyah",
      totalRange: "AED 820K – 1.14M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 360K – 500K",
      staffing: "AED 130K – 165K",
      marketing: "AED 52K – 78K",
      timeframe: "14 – 18 weeks",
      insight: "Nightlife corridor with hotel guest traffic and evening spend.",
      desirabilityIndex: 81,
    },
  ],
  flagship: [
    {
      area: "Corniche Waterfront",
      totalRange: "AED 1.65M – 2.25M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 720K – 930K",
      staffing: "AED 260K – 310K",
      marketing: "AED 110K – 150K",
      timeframe: "24 – 30 weeks",
      insight: "Iconic promenade suited to destination fine dining concepts.",
      desirabilityIndex: 92,
    },
    {
      area: "Al Maryah Island",
      totalRange: "AED 1.8M – 2.4M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 760K – 970K",
      staffing: "AED 280K – 340K",
      marketing: "AED 125K – 165K",
      timeframe: "26 – 32 weeks",
      insight:
        "Luxury hotels and business towers with weekday corporate spend.",
      desirabilityIndex: 90,
    },
    {
      area: "Saadiyat Island",
      totalRange: "AED 1.55M – 2.1M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 680K – 860K",
      staffing: "AED 240K – 300K",
      marketing: "AED 105K – 140K",
      timeframe: "22 – 28 weeks",
      insight: "Cultural district attracting art patrons and resort guests.",
      desirabilityIndex: 86,
    },
    {
      area: "Yas Island",
      totalRange: "AED 1.7M – 2.3M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 700K – 900K",
      staffing: "AED 250K – 320K",
      marketing: "AED 110K – 150K",
      timeframe: "24 – 30 weeks",
      insight:
        "Mega events and theme park traffic sustain premium visitor flow.",
      desirabilityIndex: 89,
    },
    {
      area: "Al Zahiyah",
      totalRange: "AED 1.45M – 1.98M",
      licensing: "AED 3,000 – 8,000",
      fitOut: "AED 640K – 820K",
      staffing: "AED 220K – 280K",
      marketing: "AED 95K – 135K",
      timeframe: "22 – 28 weeks",
      insight:
        "Hotel cluster nightlife with high check averages for premium dining.",
      desirabilityIndex: 87,
    },
  ],
};

export const budgetSummaryRows = conceptBudgets.boutique
  .map((band) => {
    const flagshipBand = conceptBudgets.flagship.find(
      (item) => item.area === band.area,
    );
    return {
      area: band.area,
      boutiqueRange: band.totalRange,
      flagshipRange: flagshipBand?.totalRange ?? "–",
    };
  })
  .concat(
    conceptBudgets.flagship
      .filter(
        (band) =>
          !conceptBudgets.boutique.some((item) => item.area === band.area),
      )
      .map((band) => ({
        area: band.area,
        boutiqueRange: "–",
        flagshipRange: band.totalRange,
      })),
  );
