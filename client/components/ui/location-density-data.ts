export type DensityLayerId = "residents" | "office" | "tourists";

export type HeatIntensity = "high" | "medium" | "low";

export interface HeatMapPoint {
  id: string;
  x: number;
  y: number;
  intensity: HeatIntensity;
  size: number;
}

export interface DensityPoint extends HeatMapPoint {
  title: string;
  density: string;
  insight: string;
}

export interface DensityLayer {
  id: DensityLayerId;
  label: string;
  subtitle: string;
  palette: Record<HeatIntensity, string>;
  legend: Array<{ label: string; threshold: string; swatch: string }>;
  points: DensityPoint[];
  dataSources: string[];
  summary: string;
}

export interface AreaProfileMetric {
  value: string;
  note: string;
  source: string;
}

export interface AreaProfile {
  area: string;
  rating: number;
  description: string;
  metrics: Record<DensityLayerId, AreaProfileMetric>;
}

export const densityLayers: DensityLayer[] = [
  {
    id: "residents",
    label: "Residents",
    subtitle:
      "Household density derived from Tawtheeq residential contracts and occupancy filings (Q1 2025).",
    palette: {
      high:
        "radial-gradient(50% 50% at 50% 50%, rgba(14,118,110,0.55) 0%, rgba(14,118,110,0) 100%)",
      medium:
        "radial-gradient(50% 50% at 50% 50%, rgba(45,196,154,0.48) 0%, rgba(45,196,154,0) 100%)",
      low:
        "radial-gradient(50% 50% at 50% 50%, rgba(148,231,204,0.42) 0%, rgba(148,231,204,0) 100%)",
    },
    legend: [
      {
        label: "High density",
        threshold: "> 5k households/km²",
        swatch: "linear-gradient(135deg, #0E766E, #1dd8a4)",
      },
      {
        label: "Medium density",
        threshold: "2k – 5k households/km²",
        swatch: "linear-gradient(135deg, #2DC49A, #6EE7B7)",
      },
      {
        label: "Emerging clusters",
        threshold: "< 2k households/km²",
        swatch: "linear-gradient(135deg, #94E7CC, #ECFDF5)",
      },
    ],
    points: [
      {
        id: "corniche-res",
        x: 38,
        y: 47,
        intensity: "high",
        size: 74,
        title: "Corniche waterfront towers",
        density: "6.5k residential households",
        insight:
          "High-rise residences sustain 92% occupancy, with Tawtheeq rental contracts feeding these totals.",
      },
      {
        id: "khalidiya-res",
        x: 24,
        y: 58,
        intensity: "medium",
        size: 56,
        title: "Khalidiya family district",
        density: "3.1k households",
        insight:
          "Mixed-use towers with large family apartments; long-term lease renewals remain stable.",
      },
      {
        id: "reems-res",
        x: 58,
        y: 36,
        intensity: "medium",
        size: 60,
        title: "Al Reem Island",
        density: "4.7k households",
        insight: "Fast-growing residential hub with sustained expatriate demand and new towers coming online.",
      },
      {
        id: "mbz-res",
        x: 72,
        y: 63,
        intensity: "low",
        size: 44,
        title: "MBZ City villas",
        density: "1.6k households",
        insight: "Lower-rise suburban villas with steady Emirati occupancy, suitable for destination dining.",
      },
    ],
    dataSources: [
      "Tawtheeq occupancy registry",
      "Municipal build-to-rent permits",
    ],
    summary: "Identify neighbourhoods with resident-led, everyday demand baselines.",
  },
  {
    id: "office",
    label: "Office workers",
    subtitle:
      "Employment clusters reconciled from Tawtheeq commercial leases, DED licences, and labour filings (2024).",
    palette: {
      high:
        "radial-gradient(50% 50% at 50% 50%, rgba(37,99,235,0.55) 0%, rgba(37,99,235,0) 100%)",
      medium:
        "radial-gradient(50% 50% at 50% 50%, rgba(96,165,250,0.48) 0%, rgba(96,165,250,0) 100%)",
      low:
        "radial-gradient(50% 50% at 50% 50%, rgba(191,219,254,0.42) 0%, rgba(191,219,254,0) 100%)",
    },
    legend: [
      {
        label: "High daytime load",
        threshold: "> 12k workers",
        swatch: "linear-gradient(135deg, #2563EB, #60A5FA)",
      },
      {
        label: "Balanced mix",
        threshold: "6k – 12k workers",
        swatch: "linear-gradient(135deg, #60A5FA, #93C5FD)",
      },
      {
        label: "Support offices",
        threshold: "< 6k workers",
        swatch: "linear-gradient(135deg, #BFDBFE, #EFF6FF)",
      },
    ],
    points: [
      {
        id: "maryah-office",
        x: 49,
        y: 42,
        intensity: "high",
        size: 72,
        title: "Al Maryah financial cluster",
        density: "14.2k office workers",
        insight:
          "ADGM towers, Galleria, and Cleveland Clinic daytime population drive premium lunch demand.",
      },
      {
        id: "capital-gate-office",
        x: 64,
        y: 30,
        intensity: "medium",
        size: 58,
        title: "Capital Centre & ADNEC",
        density: "8.9k workers",
        insight:
          "Convention-focused corridor with strong weekday peaks and event surges tied to exhibitions.",
      },
      {
        id: "airport-office",
        x: 80,
        y: 56,
        intensity: "low",
        size: 46,
        title: "Airport free zone",
        density: "5.1k staff",
        insight: "Logistics and aviation tenants create early-morning and late-shift demand windows.",
      },
    ],
    dataSources: [
      "Tawtheeq commercial lease records",
      "DED licence renewals",
      "Abu Dhabi employment statistics",
    ],
    summary: "Highlight weekday peaks driven by corporate and government campuses.",
  },
  {
    id: "tourists",
    label: "Tourists",
    subtitle:
      "Short-stay visitor density reconciled from Holiday Homes permits, hotel inventory, and DCT tourism statistics (FY 2024).",
    palette: {
      high:
        "radial-gradient(50% 50% at 50% 50%, rgba(236,72,153,0.55) 0%, rgba(236,72,153,0) 100%)",
      medium:
        "radial-gradient(50% 50% at 50% 50%, rgba(249,115,22,0.5) 0%, rgba(249,115,22,0) 100%)",
      low:
        "radial-gradient(50% 50% at 50% 50%, rgba(251,191,36,0.45) 0%, rgba(251,191,36,0) 100%)",
    },
    legend: [
      {
        label: "Peak visitor nights",
        threshold: "> 8k beds occupied",
        swatch: "linear-gradient(135deg, #EC4899, #F97316)",
      },
      {
        label: "Stable visitor flow",
        threshold: "3k – 8k beds",
        swatch: "linear-gradient(135deg, #F97316, #FBBF24)",
      },
      {
        label: "Emerging stay zones",
        threshold: "< 3k beds",
        swatch: "linear-gradient(135deg, #FBBF24, #FEF3C7)",
      },
    ],
    points: [
      {
        id: "yas-tourism",
        x: 62,
        y: 24,
        intensity: "high",
        size: 78,
        title: "Yas Island leisure core",
        density: "9.3k nightly visitors",
        insight:
          "Theme parks, hotels, and holiday homes sustain high weekend and event-driven spikes.",
      },
      {
        id: "corniche-tourism",
        x: 34,
        y: 50,
        intensity: "medium",
        size: 60,
        title: "Corniche resorts",
        density: "5.7k nightly visitors",
        insight: "Beachfront hotels with consistent winter occupancy and family holiday homes.",
      },
      {
        id: "saadiyat-tourism",
        x: 48,
        y: 32,
        intensity: "medium",
        size: 56,
        title: "Saadiyat cultural district",
        density: "4.1k nightly visitors",
        insight:
          "Museum and resort stays yield premium spend profiles with longer average lengths of stay.",
      },
      {
        id: "city-centre-tourism",
        x: 28,
        y: 66,
        intensity: "low",
        size: 44,
        title: "City centre boutique stays",
        density: "2.4k nightly visitors",
        insight: "Holiday-home conversions supply flexible inventory serving short corporate visits.",
      },
    ],
    dataSources: [
      "Holiday Homes permits",
      "Department of Culture & Tourism hotel statistics",
      "Airport arrivals trend reports",
    ],
    summary: "Surface zones influenced by short-stay visitor spend and seasonal peaks.",
  },
];

export const areaProfiles: AreaProfile[] = [
  {
    area: "Corniche",
    rating: 8.4,
    description:
      "Scenic promenade attracting residents, office workers, and beach visitors with steady year-round activity.",
    metrics: {
      residents: {
        value: "6.5k residential households",
        note: "Clustered towers (Zones C1–C4) with >92% renewal rates, tallied from Tawtheeq rental contracts.",
        source: "Tawtheeq occupancy registry, Q1 2025",
      },
      office: {
        value: "11.8k daily workers",
        note: "Government complexes and consultancy offices within a 10-minute walk.",
        source: "DED licences + employment statistics, 2024",
      },
      tourists: {
        value: "5.7k nightly visitors",
        note: "Beachfront resorts averaging 78% occupancy across winter peak.",
        source: "DCT hotel performance report, FY 2024",
      },
    },
  },
  {
    area: "Al Maryah Island",
    rating: 8.1,
    description:
      "Financial district anchored by ADGM, premium hotels, and Cleveland Clinic creating lunch and evening demand.",
    metrics: {
      residents: {
        value: "2.2k residential households",
        note: "High-income apartments in The Galleria residences with rapid lease absorption, sourced via Tawtheeq contracts.",
        source: "Tawtheeq occupancy registry, Q1 2025",
      },
      office: {
        value: "14.2k office workers",
        note: "Corporate HQ concentration across ADGM towers and adjacent campuses.",
        source: "Tawtheeq commercial leases & DED licence renewals, 2024",
      },
      tourists: {
        value: "3.6k nightly visitors",
        note: "Four and five-star hotels with medical tourism extensions.",
        source: "DCT tourism statistics, FY 2024",
      },
    },
  },
  {
    area: "Yas Island",
    rating: 8.7,
    description:
      "Entertainment-led destination with significant tourist inflow and growing residential catchment.",
    metrics: {
      residents: {
        value: "3.4k residential households",
        note: "New mid-rise communities in Yas Gateway expanding permanent base, counted from Tawtheeq rental filings.",
        source: "Tawtheeq occupancy registry, Q1 2025",
      },
      office: {
        value: "4.9k workers",
        note: "Theme-park operations and support offices concentrated around Yas South.",
        source: "Employment statistics, 2024",
      },
      tourists: {
        value: "9.3k nightly visitors",
        note: "Theme parks and hotels driving weekend and event surges (F1, concerts).",
        source: "Holiday Homes + DCT hotel statistics, FY 2024",
      },
    },
  },
];
