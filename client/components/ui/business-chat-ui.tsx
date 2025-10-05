import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import Draggable from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { chatCardClass } from "@/lib/chat-style";
import { Badge } from "@/components/ui/badge";
import {
  CuisinePopularityChart,
  CompetitorAnalysisChart,
  DemographicsCard,
  VisitorTasteTrendsChart,
} from "@/components/ui/data-visualizations";
import { JourneyBreadcrumb } from "@/components/ui/journey-breadcrumb";
import { AIBusinessOrb } from "@/components/ui/ai-business-orb";
import { UAEPassLogin } from "@/components/ui/uae-pass-login";
import LocationHeatMap from "@/components/ui/location-heat-map";
import HeatMapView from "@/components/ui/heat-map-view";
import BudgetRanges from "@/components/ui/budget-ranges";
import BudgetRangesView from "@/components/ui/budget-ranges-view";
import GapAnalysisView from "@/components/ui/gap-analysis-view";
import RetailLocationsView from "@/components/ui/retail-locations-view";
import ComprehensiveReport from "@/components/ui/comprehensive-report";
import { ApplicationProgressCard } from "@/components/ui/application-progress-card";
import {
  BusinessActivitiesChatCard,
  ChatActivityOption,
  PhysicalSpacePlan,
} from "@/components/ui/business-activities-chat-card";
import { JourneyStageFocusView, type JourneyStageFocusViewProps } from "@/components/portal/JourneyStageFocusView";
import { budgetSummaryRows } from "@/components/ui/budget-ranges-data";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useToast } from "@/hooks/use-toast";
import { Map as MapIcon } from "lucide-react";
import { ENTREPRENEUR_PROFILE } from "@/lib/profile";

type ConversationAction =
  | "show-summary"
  | "open-investor-journey"
  | "confirm-retail-automation"
  | "decline-retail-automation";

interface MessageAction {
  id: string;
  label: string;
  action: ConversationAction;
}

type BusinessMessageType =
  | "text"
  | "heat-map"
  | "property-cards"
  | "setup-cta"
  | "dialogue-doc"
  | "cuisine-analysis"
  | "competitor-analysis"
  | "demographics"
  | "location-analysis"
  | "budget-ranges"
  | "comprehensive-report"
  | "business-activities"
  | "application-progress";

interface BusinessMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  rating?: number;
  hasActions?: boolean;
  type?: BusinessMessageType;
  actions?: MessageAction[];
  docId?: string;
  docTitle?: string;
  imageUrl?: string;
  stepId?: ConversationStep;
}

interface DialogueDocHighlight {
  id: string;
  text: string;
  completed: boolean;
}

interface DialogueDocState {
  notes: string;
  highlights: DialogueDocHighlight[];
}

interface DialogueDocProps {
  title: string;
  summary: string;
  notes: string;
  highlights: DialogueDocHighlight[];
  onNotesChange: (value: string) => void;
  onToggleHighlight: (id: string) => void;
  onHighlightChange: (id: string, value: string) => void;
  onHighlightRemove: (id: string) => void;
  onAddHighlight: (value: string) => void;
}

const createInitialDialogueDocState = (): DialogueDocState => ({
  notes:
    "Capture next steps, decisions, and follow-ups here.\n• Define target district and audience\n• Outline licensing documents\n�� Track stakeholder approvals",
  highlights: [
    {
      id: "dialogue-highlight-1",
      text: "Clarify the preferred launch district and customer segment",
      completed: false,
    },
    {
      id: "dialogue-highlight-2",
      text: "List documents needed before licensing submission",
      completed: false,
    },
    {
      id: "dialogue-highlight-3",
      text: "Identify strategic partners to support setup and growth",
      completed: false,
    },
  ],
});

interface BusinessChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  title?: string;
  initialMessage?: string;
  onMinimize?: () => void;
  mode?: "modal" | "side-panel";
  journeyFocusView?: JourneyStageFocusViewProps | null;
  suppressChatInterface?: boolean;
}

type ChatView = "basic" | "investor-journey" | "discover-experience";
type ModalView =
  | "chat"
  | "heat-map"
  | "budget-ranges"
  | "gap-analysis"
  | "retail-locations";

interface ChatThread {
  id: string;
  title: string;
  messages: BusinessMessage[];
  view: ChatView;
}

const MODAL_MIN_DIMENSIONS: React.CSSProperties = {
  minWidth: "min(100%, 800px)",
  minHeight: 556,
};

const ACKNOWLEDGEMENT_MESSAGE =
  "Acknowledged. Opening BUSINESS LICENSE PORTAL Layla's workspace now.";

// Preloaded prompts for different business categories
const PRELOADED_PROMPTS = {
  restaurants: [
    "I want to understand the competitor landscape for restaurants in Abu Dhabi. Can you provide detailed analysis?",
    "What are the most popular cuisines in Abu Dhabi and what gaps exist in the market?",
    "Can you analyze the footfall and customer behavior patterns in the Corniche area?",
    "What are the licensing requirements and estimated timeline for opening a restaurant?",
  ],
  "fast-food": [
    "What's the market demand for fast-food chains in Abu Dhabi compared to traditional restaurants?",
    "Can you analyze the best locations for a quick-service restaurant?",
    "What are the delivery and drive-thru market opportunities in Abu Dhabi?",
    "How do licensing requirements differ for fast-food vs. full-service restaurants?",
  ],
  branch: [
    "What are the requirements for opening a branch office of an existing company?",
    "Can you explain the dual-license structure and compliance requirements?",
    "What are the zoning regulations for commercial branch offices in Abu Dhabi?",
    "How does the approval process differ for foreign companies vs. local businesses?",
  ],
  "retail-store": [
    "What are the prime retail locations in Abu Dhabi and their rental costs?",
    "Can you analyze foot traffic patterns for different retail districts?",
    "What are the fit-out standards and merchandising requirements for retail stores?",
    "How long does the licensing process typically take for retail establishments?",
  ],
  general: [
    "I'd like to explore business opportunities in Abu Dhabi. Where should I start?",
    "Can you help me understand the overall business climate and regulations in Abu Dhabi?",
    "What are the most promising sectors for new business investment right now?",
    "How does the government support entrepreneurship and business setup?",
  ],
};

type ConversationStep = "intro" | "summary" | "handoff";

const CONVERSATION_BLUEPRINT: Record<
  ConversationStep,
  {
    message: string;
    actions?: ReadonlyArray<{ label: string; action: ConversationAction }>;
  }
> = {
  intro: {
    message:
      "Welcome to the Abu Dhabi business assistant. I'll keep this focused so you know exactly what to do next. Ready for the snapshot that matters most?",
    actions: [{ label: "Show market highlights", action: "show-summary" }],
  },
  summary: {
    message:
      "Here is the market signal summary you need to decide fast:\n• Corniche waterfront is running at 96% footfall intensity with premium dining demand.\n• Emirati fusion and coastal casual concepts are the fastest growing cuisine segments.\n• Licensing turnaround averages 14 days once documents are pre-validated.\nWhen you're ready, I'll take you straight into the investor journey workspace.",
    actions: [
      { label: "Open my investor journey", action: "open-investor-journey" },
    ],
  },
  handoff: {
    message:
      "Loading your investor journey dashboard now. You'll land on the tailored checklist with milestones, documents, and submission guidance.",
  },
};

const CONVERSATION_STEPS: Array<{ id: ConversationStep; label: string }> = [
  { id: "intro", label: "Start" },
  { id: "summary", label: "Market Summary" },
  { id: "handoff", label: "Investor Workspace" },
];

const HEAT_MAP_THUMBNAIL_URL =
  "https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386";

const ARTIFACT_ACTION_BUTTON_CLASSES =
  "inline-flex items-center gap-2 rounded-full border border-[#0E766E]/45 bg-white/80 px-4 py-2 text-sm font-semibold text-[#0A4A46] shadow-sm transition hover:bg-white hover:text-[#073F3B]";

interface PropertyOpportunity {
  id: string;
  title: string;
  price: string;
  currency: string;
  rating: number;
  image: string;
}

const PROPERTY_OPPORTUNITIES: PropertyOpportunity[] = [
  {
    id: "corniche-retail",
    title: "Retail Opportunity | Abu Dhabi Corniche | Ready Nov 2025",
    price: "640,000 / year",
    currency: "AED",
    rating: 4.9,
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/321de87c306c0308a02c60a25803d7fd29f66f22?width=600",
  },
  {
    id: "canal-view",
    title: "Retail Opportunity | Canal View | Ready to Move",
    price: "580,000 / year",
    currency: "AED",
    rating: 4.7,
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/90b42e755964109a96d26e28153d3260c27dab3c?width=600",
  },
  {
    id: "corniche-beach",
    title: "Retail Space | Corniche Beach, Abu Dhabi",
    price: "495,000 / year",
    currency: "AED",
    rating: 4.3,
    image:
      "https://api.builder.io/api/v1/image/assets/TEMP/a9f0bf6d758ce0797379785bd5ae18dfc4113f43?width=600",
  },
];

const COLLABORATOR_LOGOS = [
  {
    id: "property-finder",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/9bfd38d325da645cc4c8e1a2aef3b5d4c8eae662?width=242",
    alt: "Property Finder logo",
  },
  {
    id: "bayut",
    src: "https://api.builder.io/api/v1/image/assets/TEMP/09683a0d837e39637290f853f491ffdcb14d48c7?width=242",
    alt: "Bayut logo",
  },
];

const MAX_LICENSE_ACTIVITIES = 10;

const BASE_ACTIVITY_LIBRARY: ChatActivityOption[] = [
  {
    id: "full-service-restaurant",
    label: "Full-service restaurant",
    description:
      "Table service dining with full kitchen operations and a bar programme.",
    group: "restaurant",
    isRecommended: true,
    spatial: {
      minArea: 3600,
      seatingCapacity: 120,
      kitchenArea: 950,
      ventilation: "Type-1 hood, UV filtration, make-up air",
      utilities: ["3-phase power", "Grease trap", "Black water line"],
      notes: [
        "Allocate 180 sq ft combined dry and cold storage to meet food safety requirements.",
        "Provide a 1.2m minimum corridor for staff circulation and fire egress compliance.",
      ],
    },
  },
  {
    id: "charcoal-coal-bbq-services",
    label: "Charcoal/coal BBQ services",
    description:
      "Live-fire grilling with dedicated preparation and exhaust handling.",
    group: "restaurant",
    isRecommended: true,
    spatial: {
      minArea: 1800,
      seatingCapacity: 60,
      kitchenArea: 520,
      ventilation: "High-temperature hood with spark arrestor",
      utilities: ["Charcoal filtration", "Make-up air", "Fire suppression"],
      notes: [
        "Install dual-stage filtration to control smoke and particulate output.",
        "Separate marination zone with washable surfaces for HACCP controls.",
      ],
    },
  },
  {
    id: "hospitality-and-catering-services",
    label: "Hospitality and catering services",
    description:
      "Off-site catering production and event support for hospitality venues.",
    group: "restaurant",
    isRecommended: true,
    spatial: {
      minArea: 2400,
      seatingCapacity: 80,
      kitchenArea: 780,
      ventilation: "Type-2 hood for bulk preparation lines",
      utilities: [
        "Blast chiller connection",
        "Service elevators",
        "3-phase power",
      ],
      notes: [
        "Provide loading dock access with insulated holding area for dispatch.",
        "Dedicated warewashing bay with grease interceptor and backflow prevention.",
      ],
    },
  },
  {
    id: "pastry-and-dessert-production",
    label: "Pastry and dessert production",
    description:
      "Specialised dessert and bakery production supporting dine-in service.",
    group: "restaurant",
    spatial: {
      minArea: 1400,
      seatingCapacity: 36,
      kitchenArea: 360,
      ventilation: "Confectionery hood with humidity control",
      utilities: ["Temperature-controlled storage", "3-phase power"],
      notes: [
        "Maintain 18°C cold room for pastry ingredients and finished goods.",
        "Install food-grade flooring with coved skirting for easy wash-down.",
      ],
    },
  },
  {
    id: "culinary-training-workshops",
    label: "Culinary training workshops",
    description:
      "Interactive chef-led sessions for guests and staff upskilling.",
    group: "restaurant",
    spatial: {
      minArea: 1600,
      seatingCapacity: 28,
      kitchenArea: 420,
      ventilation: "Type-1 hood with acoustic dampening",
      utilities: ["Demonstration cooking line", "Audio-visual cabling"],
      notes: [
        "Provide dual-purpose stations with induction tops and chilled undercounters.",
        "Integrate spectator seating with clear sightlines and fire-rated finishes.",
      ],
    },
  },
];

const PropertyOpportunityCard = ({
  opportunity,
}: {
  opportunity: PropertyOpportunity;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className={chatCardClass(
      "overflow-hidden border border-white/35 bg-white/20 backdrop-blur-xl shadow-[0_30px_80px_-60px_rgba(15,23,42,0.45)]",
      "rounded-3xl",
    )}
  >
    <div className="relative">
      <img
        src={opportunity.image}
        alt={opportunity.title}
        className="h-44 w-full object-cover"
      />
      <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-white">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M7.99965 1L5.72465 5.61L0.639648 6.345L4.31965 9.935L3.44965 15L7.99965 12.61L12.5496 15L11.6796 9.935L15.3596 6.35L10.2746 5.61L7.99965 1Z"
            fill="#FFE100"
          />
        </svg>
        <span className="text-sm font-medium opacity-90">
          {opportunity.rating.toFixed(1)}
        </span>
      </div>
    </div>
    <div className="space-y-4 p-5">
      <p className="text-base font-medium leading-snug text-white">
        {opportunity.title}
      </p>
      <div className="flex items-center gap-2 text-white">
        <svg width="20" height="18" viewBox="0 0 20 18" fill="none">
          <path
            d="M19.8428 8.49013L19.9994 8.63411V8.19651C19.9994 7.23289 19.3081 6.44838 18.459 6.44838H17.1013C16.1513 2.58029 12.915 0.5 8.10057 0.5C5.0348 0.5 4.64099 0.5 1.73762 0.5C1.73762 0.5 2.60933 1.21591 2.60933 3.47022V6.45065H1.00394C0.691915 6.45065 0.399026 6.33275 0.156594 6.10998L0 5.96601V6.4036C0 7.36779 0.691335 8.15173 1.54042 8.15173H2.60991V9.85167H1.00452C0.692495 9.85167 0.399606 9.73434 0.157174 9.511L0.000579979 9.36703V9.80406C0.000579979 10.7677 0.691915 11.551 1.541 11.551H2.61049V14.6624C2.61049 16.8532 1.73878 17.5 1.73878 17.5H8.10173C13.0675 17.5 16.2006 15.405 17.1134 11.5493H18.9961C19.3081 11.5493 19.601 11.6667 19.8434 11.8894L20 12.0334V11.5964C20 10.6328 19.3087 9.84884 18.4596 9.84884H17.3634C17.382 9.57222 17.3918 9.28937 17.3918 8.99858C17.3918 8.7078 17.3814 8.42551 17.3623 8.14889H18.9961C19.3075 8.14889 19.601 8.26623 19.8434 8.48956L19.8428 8.49013ZM5.21691 1.35082H7.8767C11.4552 1.35082 13.528 2.89999 14.1463 6.44895L5.21691 6.45009V1.35082ZM7.89932 16.6509H5.21633V11.5505L14.1405 11.5493C13.5622 14.761 11.7005 16.559 7.89932 16.6509ZM14.3446 9.00028C14.3446 9.29107 14.3382 9.57449 14.3249 9.84997L5.21691 9.85111V8.15116L14.3255 8.15003C14.3382 8.42438 14.3446 8.70723 14.3446 9.00028Z"
            fill="white"
          />
        </svg>
        <span className="text-lg font-semibold">{opportunity.price}</span>
      </div>
    </div>
  </motion.div>
);

const PropertyCollaborators = () => (
  <div
    className={chatCardClass(
      "mt-5 flex flex-col gap-3 border border-white/25 bg-white/20 px-4 py-3 text-white backdrop-blur-xl",
      "rounded-3xl",
    )}
  >
    <span className="text-sm font-medium uppercase tracking-[0.14em] text-white/80">
      In collaboration with
    </span>
    <div className="flex flex-wrap items-center gap-5">
      {COLLABORATOR_LOGOS.map((logo) => (
        <img
          key={logo.id}
          src={logo.src}
          alt={logo.alt}
          className="h-8 w-auto opacity-80"
        />
      ))}
    </div>
  </div>
);

// Cuisine Popularity Card Component
const CuisinePopularityCard = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={chatCardClass(
        "w-full max-w-lg bg-white border border-slate-200/50 shadow-lg overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Cuisine Popularity Analysis
            </h3>
            <p className="text-sm text-slate-600">Market share breakdown</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Statistic */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">35%</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 17 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#10b981" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            Middle Eastern cuisine market share
          </p>
        </div>

        {/* Cuisine Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Middle Eastern</div>
              <div className="text-sm text-slate-600">
                Cultural resonance, traditional appeal
              </div>
            </div>
            <div className="text-xl font-bold text-emerald-600">35%</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">American</div>
              <div className="text-sm text-slate-600">
                Fast-food dominance, brand recognition
              </div>
            </div>
            <div className="text-xl font-bold text-blue-600">25%</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Indian</div>
              <div className="text-sm text-slate-600">
                Expat community support, spice alignment
              </div>
            </div>
            <div className="text-xl font-bold text-orange-600">20%</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={cn(
            ARTIFACT_ACTION_BUTTON_CLASSES,
            "mt-6 w-full justify-center",
          )}
        >
          View detailed analysis
        </button>
      </div>
    </div>
  );
};

// Competitor Analysis Card Component
const CompetitorAnalysisCard = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={chatCardClass(
        "w-full max-w-lg bg-white border border-slate-200/50 shadow-lg overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <path d="M18 20V10" />
              <path d="M12 20V4" />
              <path d="M6 20v-6" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Competitor Analysis
            </h3>
            <p className="text-sm text-slate-600">Market leaders overview</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Statistic */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">4.6</span>
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
          </div>
          <p className="text-sm text-slate-600">Average competitor rating</p>
        </div>

        {/* Competitor Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Shurfa Bay</div>
              <div className="text-sm text-slate-600">
                Waterfront premium seafood experience
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">4.8★</div>
              <div className="text-xs text-slate-500">$$$$</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Villa Toscana</div>
              <div className="text-sm text-slate-600">
                Luxury hotel-based Italian dining
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">4.7★</div>
              <div className="text-xs text-slate-500">$$$$</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Palms & Pearls</div>
              <div className="text-sm text-slate-600">
                Modern Middle Eastern on Corniche
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">4.3★</div>
              <div className="text-xs text-slate-500">$$$</div>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-2">Key Insights</h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">3</div>
              <div className="text-xs text-slate-600">Market gaps</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">4.5★</div>
              <div className="text-xs text-slate-600">Avg rating</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">$$$$</div>
              <div className="text-xs text-slate-600">Price range</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={cn(
            ARTIFACT_ACTION_BUTTON_CLASSES,
            "mt-6 w-full justify-center",
          )}
        >
          View detailed analysis
        </button>
      </div>
    </div>
  );
};

// Gap Analysis Card Component
const GapAnalysisCard = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={chatCardClass(
        "w-full max-w-lg bg-white border border-slate-200/50 shadow-lg overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Gap Analysis
            </h3>
            <p className="text-sm text-slate-600">
              Market opportunities identified
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Statistic */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">6.3%</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 17 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#10b981" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            Footfall growth potential in Corniche area
          </p>
        </div>

        {/* Gap Opportunities */}
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="font-semibold text-slate-900 mb-2">
              Emirati Fusion Cuisine
            </div>
            <div className="text-sm text-slate-600 mb-2">
              Japanese influences creating new trend
            </div>
            <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full inline-block">
              High Opportunity
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="font-semibold text-slate-900 mb-2">
              Formal Evening Dining
            </div>
            <div className="text-sm text-slate-600 mb-2">
              Waterfront locations with luxury experience
            </div>
            <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">
              Medium Opportunity
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="font-semibold text-slate-900 mb-2">
              Family-Friendly Dining
            </div>
            <div className="text-sm text-slate-600 mb-2">
              Gap in affordable luxury segment
            </div>
            <div className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full inline-block">
              Emerging
            </div>
          </div>
        </div>

        {/* Area Demographics */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-3">
            Abu Dhabi Corniche Demographics
          </h4>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-bold text-emerald-600">85-90%</div>
              <div className="text-xs text-slate-600">Expats in area</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">2.5x</div>
              <div className="text-xs text-slate-600">Eat out weekly</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">78%</div>
              <div className="text-xs text-slate-600">Who dine out</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          className={cn(
            ARTIFACT_ACTION_BUTTON_CLASSES,
            "mt-6 w-full justify-center",
          )}
        >
          View detailed opportunities
        </button>
      </div>
    </div>
  );
};

// Preloaded Prompt Selector Component
const PreloadedPrompts = ({
  category,
  onPromptSelect,
}: {
  category: string;
  onPromptSelect: (prompt: string) => void;
}) => {
  const prompts =
    PRELOADED_PROMPTS[category as keyof typeof PRELOADED_PROMPTS] ||
    PRELOADED_PROMPTS.general;

  return (
    <div className="space-y-3">
      <h4 className="mb-3 text-sm font-medium text-slate-600">
        Suggested questions to get you started:
      </h4>
      <div className="grid gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            className="text-left p-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-700 transition-all hover:border-[#0E766E]/70 hover:bg-[#0E766E]/10 hover:text-slate-900"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

// Cuisine Popularity Breakout Modal
const CuisinePopularityBreakout = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[1194px] max-h-[90vh] overflow-hidden"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div className="relative w-full h-[834px] bg-black shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_4px_4px_0_rgba(0,0,0,0.25)]">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />

          {/* Background Image */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/3b6e0140bf72d8214b7baf7dc727cc0c1eb894d4?width=2390"
            alt="Abu Dhabi Skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-10 py-5 h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
            <div className="flex items-center gap-4">
              {/* Tamm Logo */}
              <svg
                width="111"
                height="50"
                viewBox="0 0 111 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z"
                  fill="white"
                />
                <path
                  d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
                  fill="white"
                />
                <path
                  d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z"
                  fill="white"
                />
                <path
                  d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z"
                  fill="white"
                />
                <path
                  d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z"
                  fill="white"
                />
                <path
                  d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
                  fill="white"
                />
                <path
                  d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z"
                  fill="white"
                />
                <path
                  d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z"
                  fill="white"
                />
                <path
                  d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z"
                  fill="white"
                />
                <path
                  d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="text-white text-center text-base font-medium leading-[130%] flex-1">
              Cuisine Popularity Analysis
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="relative z-10 h-full">
            {/* Left Side Content */}
            <div className="absolute left-20 top-40">
              <div className="text-white text-lg font-medium mb-2">
                Market Share Analysis
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[52px] font-semibold leading-none">
                  35%
                </span>
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 17 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z"
                    fill="#0E766E"
                  />
                </svg>
              </div>
              <div className="text-white text-lg font-semibold leading-[140%] max-w-[346px]">
                Middle Eastern cuisine dominates Abu Dhabi's culinary landscape,
                followed by American fast-food chains and authentic Indian
                restaurants. Local preferences drive strong cultural and
                traditional dining experiences.
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-[81px] top-[146px] w-[381px] h-[501px]">
              <div
                className={chatCardClass(
                  "w-full h-full bg-white/14 backdrop-blur-md",
                )}
              >
                {/* AI Business Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <AIBusinessOrb className="h-16 w-16" />
                    <div>
                      <div className="text-white text-lg font-semibold">
                        AI Business
                      </div>
                      <div className="flex items-center gap-1">
                        {[
                          5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499,
                          16.898, 4.534,
                        ].map((width, index) => (
                          <div
                            key={index}
                            className="bg-[#0E766E] rounded-full transform rotate-90"
                            style={{
                              width: "3.297px",
                              height: `${width}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cuisine Analysis Content */}
                <div className="px-9 pb-8">
                  <div className="text-white text-base font-normal uppercase tracking-wide mb-2">
                    CUISINE ANALYSIS
                  </div>
                  <div className="text-white text-2xl font-semibold mb-6">
                    Popular Cuisines
                  </div>
                  <div className="text-white text-lg leading-[140%] space-y-4">
                    <div>
                      <span className="font-semibold">
                        Middle Eastern (35%):
                      </span>
                      <br />
                      Cultural resonance, traditional appeal
                    </div>
                    <div>
                      <span className="font-semibold">American (25%):</span>
                      <br />
                      Fast-food dominance, brand recognition
                    </div>
                    <div>
                      <span className="font-semibold">Indian (20%):</span>
                      <br />
                      Expat community support, spice alignment
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Insights Bar */}
            <div className="absolute bottom-[81px] left-[81px] w-[1033px] h-[124px]">
              <div
                className={chatCardClass(
                  "w-full h-full bg-white/14 backdrop-blur-md",
                )}
              >
                <div className="p-6">
                  <div className="text-white text-lg mb-2">INSIGHTS</div>
                  <div className="text-white text-2xl font-semibold mb-4">
                    Abu Dhabi Cuisine Trends
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-white text-lg mb-1">
                        Fusion cuisine growth
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        15%
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">
                        Health-conscious demand
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        +8%
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">
                        Premium casual dining
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        Gap
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Competitor Analysis Breakout Modal
const CompetitorAnalysisBreakout = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[1194px] max-h-[90vh] overflow-hidden"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div className="relative w-full h-[834px] bg-black shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_4px_4px_0_rgba(0,0,0,0.25)]">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />

          {/* Background Image */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/3b6e0140bf72d8214b7baf7dc727cc0c1eb894d4?width=2390"
            alt="Abu Dhabi Skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-10 py-5 h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
            <div className="flex items-center gap-4">
              {/* Tamm Logo */}
              <svg
                width="111"
                height="50"
                viewBox="0 0 111 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z"
                  fill="white"
                />
                <path
                  d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
                  fill="white"
                />
                <path
                  d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z"
                  fill="white"
                />
                <path
                  d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z"
                  fill="white"
                />
                <path
                  d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z"
                  fill="white"
                />
                <path
                  d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
                  fill="white"
                />
                <path
                  d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z"
                  fill="white"
                />
                <path
                  d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z"
                  fill="white"
                />
                <path
                  d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z"
                  fill="white"
                />
                <path
                  d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="text-white text-center text-base font-medium leading-[130%] flex-1">
              Competitor Analysis
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="relative z-10 h-full">
            {/* Left Side Content */}
            <div className="absolute left-20 top-40">
              <div className="text-white text-lg font-medium mb-2">
                Market Leaders
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[52px] font-semibold leading-none">
                  4.6
                </span>
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 17 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z"
                    fill="#0E766E"
                  />
                </svg>
              </div>
              <div className="text-white text-lg font-semibold leading-[140%] max-w-[346px]">
                Top competitors maintain premium positioning through exceptional
                locations, authentic cuisine, and superior service delivery.
                Market gaps exist in affordable luxury and family-friendly fine
                dining.
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-[81px] top-[146px] w-[381px] h-[501px]">
              <div
                className={chatCardClass(
                  "w-full h-full bg-white/14 backdrop-blur-md",
                )}
              >
                {/* AI Business Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <AIBusinessOrb className="h-16 w-16" />
                    <div>
                      <div className="text-white text-lg font-semibold">
                        AI Business
                      </div>
                      <div className="flex items-center gap-1">
                        {[
                          5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499,
                          16.898, 4.534,
                        ].map((width, index) => (
                          <div
                            key={index}
                            className="bg-[#0E766E] rounded-full transform rotate-90"
                            style={{
                              width: "3.297px",
                              height: `${width}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Competitor Analysis Content */}
                <div className="px-9 pb-8">
                  <div className="text-white text-base font-normal uppercase tracking-wide mb-2">
                    COMPETITOR ANALYSIS
                  </div>
                  <div className="text-white text-2xl font-semibold mb-6">
                    Market Leaders
                  </div>
                  <div className="text-white text-lg leading-[140%] space-y-4">
                    <div>
                      <span className="font-semibold">Shurfa Bay:</span>
                      <br />
                      Waterfront premium seafood experience
                    </div>
                    <div>
                      <span className="font-semibold">Villa Toscana:</span>
                      <br />
                      Luxury hotel-based Italian dining
                    </div>
                    <div>
                      <span className="font-semibold">Palms & Pearls:</span>
                      <br />
                      Modern Middle Eastern on Corniche
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Insights Bar */}
            <div className="absolute bottom-[81px] left-[81px] w-[1033px] h-[124px]">
              <div
                className={chatCardClass(
                  "w-full h-full bg-white/14 backdrop-blur-md",
                )}
              >
                <div className="p-6">
                  <div className="text-white text-lg mb-2">INSIGHTS</div>
                  <div className="text-white text-2xl font-semibold mb-4">
                    Competitive Landscape
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-white text-lg mb-1">
                        Average rating
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        4.5★
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">
                        Market gaps identified
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        3
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">
                        Premium positioning
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        $$$$
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Gap Analysis Breakout Modal - Matching Figma Design
const GapAnalysisBreakout = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[1194px] max-h-[90vh] overflow-hidden"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div className="relative w-full h-[834px] bg-black shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_4px_4px_0_rgba(0,0,0,0.25)]">
          {/* Background Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30" />

          {/* Background Image */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/3b6e0140bf72d8214b7baf7dc727cc0c1eb894d4?width=2390"
            alt="Abu Dhabi Skyline"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-10 py-5 h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
            <div className="flex items-center gap-4">
              {/* Tamm Logo */}
              <svg
                width="111"
                height="50"
                viewBox="0 0 111 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z"
                  fill="white"
                />
                <path
                  d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
                  fill="white"
                />
                <path
                  d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z"
                  fill="white"
                />
                <path
                  d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z"
                  fill="white"
                />
                <path
                  d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z"
                  fill="white"
                />
                <path
                  d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
                  fill="white"
                />
                <path
                  d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z"
                  fill="white"
                />
                <path
                  d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z"
                  fill="white"
                />
                <path
                  d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z"
                  fill="white"
                />
                <path
                  d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
                  fill="white"
                />
              </svg>
            </div>

            <div className="text-white text-center text-base font-medium leading-[130%] flex-1">
              Investor Journey for a Restaurant
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Top Banner */}
          <div className="absolute top-[-112px] left-[541px] w-[605px] h-[103px] z-20">
            <div
              className={chatCardClass(
                "w-full h-full bg-gradient-to-b from-white to-[#F2F1EE] shadow-[0_0_10px_10px_rgba(0,0,0,0.07)]",
              )}
            >
              <div className="flex items-center gap-5 h-full px-5">
                <div className="flex-1">
                  <div className="text-[#282B3E] font-semibold text-sm mb-1">
                    Analysis Complete
                  </div>
                  <div className="text-[#282B3E] text-sm leading-[19px]">
                    Comprehensive gap analysis and market opportunities
                    identified for Abu Dhabi restaurant sector.
                  </div>
                </div>
                <div className="w-[138px] h-10 rounded-full bg-gradient-to-b from-[#5B6DDE] to-[#273489] flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    View details
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 h-full">
            {/* Left Side Content */}
            <div className="absolute left-20 top-40">
              <div className="text-white text-lg font-medium mb-2">
                Footfall insights
              </div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[52px] font-semibold leading-none">
                  6.3%
                </span>
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 17 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z"
                    fill="#0E766E"
                  />
                </svg>
              </div>
              <div className="text-white text-lg font-semibold leading-[140%] max-w-[346px]">
                The Abu Dhabi Corniche presents a dynamic and lucrative
                environment for F&B businesses, driven by a mix of residents,
                tourists, and a strong culture of dining out. Here is an
                overview of the key insights for the F&B sector in this area:
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-[81px] top-[146px] w-[381px] h-[501px]">
              <div
                className={chatCardClass(
                  "w-full h-full bg-white/14 backdrop-blur-md",
                )}
              >
                {/* AI Business Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <AIBusinessOrb className="h-16 w-16" />
                    <div>
                      <div className="text-white text-lg font-semibold">
                        AI Business
                      </div>
                      <div className="flex items-center gap-1">
                        {[
                          5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499,
                          16.898, 4.534,
                        ].map((width, index) => (
                          <div
                            key={index}
                            className="bg-[#0E766E] rounded-full transform rotate-90"
                            style={{
                              width: "3.297px",
                              height: `${width}px`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gap Analysis Content */}
                <div className="px-9 pb-8">
                  <div className="text-white text-base font-normal uppercase tracking-wide mb-2">
                    GAP ANALYSIS
                  </div>
                  <div className="text-white text-2xl font-semibold mb-6">
                    Abu Dhabi Corniche
                  </div>
                  <div className="text-white text-lg leading-[140%]">
                    <span className="font-semibold">
                      Insights for this area:
                    </span>
                    <br />
                    Emirati Fusion Cuisine Japanese influences new trend
                    <br />
                    <br />
                    Demand for a formal evening dining experience. Waterfront
                    locations
                    <br />
                    High rise luxury experience popular.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Insights Bar */}
            <div className="absolute bottom-[81px] left-[81px] w-[1033px] h-[124px]">
              <div
                className={chatCardClass(
                  "w-full h-full bg-white/14 backdrop-blur-md",
                )}
              >
                <div className="p-6">
                  <div className="text-white text-lg mb-2">INSIGHTS</div>
                  <div className="text-white text-2xl font-semibold mb-4">
                    Abu Dhabi Corniche
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-white text-lg mb-1">
                        Expats in area
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        85-90%
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">
                        Eat out weekly
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        2.5x
                      </div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">
                        % who dine out
                      </div>
                      <div className="text-white text-[52px] font-semibold leading-none">
                        78%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Chat icon component with animation based on Figma design
const ChatIcon = ({
  isAnimated = false,
  isDark = false,
}: {
  isAnimated?: boolean;
  isDark?: boolean;
}) => {
  const bars = [
    { width: "5.77px", height: "3.297px" },
    { width: "11.952px", height: "3.297px" },
    { width: "19.783px", height: "3.297px" },
    { width: "13.189px", height: "3.297px" },
    { width: "8.655px", height: "3.297px" },
    { width: "23.081px", height: "3.297px" },
    { width: "30.499px", height: "3.297px" },
    { width: "16.898px", height: "3.297px" },
    { width: "4.534px", height: "3.297px" },
  ];

  const color = isDark ? "#0E766E" : "#FFF";

  return (
    <div className="inline-flex justify-center items-center gap-0.5 w-12 h-8">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={`transform rotate-90 rounded-full transition-all duration-300 ${
            isAnimated ? "animate-pulse" : ""
          }`}
          style={{
            width: bar.height,
            height: bar.width,
            background: color,
            animationDelay: isAnimated ? `${index * 0.1}s` : undefined,
          }}
        />
      ))}
    </div>
  );
};

const TammLogo = ({
  className = "",
  color = "currentColor",
}: {
  className?: string;
  color?: string;
}) => (
  <svg
    className={className}
    width="111"
    height="50"
    viewBox="0 0 111 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z"
      fill={color}
    />
    <path
      d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
      fill={color}
    />
    <path
      d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z"
      fill={color}
    />
    <path
      d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z"
      fill={color}
    />
    <path
      d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z"
      fill={color}
    />
    <path
      d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
      fill={color}
    />
    <path
      d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z"
      fill={color}
    />
    <path
      d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z"
      fill={color}
    />
    <path
      d="M29.3916 31.1085C27.5925 32.4376 26.4036 33.1099 25.2616 33.1099C22.8211 33.1099 20.8968 31.0616 20.8968 31.0616L20.2085 33.7197C21.6634 34.8455 23.4155 35.4866 25.2616 35.5804C26.7478 35.5804 28.2027 34.9237 30.1582 33.5946L29.5011 30.999L29.3916 31.1085Z"
      fill={color}
    />
    <path
      d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
      fill={color}
    />
  </svg>
);

const SoundVisualization = () => {
  const bars = [
    { height: "4px" },
    { height: "8px" },
    { height: "16px" },
    { height: "10px" },
    { height: "6px" },
    { height: "18px" },
    { height: "24px" },
    { height: "14px" },
    { height: "3px" },
  ];

  return (
    <div className="flex items-center justify-center gap-0.5">
      {bars.map((bar, index) => (
        <div
          key={index}
          className="w-0.5 bg-[#0E766E] rounded-full transition-all duration-300"
          style={{ height: bar.height }}
        />
      ))}
    </div>
  );
};

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-1 mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill={star <= rating ? "#FFD700" : "none"}
          stroke={star <= rating ? "#FFD700" : "#666"}
          strokeWidth="1"
        >
          <polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6" />
        </svg>
      ))}
    </div>
  );
};

const AccessibleHeatMap = () => {
  const heatPoints = [
    {
      id: 1,
      x: 25,
      y: 35,
      intensity: "high",
      label: "Marina Royal Complex",
      businesses: 15,
    },
    {
      id: 2,
      x: 45,
      y: 45,
      intensity: "medium",
      label: "Al Khalidiya District",
      businesses: 8,
    },
    {
      id: 3,
      x: 65,
      y: 25,
      intensity: "high",
      label: "Corniche Area",
      businesses: 22,
    },
    {
      id: 4,
      x: 75,
      y: 55,
      intensity: "medium",
      label: "Al Bateen",
      businesses: 12,
    },
    {
      id: 5,
      x: 35,
      y: 65,
      intensity: "low",
      label: "Downtown District",
      businesses: 5,
    },
  ];

  return (
    <div className="mt-4 mb-2">
      {/* Heat map container */}
      <div
        className="relative w-full max-w-sm bg-white rounded-2xl p-3 shadow-lg border border-white/20"
        role="img"
        aria-label="Heat map showing restaurant density across Abu Dhabi districts"
      >
        {/* Base map image */}
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386"
          alt="Abu Dhabi district map"
          className="w-full h-auto rounded-xl"
        />

        {/* Heat points overlay */}
        <div className="absolute inset-3">
          {heatPoints.map((point) => (
            <div
              key={point.id}
              className="absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
              style={{
                left: `${point.x}%`,
                top: `${point.y}%`,
                width:
                  point.intensity === "high"
                    ? "64px"
                    : point.intensity === "medium"
                      ? "48px"
                      : "32px",
                height:
                  point.intensity === "high"
                    ? "64px"
                    : point.intensity === "medium"
                      ? "48px"
                      : "32px",
                background: `radial-gradient(circle, ${
                  point.intensity === "high"
                    ? "rgba(239, 68, 68, 0.6)"
                    : point.intensity === "medium"
                      ? "rgba(245, 158, 11, 0.6)"
                      : "rgba(250, 204, 21, 0.6)"
                } 0%, transparent 70%)`,
              }}
              role="button"
              tabIndex={0}
              aria-label={`${point.label}: ${point.businesses} restaurants, ${point.intensity} density`}
              title={`${point.label}: ${point.businesses} restaurants`}
            >
              {/* Inner circle for better visibility */}
              <div className="absolute inset-2 rounded-full bg-white/20 border border-white/40"></div>

              {/* Business count indicator */}
              <div className="absolute -top-1 -right-1 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-800 border border-gray-200 shadow-sm">
                {point.businesses}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accessible legend */}
      <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-900 mb-2">
          Restaurant Density Legend
        </h4>
        <div className="space-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
            <span>High (15+ restaurants)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500/60"></div>
            <span>Medium (8-14 restaurants)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400/60"></div>
            <span>Low (1-7 restaurants)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({
  onBack,
  onSendMessage,
}: {
  onBack: () => void;
  onSendMessage?: (message: string) => void;
}) => (
  <div className="relative w-full min-h-screen bg-[#0B0C28] overflow-hidden">
    {/* Background Gradients */}
    <div className="absolute inset-0">
      <div className="absolute -top-96 -left-96 w-[2310px] h-[1719px] rounded-full bg-gradient-to-br from-[#0E0A2B] via-[#0E0A2B] to-transparent opacity-40 blur-[400px]" />
      <div className="absolute top-8 left-60 w-[1227px] h-[934px] rounded-full bg-gradient-to-br from-[#0919B6] to-transparent opacity-30 blur-[400px] rotate-[30deg]" />
      <div className="absolute -top-[1319px] left-[169px] w-[1587px] h-[2140px] rounded-full bg-gradient-to-br from-[#07D2FB] to-transparent opacity-20 blur-[280px]" />
      <div className="absolute -top-[1173px] -left-[79px] w-[1720px] h-[2196px] rounded-full bg-gradient-to-br from-[#21FCC6] to-transparent opacity-25 blur-[400px]" />
    </div>

    {/* Header */}
    <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-10 py-4 sm:py-5 border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 sm:gap-2 text-white hover:text-white/80 transition-colors"
        >
          <svg
            width="18"
            height="18"
            className="sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">
            Back
          </span>
        </button>

        {/* Tamm Logo */}
        <TammLogo className="w-20 sm:w-24 lg:w-[111px]" color="white" />
      </div>

      <h1 className="text-white text-center text-xs sm:text-sm lg:text-base font-medium flex-1 mx-2">
        Investor Journey for a Restaurant
      </h1>

      <div className="w-20 sm:w-24 lg:w-[111px]" />
    </header>

    {/* Main Content */}
    <div className="relative z-10 p-4 lg:p-8">
      {/* Notification Banner */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={chatCardClass(
          "mx-auto mb-8 w-full max-w-[605px] h-[103px] bg-gradient-to-b from-white to-[#F2F1EE] shadow-[0_0_10px_10px_rgba(0,0,0,0.07)]",
        )}
      >
        <div className="flex items-center gap-5 h-full px-5">
          <div className="flex-1">
            <div className="text-[#282B3E] font-semibold text-sm mb-1">
              Research Complete
            </div>
            <div className="text-[#282B3E] text-sm leading-[19px]">
              Your comprehensive restaurant investment analysis is ready for
              review.
            </div>
          </div>
          <button className="w-[138px] h-10 rounded-full bg-gradient-to-b from-[#5B6DDE] to-[#273489] text-white text-xs font-semibold">
            Download Report
          </button>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Left Column */}
        <div className="space-y-6">
          {/* AI Business Chat Interface */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={chatCardClass(
              "bg-white/10 backdrop-blur-md p-6 border border-white/20",
            )}
          >
            <div className="flex items-center gap-4 mb-6">
              <AIBusinessOrb className="h-16 w-16" />
              <div>
                <h3 className="text-white text-lg font-semibold">
                  AI Business
                </h3>
                <motion.div
                  className="flex items-center gap-1 mt-2"
                  animate={{
                    opacity: [0.6, 1, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {[
                    5.77, 11.95, 19.78, 13.19, 8.66, 23.08, 30.5, 16.9, 4.53,
                  ].map((height, index) => (
                    <motion.div
                      key={index}
                      className="bg-[#0E766E] rounded-full"
                      style={{
                        width: "3px",
                        height: `${height}px`,
                        transform: "rotate(-90deg)",
                      }}
                      animate={{
                        height: [
                          `${height * 0.5}px`,
                          `${height}px`,
                          `${height * 0.7}px`,
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.1,
                      }}
                    />
                  ))}
                </motion.div>
              </div>
            </div>
            <div className="text-white/80 text-sm">
              Analysis complete. This dashboard synthesizes all insights from
              our conversation about restaurant opportunities in Abu Dhabi.
            </div>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openCompetitorBreakout"))
              }
              className="mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
            >
              View competitor details
            </button>
          </motion.div>

          {/* Visitor Taste Trends Chart */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={chatCardClass(
              "bg-white p-4 shadow-lg border border-[#EFEFEF]",
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-black text-[11px] font-semibold">
                  Visitor Taste Trends
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6.24" cy="6.24" r="4.5" fill="#888888" />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6.97 4.69C7.04 4.57 7.08 4.42 7.08 4.27C7.08 3.81 6.71 3.43 6.24 3.43C5.78 3.43 5.4 3.81 5.4 4.27C5.4 4.74 5.78 5.12 6.24 5.12C6.55 5.12 6.83 4.94 6.97 4.69ZM5.68 5.68H5.96H6.52C6.83 5.68 7.08 5.93 7.08 6.24V6.8V9.05C7.08 9.36 6.83 9.61 6.52 9.61C6.21 9.61 5.96 9.36 5.96 9.05V7.22C5.96 6.99 5.77 6.8 5.54 6.8C5.31 6.8 5.12 6.61 5.12 6.38V6.24C5.12 6.04 5.22 5.87 5.37 5.77C5.46 5.71 5.57 5.68 5.68 5.68Z"
                    fill="white"
                  />
                </svg>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[#878787] text-[10px] mb-1">
                Total survey this month
              </div>
              <div className="text-black text-2xl font-semibold">1230</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-1 border border-[#D9D9D9] rounded-full bg-[#EEE] text-xs">
                  <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                    <path
                      d="M4.87 3.02V7.58H4.12V3.02L2.11 5.03L1.58 4.5L4.49 1.59L7.41 4.5L6.88 5.03L4.87 3.02Z"
                      fill="#434343"
                    />
                  </svg>
                  <span className="text-[#434343]">12%</span>
                </div>
                <span className="text-[#878787] text-xs">vs last month</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="relative h-32 mb-4">
              <div className="absolute inset-0 flex items-end gap-6 px-3">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-16 bg-[#E29F37] rounded mb-2" />
                  <span className="text-[8px] text-[#878787] text-center">
                    Tourists lean toward Emirati + Asian
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-24 bg-[#429195] rounded mb-2" />
                  <span className="text-[8px] text-[#878787] text-center">
                    Locals prefer Emirati + Mediterranean
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-10 bg-[#A02E1F] rounded mb-2" />
                  <span className="text-[8px] text-[#878787] text-center">
                    Expats like Emirati + Indian
                  </span>
                </div>
              </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[9px] text-[#878787] px-3">
              <span>0</span>
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
              <span>40%</span>
              <span>50%</span>
            </div>
          </motion.div>
        </div>

        {/* Center Column - Main Data Visualization */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className={chatCardClass("bg-white/14 backdrop-blur-md p-8 h-full")}
          >
            <h2 className="text-white text-xl font-semibold mb-8">
              Popularity of cuisines in Abu Dhabi
            </h2>

            <div className="space-y-6">
              {/* Middle Eastern */}
              <div className="border-b border-white/18 pb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">
                      Middle Eastern
                    </h3>
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">
                      Popularity
                    </span>
                    <div className="text-white text-sm">30-35%</div>
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">
                      Supporting Context
                    </span>
                    <div className="text-white text-sm">
                      Cultural resonance, traditional appeal
                    </div>
                  </div>
                </div>
              </div>

              {/* American */}
              <div className="border-b border-white/18 pb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">American</h3>
                  </div>
                  <div>
                    <div className="text-white text-sm">20-25%</div>
                  </div>
                  <div>
                    <div className="text-white text-sm">
                      Fast-food dominance, familiarity, chain presence
                    </div>
                  </div>
                </div>
              </div>

              {/* Indian */}
              <div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">Indian</h3>
                  </div>
                  <div>
                    <div className="text-white text-sm">15-20%</div>
                  </div>
                  <div>
                    <div className="text-white text-sm">
                      Large expat community, flavor alignment with local
                      preferences
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Large Statistic */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <div className="text-white text-8xl lg:text-[100px] font-bold leading-none">
              78%
            </div>
            <div className="text-white text-sm mt-2">
              Residents eat out twice a week
            </div>
          </motion.div>

          {/* Map Visualization */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className={chatCardClass("overflow-hidden")}
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/6217a05a0af8f9420e0485cc166613634d45f299?width=634"
              alt="Abu Dhabi Map with Demographics"
              className={chatCardClass("w-full h-auto")}
            />
          </motion.div>

          {/* Additional Chart */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className={chatCardClass("overflow-hidden")}
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/eade8edabdbb717ecdef1b65c3b40e5d1928605a?width=418"
              alt="Market Analysis Chart"
              className={chatCardClass("w-full h-auto")}
            />
          </motion.div>
        </div>
      </div>
    </div>

    {/* Chat Input at Bottom */}
    <div className="relative z-10 max-w-2xl mx-auto px-4 pb-8">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4">
        <input
          type="text"
          placeholder="Who are the top competitors in the area?"
          className="w-full bg-transparent text-white placeholder-white/70 outline-none text-sm"
          onKeyPress={(e) => {
            if (
              e.key === "Enter" &&
              e.currentTarget.value.trim() &&
              onSendMessage
            ) {
              onSendMessage(e.currentTarget.value.trim());
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>

    {/* Background Image Overlay */}
    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
    <img
      src="https://api.builder.io/api/v1/image/assets/TEMP/7e2092faf64b59c4ede24041656b85968d42a542?width=2388"
      alt="Background"
      className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
    />
  </div>
);

const FinalCompilationView = ({ onBack }: { onBack: () => void }) => (
  <div className="relative w-full min-h-screen bg-gradient-to-br from-[#B8B5FF] via-[#E6E4FF] to-[#F0EFFF] overflow-hidden">
    {/* Header */}
    <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <TammLogo
          className="w-16 sm:w-20 lg:w-[84px] text-[#0B0C28]"
          color="#0B0C28"
        />
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#0B0C28]/15 bg-white/70 text-[#0B0C28] transition hover:bg-white"
          aria-label="Back"
        >
          <svg
            width="16"
            height="16"
            className="sm:w-5 sm:h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 19L8 12L15 5"
              stroke="#0B0C28"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <h3 className="text-xs sm:text-sm font-medium tracking-wide text-[#0B0C28] text-center flex-1 mx-2">
        Investor Journey for a Restaurant
      </h3>
      <div className="w-16 sm:w-20 lg:w-[84px]" aria-hidden="true" />
    </div>

    {/* Animated Compilation Content */}
    <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center space-y-8 max-w-4xl mx-auto"
      >
        {/* Main Title */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0B0C28] leading-tight"
        >
          Analysis Complete
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg sm:text-xl text-[#0B0C28]/80 max-w-2xl mx-auto"
        >
          Your comprehensive restaurant investment analysis is ready. From
          market research to competitor analysis, every insight has been
          compiled for your investment decision.
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-[#0B0C28] mb-2">6</div>
            <div className="text-[#0B0C28]/70 text-sm">Districts Analyzed</div>
          </div>
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-[#0B0C28] mb-2">78%</div>
            <div className="text-[#0B0C28]/70 text-sm">Dining Frequency</div>
          </div>
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-[#0B0C28] mb-2">4</div>
            <div className="text-[#0B0C28]/70 text-sm">Top Competitors</div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="space-y-4 pt-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openGapAnalysisBreakout"))
              }
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0E766E] to-[#0E766E] text-[#042B28] px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              View Gap Analysis
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-4" />
                <path d="M9 7l3-3 3 3" />
                <path d="M12 4v8" />
              </svg>
            </button>
            <button className="inline-flex items-center gap-3 bg-gradient-to-r from-[#5B6DDE] to-[#273489] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
              Download Complete Report
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7,10 12,15 17,10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-[#0B0C28]/60">
            Your personalized restaurant investment guide is ready
          </p>
        </motion.div>
      </motion.div>
    </div>

    {/* Background Elements */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-r from-purple-300/20 to-blue-300/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-gradient-to-r from-cyan-300/20 to-purple-300/20 blur-3xl"
      />
    </div>
  </div>
);

const DiscoveryCompilationCard = ({
  onViewDashboard,
}: {
  onViewDashboard?: () => void;
}) => {
  const handleOpenDashboard = () => {
    if (onViewDashboard) {
      onViewDashboard();
    }
  };

  const handleOpenCuisineBreakout = () => {
    // Dispatch custom event to trigger the breakout modal
    window.dispatchEvent(new CustomEvent("openCuisineBreakout"));
  };

  return (
    <div className="w-full max-w-[471px] mx-auto">
      <div
        className={chatCardClass(
          "bg-gradient-to-br from-[#0B0F2C]/95 via-[#101a43]/90 to-[#152d63]/85 backdrop-blur-xl border border-[#0B0C28]/20 shadow-[0_20px_50px_rgba(7,12,32,0.5)] overflow-hidden",
          "sm:rounded-3xl",
        )}
      >
        {/* AI Business Header */}
        <div className="flex flex-col p-6 pb-8">
          <div className="flex items-center gap-2 mb-8">
            <AIBusinessOrb className="h-16 w-16" />
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-2">
                AI Business
              </h3>
              <motion.div
                className="flex items-center gap-1"
                animate={{
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {[5.77, 11.95, 19.78, 13.19, 8.66, 23.08, 30.5, 16.9, 4.53].map(
                  (height, index) => (
                    <motion.div
                      key={index}
                      className="bg-[#0E766E] rounded-full"
                      style={{
                        width: "3px",
                        height: `${Math.max(3, height * 0.8)}px`,
                        transform: "rotate(-90deg)",
                      }}
                      animate={{
                        height: [
                          `${Math.max(3, height * 0.5)}px`,
                          `${height}px`,
                          `${Math.max(3, height * 0.7)}px`,
                        ],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.1,
                      }}
                    />
                  ),
                )}
              </motion.div>
            </div>
          </div>

          <h2 className="text-white text-xl font-semibold mb-8">
            Popularity of cuisines in Abu Dhabi
          </h2>

          {/* Cuisine Data */}
          <div className="space-y-6">
            {/* Middle Eastern */}
            <div className="pb-6 border-b border-white/18">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-white font-bold text-sm leading-[19.6px] tracking-[0.045px]">
                    Middle Eastern
                  </h3>
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">
                    Popularity
                  </p>
                  <p className="text-white text-sm leading-[120%]">30-35%</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">
                    Supporting Context
                  </p>
                  <p className="text-white text-sm leading-[120%]">
                    Cultural resonance, traditional appeal
                  </p>
                </div>
              </div>
            </div>

            {/* American */}
            <div className="pb-6 border-b border-white/18">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-white font-bold text-sm leading-[19.6px] tracking-[0.045px]">
                    American
                  </h3>
                </div>
                <div>
                  <p className="text-white text-sm leading-[120%]">20-25%</p>
                </div>
                <div>
                  <p className="text-white text-sm leading-[120%]">
                    Fast-food dominance, familiarity, chain presence
                  </p>
                </div>
              </div>
            </div>

            {/* Indian */}
            <div className="pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-white font-bold text-sm leading-[19.6px] tracking-[0.045px]">
                    Indian
                  </h3>
                </div>
                <div>
                  <p className="text-white text-sm leading-[120%]">15-20%</p>
                </div>
                <div>
                  <p className="text-white text-sm leading-[120%]">
                    Large expat community, flavor alignment with local
                    preferences
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleOpenCuisineBreakout}
              className={cn(ARTIFACT_ACTION_BUTTON_CLASSES, "justify-center")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Detailed breakdown
            </button>
            <button
              type="button"
              onClick={handleOpenDashboard}
              className={cn(ARTIFACT_ACTION_BUTTON_CLASSES, "justify-center")}
            >
              View complete analysis
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8 3.33337L7.05719 4.27618L10.3905 7.61951H3.33331V8.95284H10.3905L7.05719 12.2762L8 13.2189L12.6666 8.55228L8 3.33337Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInputField = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Ask me anything...",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  className?: string;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("w-full max-w-[691px]", className)}
    >
      <div className="flex min-h-[48px] w-full items-center gap-3 rounded-full border border-black/15 bg-white px-4 py-3 shadow-[0_16px_40px_-26px_rgba(0,0,0,0.18)]">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 border-0 bg-transparent text-[13px] font-normal leading-[140%] text-black placeholder-black/50 outline-none caret-black focus:border-0 focus:outline-none focus:ring-0"
          style={{
            fontFamily: "DM Sans, -apple-system, Roboto, Helvetica, sans-serif",
          }}
        />

        {/* Microphone Icon */}
        <button
          type="button"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:bg-gray-100"
          aria-label="Voice input"
        >
          <svg
            width="9"
            height="14"
            viewBox="0 0 10 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[14px] w-[9px]"
          >
            <path
              d="M1.5 6.5V8C1.5 8.92826 1.86901 9.81823 2.52539 10.4746C3.18177 11.131 4.07174 11.5 5 11.5C5.92826 11.5 6.81823 11.131 7.47461 10.4746C8.13099 9.81823 8.5 8.92826 8.5 8V6.5H9.5V8C9.49947 9.10653 9.0914 10.1744 8.35352 10.999C7.61565 11.8235 6.59961 12.3468 5.5 12.4697V13.5H7.5V14.5H2.5V13.5H4.5V12.4697C3.40039 12.3468 2.38435 11.8235 1.64648 10.999C0.908602 10.1744 0.500525 9.10653 0.5 8V6.5H1.5ZM5 0.5C5.66304 0.5 6.29874 0.763581 6.76758 1.23242C7.23642 1.70126 7.5 2.33696 7.5 3V8C7.5 8.66304 7.23642 9.29874 6.76758 9.76758C6.29874 10.2364 5.66304 10.5 5 10.5C4.33696 10.5 3.70126 10.2364 3.23242 9.76758C2.76358 9.29874 2.5 8.66304 2.5 8V3C2.5 2.33696 2.76358 1.70126 3.23242 1.23242C3.70126 0.763581 4.33696 0.5 5 0.5ZM5 1.5C4.60218 1.5 4.22076 1.65815 3.93945 1.93945C3.65815 2.22076 3.5 2.60218 3.5 3V8C3.5 8.39782 3.65815 8.77924 3.93945 9.06055C4.22076 9.34185 4.60218 9.5 5 9.5C5.39782 9.5 5.77924 9.34185 6.06055 9.06055C6.34185 8.77924 6.5 8.39782 6.5 8V3C6.5 2.60218 6.34185 2.22076 6.06055 1.93945C5.77924 1.65815 5.39782 1.5 5 1.5Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Keyboard Icon */}
        <button
          type="button"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black transition-colors hover:bg-gray-100"
          aria-label="Keyboard input"
        >
          <svg
            width="14"
            height="9"
            viewBox="0 0 14 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-[9px] w-[14px]"
          >
            <path
              d="M13 0.5C13.2652 0.5 13.5195 0.605432 13.707 0.792969C13.8946 0.980505 14 1.23478 14 1.5V8.5C14 8.76522 13.8946 9.0195 13.707 9.20703C13.5195 9.39457 13.2652 9.5 13 9.5H1C0.734784 9.5 0.480505 9.39457 0.292969 9.20703C0.105432 9.0195 0 8.76522 0 8.5V1.5C0 1.23478 0.105432 0.980505 0.292969 0.792969C0.480505 0.605432 0.734784 0.5 1 0.5H13ZM1 8.5H13V1.5H1V8.5ZM3 7.5H2V6.5H3V7.5ZM9.5 7.5H4V6.5H9.5V7.5ZM12 6.5V7.5H10.5V6.5H12ZM3 5.5H2V4.5H3V5.5ZM5 5.5H4V4.5H5V5.5ZM7 5.5H6V4.5H7V5.5ZM9 5.5H8V4.5H9V5.5ZM12 5.5H10V4.5H12V5.5ZM3 3.5H2V2.5H3V3.5ZM5 3.5H4V2.5H5V3.5ZM7 3.5H6V2.5H7V3.5ZM9 3.5H8V2.5H9V3.5ZM12 3.5H10V2.5H12V3.5Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

interface DialogueHighlightItemProps {
  highlight: DialogueDocHighlight;
  index: number;
  onToggle: (id: string) => void;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

const DialogueHighlightItem = ({
  highlight,
  index,
  onToggle,
  onChange,
  onRemove,
}: DialogueHighlightItemProps) => {
  return (
    <li
      className={cn(
        "group flex items-center gap-4 rounded-[28px] border border-slate-200/80 bg-white/85 px-4 py-3 shadow-[0_24px_60px_-34px_rgba(8,57,57,0.25)] transition",
        highlight.completed
          ? "border-[#0E766E]/50 bg-[#0E766E]/6 shadow-[0_26px_62px_-36px_rgba(8,57,57,0.32)]"
          : "hover:border-[#0E766E]/50 hover:shadow-[0_28px_64px_-30px_rgba(8,57,57,0.28)]",
      )}
    >
      <button
        type="button"
        onClick={() => onToggle(highlight.id)}
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition",
          highlight.completed
            ? "border-[#0E766E] bg-[#0E766E] text-white"
            : "border-slate-200 bg-white text-slate-400 group-hover:border-[#0E766E]/50",
        )}
        aria-label={
          highlight.completed
            ? `Mark thread ${index + 1} as in progress`
            : `Mark thread ${index + 1} as complete`
        }
      >
        {highlight.completed && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3334 4.66675L6.00008 12.0001L2.66675 8.66675"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-400">
          Thread {String(index + 1).padStart(2, "0")}
        </span>
        <input
          type="text"
          value={highlight.text}
          onChange={(event) => onChange(highlight.id, event.target.value)}
          className={cn(
            "w-full border-none bg-transparent text-sm font-medium leading-relaxed text-slate-700 outline-none transition",
            highlight.completed && "text-[#0E766E]",
          )}
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(highlight.id)}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E766E]/40 focus-visible:ring-offset-2"
        aria-label={`Remove thread ${index + 1}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 4L4 12M4 4L12 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </li>
  );
};

const DialogueDocCard = ({
  title,
  summary,
  notes,
  highlights,
  onNotesChange,
  onToggleHighlight,
  onHighlightChange,
  onHighlightRemove,
  onAddHighlight,
}: DialogueDocProps) => {
  const [newHighlight, setNewHighlight] = useState("");
  const completedCount = highlights.filter((item) => item.completed).length;
  const totalHighlights = highlights.length;
  const progressPercentage =
    totalHighlights > 0
      ? Math.round((completedCount / totalHighlights) * 100)
      : 0;
  const highlightStatus =
    totalHighlights > 0
      ? `${completedCount}/${totalHighlights} complete`
      : "No threads yet";
  const highlightEncouragement =
    totalHighlights === 0
      ? "Capture new focus points to start progress."
      : "Keep collaborating to mark threads done.";

  const handleAddHighlight = () => {
    const value = newHighlight.trim();
    if (!value) {
      return;
    }

    onAddHighlight(value);
    setNewHighlight("");
  };

  return (
    <div
      className={chatCardClass(
        "relative w-full max-w-[720px] overflow-hidden border border-white/60 bg-white/80 backdrop-blur-2xl shadow-[0_46px_120px_-70px_rgba(8,57,57,0.38)]",
        "rounded-[36px]",
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,118,110,0.12),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(8,57,57,0.08),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-10 p-6 sm:p-8 lg:p-10">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl space-y-4">
              <Badge className="w-fit rounded-full border border-[#0E766E]/30 bg-[#0E766E]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.26em] text-[#0E766E]">
                Dialogue workspace
              </Badge>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl">
                  {title}
                </h3>
                {summary ? (
                  <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                    {summary}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex w-full max-w-[240px] flex-col items-start gap-3 rounded-[28px] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_18px_40px_-28px_rgba(8,57,57,0.22)] sm:max-w-[260px]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">
                Live progress
              </span>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E766E]/15 text-lg font-semibold text-[#0E766E]">
                  {progressPercentage}%
                </div>
                <div className="text-xs text-slate-500 sm:text-sm">
                  <div className="font-semibold text-slate-900">
                    {highlightStatus}
                  </div>
                  <div>{highlightEncouragement}</div>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#dbe9e3]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7]"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-slate-400">
            <span className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[#0E766E]">
              Shared with AI advisor
            </span>
            <span>Investor dialogue</span>
          </div>
        </header>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(0,0.48fr)]">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.26em] text-[#0E766E]">
                Focus threads
              </h4>
              <span className="text-xs text-slate-400">{highlightStatus}</span>
            </div>
            <ul className="space-y-3">
              {highlights.map((highlight, index) => (
                <DialogueHighlightItem
                  key={highlight.id}
                  highlight={highlight}
                  index={index}
                  onToggle={onToggleHighlight}
                  onChange={onHighlightChange}
                  onRemove={onHighlightRemove}
                />
              ))}
              {highlights.length === 0 && (
                <li className="rounded-[28px] border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-sm text-slate-500">
                  Add focus threads to capture priorities and questions as they
                  emerge.
                </li>
              )}
            </ul>
            <div className="flex flex-wrap gap-3">
              <div className="flex min-w-[220px] flex-1 items-center overflow-hidden rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus-within:border-[#0E766E] focus-within:ring-2 focus-within:ring-[#0E766E]/25">
                <input
                  value={newHighlight}
                  onChange={(event) => setNewHighlight(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAddHighlight();
                    }
                  }}
                  placeholder="Add a focus point..."
                  className="flex-1 border-none bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                  aria-label="New focus thread"
                />
              </div>
              <button
                type="button"
                onClick={handleAddHighlight}
                className="inline-flex items-center justify-center rounded-full bg-[#083939] px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(8,57,57,0.5)] transition hover:shadow-[0_22px_44px_-24px_rgba(8,57,57,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0E766E]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10"
              >
                Add
              </button>
            </div>
          </section>
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold uppercase tracking-[0.26em] text-[#0E766E]">
                Working notes
              </h4>
              <span className="text-xs text-slate-400">
                {notes.length} characters
              </span>
            </div>
            <div className="rounded-[32px] border border-slate-200/80 bg-white/85 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <textarea
                value={notes}
                onChange={(event) => onNotesChange(event.target.value)}
                rows={6}
                className="min-h-[160px] w-full resize-y border-none bg-transparent text-sm leading-relaxed text-slate-700 outline-none focus:ring-0"
              />
            </div>
            <div className="rounded-2xl border border-[#0E766E]/20 bg-[#0E766E]/5 px-4 py-3 text-xs leading-relaxed text-[#0A4A46]">
              Invite collaborators or export highlights into your investor
              journey workspace when you are ready to share outcomes.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SetupBusinessCTA = ({
  onSetup,
  onExplore,
}: {
  onSetup?: () => void;
  onExplore?: () => void;
}) => (
  <div
    className={chatCardClass(
      "relative w-full max-w-[593px] overflow-hidden border border-black bg-white/14 backdrop-blur-sm",
      "rounded-[24px]",
    )}
  >
    {/* Header Image Section */}
    <div className="relative h-[101px] w-full">
      <img
        src="https://api.builder.io/api/v1/image/assets/TEMP/e427a550c226e9eefd36bf66ddc6123d30377808?width=1186"
        alt="Abu Dhabi header"
        className="h-full w-full object-cover"
      />

      {/* Avatar positioned over header */}
      <div className="absolute left-[26px] top-[18px] h-[63px] w-[63px]">
        <div className="h-full w-full rounded-full bg-[#D9D9D9] overflow-hidden">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131"
            alt="Profile avatar"
            className="h-[66px] w-[66px] object-cover -ml-[1px]"
          />
        </div>
      </div>

      {/* Header Text */}
      <div className="absolute right-[20px] top-[30px] text-right">
        <div className="text-black font-bold text-lg leading-[160%] tracking-[0.058px] mb-1">
          Investor Journey
        </div>
        <div className="text-black text-lg leading-[140%] tracking-[0.058px]">
          <span className="font-bold">Layla</span>{" "}
          <span className="font-normal">Al-Mansoori</span>
        </div>
      </div>
    </div>

    {/* Content Section */}
    <div className="px-[39px] pt-[20px] pb-[20px]">
      <div className="mb-6">
        <h3 className="text-black font-bold text-xl leading-[120%] tracking-[0.051px] mb-2">
          Your journey, powered by AI
        </h3>
        <p className="text-black text-base leading-[120%] tracking-[0.051px] font-normal">
          Discover a clear path for investors to plan, apply for, and
          successfully open a restaurant. In nine coordinated steps, watch
          Layla, an F&B entrepreneur, go from a business idea to a thriving
          restaurant.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 flex-wrap">
        <button
          type="button"
          onClick={onExplore}
          className="flex h-[47px] items-center justify-center gap-2.5 rounded-[72px] border-2 border-black bg-transparent px-4 text-center text-base font-bold leading-[120%] text-black transition-colors hover:bg-black/5"
        >
          Explore more options
        </button>
        <button
          type="button"
          onClick={onSetup}
          className="flex h-[47px] items-center justify-center gap-2.5 rounded-[72px] bg-gradient-to-r from-[#169F9F] to-[#083939] px-4 text-center text-base font-bold leading-[120%] text-white transition-transform duration-200 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#169F9F]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white/40"
        >
          Set up business
        </button>
      </div>
    </div>
  </div>
);

const CHAT_ACTION_BUTTON_CLASSES =
  "inline-flex items-center gap-2 rounded-full bg-[#0E766E] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(14,118,110,0.45)] transition hover:bg-[#0a5a55]";

interface MessageBubbleProps {
  message: BusinessMessage;
  onActionClick?: (action: ConversationAction, label: string) => void;
  dialogueDocProps?: DialogueDocProps;
  onHeatMapOpen?: () => void;
  onBudgetRangesOpen?: () => void;
  businessActivitiesProps?: {
    activities: ChatActivityOption[];
    selectedActivityIds: string[];
    onToggleActivity: (activityId: string) => void;
    onAddActivity: (name: string, description?: string) => void;
    maxSelection: number;
    physicalPlan: PhysicalSpacePlan | null;
  };
  applicationProgressProps?: {
    message: string;
  };
}

const MessageBubble = ({
  message,
  onActionClick,
  dialogueDocProps,
  onHeatMapOpen,
  onBudgetRangesOpen,
  businessActivitiesProps,
  applicationProgressProps,
}: MessageBubbleProps) => {
  const bubbleContainerClasses = message.isAI
    ? "border border-white/30 bg-white/18 text-slate-900 backdrop-blur-xl"
    : "border border-[#0E766E]/45 bg-[#0E766E]/30 text-white backdrop-blur-xl";

  if (message.type === "application-progress" && applicationProgressProps) {
    return (
      <div className="mb-6 flex w-full justify-start">
        <ApplicationProgressCard message={applicationProgressProps.message} />
      </div>
    );
  }

  if (message.type === "business-activities" && businessActivitiesProps) {
    return (
      <div className="mb-6 flex w-full justify-start">
        <BusinessActivitiesChatCard {...businessActivitiesProps} />
      </div>
    );
  }

  if (message.type === "dialogue-doc" && dialogueDocProps) {
    return (
      <div className="mb-6 flex w-full justify-center">
        <DialogueDocCard {...dialogueDocProps} />
      </div>
    );
  }

  if (message.type === "setup-cta") {
    const setupAction = message.actions?.find(
      (action) => action.label === "Set up business",
    );
    const exploreAction = message.actions?.find(
      (action) => action.label === "Explore more options",
    );
    return (
      <div className="mb-6 flex w-full justify-center">
        <SetupBusinessCTA
          onSetup={
            setupAction && onActionClick
              ? () => onActionClick(setupAction.action, setupAction.label)
              : undefined
          }
          onExplore={
            exploreAction && onActionClick
              ? () => onActionClick(exploreAction.action, exploreAction.label)
              : undefined
          }
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 flex gap-3 sm:gap-4",
        message.isAI ? "justify-start" : "justify-end",
      )}
    >
      {message.isAI && (
        <AIBusinessOrb className="mt-1 h-8 w-8 flex-shrink-0 shadow-sm ring-[#0E766E]/60 sm:h-10 sm:w-10" />
      )}
      <div
        className={cn(
          "flex max-w-[80%] sm:max-w-[72%] flex-col gap-2 sm:gap-3",
          message.isAI ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "w-full rounded-[24px] px-4 py-3 text-sm leading-relaxed sm:px-5 sm:py-4 sm:text-base shadow-sm transition-colors duration-200",
            bubbleContainerClasses,
            message.isAI ? "text-left" : "text-right",
          )}
        >
          {message.rating && (
            <div
              className={cn(
                "mb-2 flex",
                message.isAI ? "justify-start" : "justify-end",
              )}
            >
              <StarRating rating={message.rating} />
            </div>
          )}
          <div className="whitespace-pre-wrap">{message.content}</div>

          {message.type === "heat-map" && (
            <div
              className={cn(
                "mt-3 flex flex-col gap-3",
                message.isAI ? "items-start" : "items-end",
              )}
            >
              {message.imageUrl && (
                <img
                  src={message.imageUrl}
                  alt="AI generated map insight"
                  className={cn(
                    "inline-block rounded-2xl border border-black/10 shadow-sm",
                    message.isAI ? "max-w-[220px]" : "max-w-[180px]",
                  )}
                />
              )}
              {onHeatMapOpen && (
                <button
                  type="button"
                  onClick={onHeatMapOpen}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/35 px-4 py-2 text-sm font-semibold text-[#0E766E] shadow-sm backdrop-blur-xl transition hover:bg-white/55"
                >
                  <MapIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Open interactive heat map</span>
                </button>
              )}
            </div>
          )}

          {message.type === "property-cards" && (
            <>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {PROPERTY_OPPORTUNITIES.map((opportunity) => (
                  <PropertyOpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                  />
                ))}
              </div>
              <PropertyCollaborators />
            </>
          )}

          {message.type === "cuisine-analysis" && (
            <div className="mt-4">
              <CuisinePopularityChart />
            </div>
          )}

          {message.type === "competitor-analysis" && (
            <div className="mt-4">
              <CompetitorAnalysisChart />
            </div>
          )}

          {message.type === "demographics" && (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <DemographicsCard />
              <VisitorTasteTrendsChart />
            </div>
          )}

          {message.type === "location-analysis" && (
            <div className="mt-4">
              <LocationHeatMap />
            </div>
          )}

          {message.type === "budget-ranges" && (
            <div className="mt-4 space-y-4">
              <BudgetRanges
                onClick={onBudgetRangesOpen}
                className={cn(
                  "self-start",
                  !onBudgetRangesOpen && "pointer-events-none",
                )}
              />
              <div className="overflow-hidden rounded-2xl border border-[#d8e4df] bg-white/70">
                <div className="grid gap-0 text-sm text-slate-600">
                  <div className="grid items-center gap-3 border-b border-[#d8e4df]/60 bg-[#0E766E]/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#0E766E] md:grid-cols-[1.6fr,1fr,1fr]">
                    <span>Zone</span>
                    <span className="hidden md:block">Boutique</span>
                    <span className="hidden md:block">Flagship</span>
                    <div className="flex gap-4 md:hidden">
                      <span>Boutique</span>
                      <span>Flagship</span>
                    </div>
                  </div>
                  {budgetSummaryRows.map((row) => (
                    <div
                      key={row.area}
                      className="grid items-center gap-3 border-b border-[#d8e4df]/40 px-4 py-3 last:border-none md:grid-cols-[1.6fr,1fr,1fr]"
                    >
                      <div className="space-y-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {row.area}
                        </span>
                        <p className="text-xs text-slate-500">
                          {row.boutiqueRange !== "–"
                            ? "High street or lifestyle hub positioning"
                            : "Premium district suited to flagship scale"}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs md:block">
                        <span className="font-semibold text-slate-800">
                          {row.boutiqueRange}
                        </span>
                        <span className="md:hidden">Boutique</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-xs md:block">
                        <span className="font-semibold text-slate-800">
                          {row.flagshipRange}
                        </span>
                        <span className="md:hidden">Flagship</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Tap the budget ranges pill to open an interactive view with
                detailed breakdowns, timelines, and recommended next steps for
                each district.
              </p>
            </div>
          )}

          {message.type === "comprehensive-report" && (
            <div className="mt-4">
              <ComprehensiveReport />
            </div>
          )}

          {message.actions && message.actions.length > 0 && onActionClick && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => onActionClick(action.action, action.label)}
                  className={CHAT_ACTION_BUTTON_CLASSES}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {!message.isAI && (
        <img
          src={ENTREPRENEUR_PROFILE.avatar}
          alt={ENTREPRENEUR_PROFILE.name}
          className="h-8 w-8 flex-shrink-0 rounded-full border-2 border-white/60 object-cover sm:h-10 sm:w-10"
        />
      )}
    </div>
  );
};

const InvestorJourneyCard = ({
  onClose,
  onSetupBusiness,
}: {
  onClose: () => void;
  onSetupBusiness: () => void;
}) => {
  return (
    <div className={chatCardClass("bg-white/14 p-6 mt-4")}>
      {/* Header image */}
      <div className="relative mb-4">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/e427a550c226e9eefd36bf66ddc6123d30377808?width=1186"
          alt="Abu Dhabi skyline"
          className="w-full h-25 object-cover rounded-2xl"
        />

        {/* Avatar and details overlay */}
        <div className="absolute left-6 top-4 flex items-center gap-4">
          <img
            src={ENTREPRENEUR_PROFILE.avatar}
            alt={ENTREPRENEUR_PROFILE.name}
            className="w-16 h-16 rounded-full border-2 border-[#0E766E]"
          />
          <div>
            <h4 className="text-white text-lg font-semibold">
              Investor Journey
            </h4>
            <p className="text-white/90 text-lg">
              <span className="font-semibold">{ENTREPRENEUR_PROFILE.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-white mb-6">
        <h3 className="text-xl font-bold mb-2">Your journey, powered by AI</h3>
        <p className="text-base leading-relaxed text-white/90">
          Discover a clear path for investors to plan, apply for, and
          successfully open a restaurant. In just four seamless stages, watch
          {ENTREPRENEUR_PROFILE.name}, an F&B entrepreneur, go from a business
          idea to a thriving restaurant.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onClose}
          className="px-6 py-3 rounded-md border-2 border-white text-white font-semibold text-base hover:bg-white/10 transition-colors"
        >
          Explore more options
        </button>
        <button
          onClick={onSetupBusiness}
          className="px-6 py-3 rounded-md bg-teal-gradient text-white font-semibold text-base hover:opacity-90 transition-opacity"
        >
          Set up business
        </button>
      </div>
    </div>
  );
};

const getCategoryBackground = (category: string) => {
  const backgrounds = {
    restaurants:
      "https://api.builder.io/api/v1/image/assets/TEMP/749c7b38ea45266634e7fb0c1ba7745f62d35ec3?width=2390",
    "fast-food":
      "https://api.builder.io/api/v1/image/assets/TEMP/93a8ccdd2ba263b5df1fa8ac003cfbbe0f2a04bf?width=766",
    branch:
      "https://api.builder.io/api/v1/image/assets/TEMP/474e9427353e36aa9e243c53c1ca9efe1f850f1a?width=788",
    "retail-store":
      "https://api.builder.io/api/v1/image/assets/TEMP/28a07c4a89a2e43c77d74ad46a6ad88ca8d969b3?width=616",
  };
  return (
    backgrounds[category as keyof typeof backgrounds] || backgrounds.restaurants
  );
};

const getCategoryTitle = (category: string) => {
  const titles = {
    restaurants: "Commercial License for Restaurants",
    "fast-food": "Commercial License for Fast Food",
    branch: "Dual License for Branch",
    "retail-store": "Commercial License for Retail Store",
  };
  return titles[category as keyof typeof titles] || "Commercial License";
};

const getCategoryName = (category: string) => {
  const names = {
    restaurants: "Restaurants",
    "fast-food": "Fast Food",
    branch: "Branch",
    "retail-store": "Retail Store",
  };
  return names[category as keyof typeof names] || "Business";
};

const DISCOVER_EXPERIENCE_BACKGROUND =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F9b0dc1e702cd47b081613f3972914c00?format=webp&width=800";

// Budget Ranges Modal Component
const BudgetRangesModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const budgetRanges = [
    {
      range: "AED 10,000 - 30,000",
      title: "Basic Trade License",
      description: "Standard commercial license for restaurant operations",
      includes: [
        "Trade license registration",
        "Initial permits",
        "Basic approvals",
      ],
    },
    {
      range: "AED 790 - 5,000",
      title: "Tajer/E-commerce License",
      description: "Limited operations license (no full restaurant service)",
      includes: [
        "Online sales permit",
        "Delivery operations",
        "Takeaway service",
      ],
    },
    {
      range: "AED 50,000 - 150,000",
      title: "Premium Location License",
      description: "High-end areas with additional requirements",
      includes: [
        "Premium location fees",
        "Enhanced permits",
        "Tourism board approvals",
      ],
    },
    {
      range: "AED 200,000 - 500,000",
      title: "Comprehensive Setup",
      description: "Full restaurant setup with all permits and approvals",
      includes: [
        "All licenses",
        "Health permits",
        "Fire safety",
        "Municipality approvals",
        "Tourism licenses",
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-2xl"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-4xl"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div
          className={chatCardClass(
            "max-h-[85vh] min-h-[556px] overflow-hidden border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)] ring-4 ring-[#0E766E]/18 ring-offset-2 ring-offset-white",
          )}
        >
          <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-7 lg:px-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                    Focused artifact
                  </span>
                  <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                    Budget analysis
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full border border-[#dbe9e3] bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                  aria-label="Close budget ranges"
                >
                  Close
                </button>
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-semibold leading-tight text-slate-900">
                  Restaurant License Budget Ranges
                </h3>
                <p className="max-w-2xl text-base text-slate-600">
                  Comprehensive breakdown of licensing costs and requirements
                  for different restaurant types in Abu Dhabi.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-6 lg:px-8 lg:py-7">
            <div className="grid gap-6 md:grid-cols-2">
              {budgetRanges.map((budget, index) => (
                <div
                  key={index}
                  className={chatCardClass(
                    "border border-[#dbe9e3] bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.18)] transition hover:shadow-[0_22px_48px_-28px_rgba(15,118,110,0.25)]",
                  )}
                >
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-[#0E766E]">
                      {budget.range}
                    </span>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">
                      {budget.title}
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {budget.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Includes
                    </span>
                    <ul className="space-y-1">
                      {budget.includes.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-slate-700"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0E766E]"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompetitorBreakoutModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const competitorHighlights = [
    {
      name: "Shurfa Bay",
      rating: "4.8���",
      tier: "Premium waterfront",
      insight:
        "Sunset terrace has maintained 98% capacity across the past four evenings.",
    },
    {
      name: "Villa Toscana",
      rating: "4.7★",
      tier: "Luxury hotel dining",
      insight:
        "Private dining conversions rose 28% with bespoke tasting menus.",
    },
    {
      name: "Palms & Pearls",
      rating: "4.3★",
      tier: "Elevated casual",
      insight:
        "Experiential tasting flights outperform à la carte by 1.6x revenue.",
    },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[920px]"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div
          className={chatCardClass(
            "overflow-hidden border border-white/15 bg-slate-900/85 shadow-[0_45px_85px_-40px_rgba(15,23,42,0.9)] backdrop-blur-2xl ring-4 ring-[#0E766E]/18 ring-offset-2 ring-offset-slate-900",
          )}
        >
          <div className="border-b border-white/15 bg-white/12 px-6 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100">
                    Focused artifact
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                    Competitor landscape
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-[#0E766E] hover:text-[#0E766E]"
                  aria-label="Close competitor breakout"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-white">
                <h3 className="text-xl font-semibold">
                  Premium waterfront benchmarks
                </h3>
                <p className="text-sm text-white/70">
                  Benchmark high-performing venues to position your concept with
                  differentiated premium rituals.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-6 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {competitorHighlights.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-white/12 bg-white/8 p-4 text-white"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {item.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="border-emerald-300/50 bg-emerald-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-100"
                    >
                      {item.rating}
                    </Badge>
                  </div>
                  <div className="mt-3 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wide text-white/80">
                    {item.tier}
                  </div>
                  <p className="mt-3 text-xs text-white/70 leading-relaxed">
                    {item.insight}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/7 p-5 text-sm text-white/75">
              <p>
                Corniche venues continue to command the highest experiential
                spend. Positioning your concept with curated terrace rituals and
                signature tasting moments keeps you competitive while protecting
                premium price points.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GapBreakoutModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  const opportunitySignals: Array<{
    title: string;
    urgency: "High" | "Medium" | "Emerging";
    detail: string;
  }> = [
    {
      title: "Emirati fusion brunch",
      urgency: "High",
      detail:
        "Weekday premium casual format missing along Corniche with resident demand rising 18% year-on-year.",
    },
    {
      title: "Family coastal lounge",
      urgency: "Medium",
      detail:
        "Blend kids programming with curated sundowner menus to capture mixed visitor cohorts.",
    },
    {
      title: "Wellness-forward café",
      urgency: "Emerging",
      detail:
        "Morning boardwalk activity up 14% quarter-on-quarter; healthy grab-and-go remains underserved.",
    },
  ];

  const getUrgencyBadgeClass = (urgency: "High" | "Medium" | "Emerging") => {
    switch (urgency) {
      case "High":
        return "border-emerald-300/60 bg-emerald-400/15 text-emerald-100";
      case "Medium":
        return "border-amber-300/60 bg-amber-300/15 text-amber-100";
      case "Emerging":
      default:
        return "border-sky-300/60 bg-sky-300/15 text-sky-100";
    }
  };

  return (
    <div className="fixed inset-0 z-[82] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-[880px]"
        style={MODAL_MIN_DIMENSIONS}
      >
        <div
          className={chatCardClass(
            "overflow-hidden border border-white/15 bg-slate-900/80 shadow-[0_45px_85px_-40px_rgba(15,23,42,0.8)] backdrop-blur-2xl ring-4 ring-[#0E766E]/18 ring-offset-2 ring-offset-slate-900",
          )}
        >
          <div className="border-b border-white/12 bg-white/12 px-6 py-5">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-100">
                    Focused artifact
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                    Gap opportunities
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-[#0E766E] hover:text-[#0E766E]"
                  aria-label="Close opportunity breakout"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="space-y-2 text-white">
                <h3 className="text-xl font-semibold">Corniche demand map</h3>
                <p className="text-sm text-white/70">
                  Surface emerging experience gaps by urgency to inform concept
                  prioritisation across the Corniche.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-5 p-6 sm:p-8 text-white">
            <div className="grid gap-4">
              {opportunitySignals.map((signal) => (
                <div
                  key={signal.title}
                  className="rounded-2xl border border-white/12 bg-white/7 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {signal.title}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-white/20 px-2 py-0.5 text-[10px] uppercase tracking-wide",
                        getUrgencyBadgeClass(signal.urgency),
                      )}
                    >
                      {signal.urgency}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs text-white/70 leading-relaxed">
                    {signal.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/8 p-5 text-sm text-white/75">
              <p>
                Sync these opportunities with the investor journey: surface
                after sign-in, attach licensing requirements, and auto-create
                reviewer follow-up tasks inside the portal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiscoverExperienceView = ({
  category,
  onSendMessage,
  isStandalone = false,
}: {
  category: string;
  onSendMessage: (message: string) => void;
  isStandalone?: boolean;
}) => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<"heatmap" | "timeline">(
    "heatmap",
  );
  const [inputValue, setInputValue] = useState(
    isStandalone ? "Ask me..." : "I want to look at the Cornich",
  );

  const heatMapInsights = [
    {
      id: "corniche",
      name: "Corniche waterfront",
      summary:
        "Flagship promenade combining daily commuters, tourists, and premium dining demand across the waterfront.",
      footfall: "100K+ weekly visits",
      density: "Very high density",
      trend: "+14% YoY evening visitors",
      focus: "Fine dining, experiential cafes, promenade lounges",
      intensity: 96,
    },
    {
      id: "marina",
      name: "Abu Dhabi Marina & Breakwater",
      summary:
        "Destination leisure cluster anchored by luxury hotels, yacht clubs, and family attractions.",
      footfall: "40–55K weekly visits",
      density: "High density",
      trend: "+9% weekend uplift",
      focus: "Waterfront lounges, seafood houses, family dining",
      intensity: 84,
    },
    {
      id: "baniyas",
      name: "Baniyas community spine",
      summary:
        "Established residential corridor seeing strong family traffic and quick-service demand spikes.",
      footfall: "60��75K weekly visits",
      density: "Growing density",
      trend: "+11% midday demand",
      focus: "Family restaurants, fast casual, bakeries",
      intensity: 78,
    },
    {
      id: "khalifa-city",
      name: "Khalifa City",
      summary:
        "Expanding suburb with new schools, villas, and lifestyle centers attracting higher disposable income.",
      footfall: "25–35K weekly visits",
      density: "Emerging density",
      trend: "+6% new households",
      focus: "Community casual dining, specialty coffee",
      intensity: 68,
    },
    {
      id: "central",
      name: "Central business zone",
      summary:
        "High-rise core around Hamdan and Electra streets with office workers and late-night crowd overlap.",
      footfall: "70–85K weekly visits",
      density: "High mixed density",
      trend: "+8% lunch rush",
      focus: "Express lunch spots, premium quick service",
      intensity: 74,
    },
    {
      id: "coastal",
      name: "Coastal district",
      summary:
        "Lifestyle beachfront with active tourism calendar and family day-trip itineraries.",
      footfall: "35–50K weekly visits",
      density: "Seasonal peaks",
      trend: "+5% holiday uplift",
      focus: "Beach clubs, ice cream bars, casual dining",
      intensity: 64,
    },
  ];

  const insightById = heatMapInsights.reduce<
    Record<string, (typeof heatMapInsights)[number]>
  >((acc, spot) => {
    acc[spot.id] = spot;
    return acc;
  }, {});
  const activeInsightId = hoveredLocation ?? "corniche";
  const activeInsight = insightById[activeInsightId] ?? heatMapInsights[0];
  const progressValue = Math.min(
    Math.max(Math.round(activeInsight?.intensity ?? 0), 0),
    100,
  );
  const secondaryInsights = heatMapInsights.filter(
    (spot) => spot.id !== activeInsightId,
  );

  const conversationMessages = [
    {
      id: "user-1",
      content:
        "Where are existing establishments located for specific activities (on a heat map)?",
      isAI: false,
      timestamp: new Date(),
    },
    {
      id: "ai-1",
      content:
        "I have created a heat map for the top areas and existing businesses",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "user-2",
      content: "Interesting looking at this in a map",
      isAI: false,
      timestamp: new Date(),
    },
  ];

  // If this is a standalone discover experience (new tab), show just the input
  if (isStandalone) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ask About Your Business
          </h2>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            Get detailed information about costs, demographics, and requirements
            for your business setup in Abu Dhabi.
          </p>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (inputValue.trim() && inputValue !== "Ask me...") {
                onSendMessage(inputValue.trim());
                setInputValue("Ask me...");
              }
            }}
          >
            <div className="flex items-center gap-3 px-6 py-4 rounded-full bg-white border border-slate-200 shadow-sm max-w-md mx-auto">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => inputValue === "Ask me..." && setInputValue("")}
                onBlur={() => !inputValue && setInputValue("Ask me...")}
                className="flex-1 bg-transparent text-slate-900 text-sm placeholder-slate-400 outline-none"
                placeholder="Ask me..."
              />
              <div className="flex items-center gap-2">
                {/* Send button */}
                <button
                  type="submit"
                  className="p-2 rounded-md bg-[#0E766E] text-slate-900 transition-colors hover:bg-[#0a5a55]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {/* Microphone icon */}
                <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                  <svg
                    width="10"
                    height="15"
                    viewBox="0 0 10 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C5.63276 1.36502 5.25134 1.20687 4.85352 1.20687Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                {/* Keyboard icon */}
                <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                  <svg
                    width="15"
                    height="10"
                    viewBox="0 0 15 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Chat Messages */}
      <div className="space-y-4 mb-6">
        {/* User Question */}
        <div className="flex justify-end">
          <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#E6F7F3] border border-[#0E766E]/60 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[0].content}
            </div>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex justify-start gap-3">
          <AIBusinessOrb className="h-8 w-8 flex-shrink-0" />
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-slate-200 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[1].content}
            </div>
          </div>
        </div>

        {/* Heat Map Image */}
        <div className="flex justify-center my-6">
          <div className="relative">
            <button
              onClick={() => setShowMapModal(true)}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/436526069b5bab3e7ba658945420b54fe23552ba?width=386"
                alt="Abu Dhabi Heat Map"
                className="w-48 h-48 md:w-64 md:h-64 object-cover"
              />

              {/* Heat Map Overlay Circles */}
              <div className="absolute inset-0">
                {/* Red density circles */}
                <div
                  className="absolute w-8 h-8 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)",
                    top: "35%",
                    left: "30%",
                  }}
                />
                <div
                  className="absolute w-6 h-6 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 0, 0, 0.4) 0%, rgba(255, 0, 0, 0) 100%)",
                    top: "40%",
                    left: "15%",
                  }}
                />

                {/* Orange density circles */}
                <div
                  className="absolute w-7 h-7 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)",
                    top: "25%",
                    left: "10%",
                  }}
                />
                <div
                  className="absolute w-7 h-7 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)",
                    top: "55%",
                    left: "30%",
                  }}
                />
                <div
                  className="absolute w-8 h-8 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(255, 149, 0, 0.4) 0%, rgba(255, 178, 0, 0) 100%)",
                    top: "25%",
                    right: "20%",
                  }}
                />

                {/* Yellow density circle */}
                <div
                  className="absolute w-7 h-7 rounded-full"
                  style={{
                    background:
                      "radial-gradient(50% 50% at 50% 50%, rgba(251, 255, 0, 0.4) 0%, rgba(247, 255, 0, 0) 100%)",
                    top: "15%",
                    right: "25%",
                  }}
                />
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V8L15 3Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 3V9H20"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16 13L12 17L8 13"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 17V9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* User Response */}
        <div className="flex justify-end">
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#E6F7F3] border border-[#0E766E]/60 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[2].content}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="mt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputValue.trim()) {
              onSendMessage(inputValue.trim());
              setInputValue("");
            }
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-white border border-slate-200 shadow-sm">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-slate-900 text-sm placeholder-slate-400 outline-none"
              placeholder="Ask me..."
            />
            <div className="flex items-center gap-2">
              {/* Send button */}
              <button
                type="submit"
                className="p-2 rounded-md bg-[#0E766E] text-slate-900 transition-colors hover:bg-[#0a5a55]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {/* Microphone icon */}
              <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                <svg
                  width="10"
                  height="15"
                  viewBox="0 0 10 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.35352 6.20687V7.70687C1.35352 8.63513 1.72253 9.5251 2.37891 10.1815C3.03528 10.8379 3.92526 11.2069 4.85352 11.2069C5.78177 11.2069 6.67175 10.8379 7.32812 10.1815C7.9845 9.5251 8.35352 8.63513 8.35352 7.70687V6.20687H9.35352V7.70687C9.35299 8.8134 8.94491 9.88131 8.20703 10.7059C7.46917 11.5304 6.45312 12.0537 5.35352 12.1766V13.2069H7.35352V14.2069H2.35352V13.2069H4.35352V12.1766C3.25391 12.0537 2.23787 11.5304 1.5 10.7059C0.762117 9.88131 0.354041 8.8134 0.353516 7.70687V6.20687H1.35352ZM4.85352 0.206871C5.51656 0.206871 6.15225 0.470452 6.62109 0.939293C7.08993 1.40813 7.35352 2.04383 7.35352 2.70687V7.70687C7.35352 8.36991 7.08993 9.00561 6.62109 9.47445C6.15225 9.94329 5.51656 10.2069 4.85352 10.2069C4.19047 10.2069 3.55478 9.94329 3.08594 9.47445C2.6171 9.00561 2.35352 8.36991 2.35352 7.70687V2.70687C2.35352 2.04383 2.6171 1.40813 3.08594 0.939293C3.55478 0.470452 4.19047 0.206871 4.85352 0.206871ZM4.85352 1.20687C4.45569 1.20687 4.07427 1.36502 3.79297 1.64632C3.51166 1.92763 3.35352 2.30905 3.35352 2.70687V7.70687C3.35352 8.1047 3.51166 8.48611 3.79297 8.76742C4.07427 9.04872 4.45569 9.20687 4.85352 9.20687C5.25134 9.20687 5.63276 9.04872 5.91406 8.76742C6.19537 8.48611 6.35352 8.1047 6.35352 7.70687V2.70687C6.35352 2.30905 6.19537 1.92763 5.91406 1.64632C5.63276 1.36502 5.25134 1.20687 4.85352 1.20687Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              {/* Keyboard icon */}
              <div className="w-4 h-4 flex items-center justify-center text-teal-600/80">
                <svg
                  width="15"
                  height="10"
                  viewBox="0 0 15 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.8535 0.206871C14.1187 0.206871 14.373 0.312303 14.5605 0.49984C14.7481 0.687376 14.8535 0.941655 14.8535 1.20687V8.20687C14.8535 8.47209 14.7481 8.72637 14.5605 8.9139C14.373 9.10144 14.1187 9.20687 13.8535 9.20687H1.85352C1.5883 9.20687 1.33402 9.10144 1.14648 8.9139C0.958948 8.72637 0.853516 8.47209 0.853516 8.20687V1.20687C0.853516 0.941655 0.958948 0.687376 1.14648 0.49984C1.33402 0.312303 1.5883 0.206871 1.85352 0.206871H13.8535ZM1.85352 8.20687H13.8535V1.20687H1.85352V8.20687ZM3.85352 7.20687H2.85352V6.20687H3.85352V7.20687ZM10.3535 7.20687H4.85352V6.20687H10.3535V7.20687ZM12.8535 6.20687V7.20687H11.3535V6.20687H12.8535ZM3.85352 5.20687H2.85352V4.20687H3.85352V5.20687ZM5.85352 5.20687H4.85352V4.20687H5.85352V5.20687ZM7.85352 5.20687H6.85352V4.20687H7.85352V5.20687ZM9.85352 5.20687H8.85352V4.20687H9.85352V5.20687ZM12.8535 5.20687H10.8535V4.20687H12.8535V5.20687ZM3.85352 3.20687H2.85352V2.20687H3.85352V3.20687ZM5.85352 3.20687H4.85352V2.20687H5.85352V3.20687ZM7.85352 3.20687H6.85352V2.20687H7.85352V3.20687ZM9.85352 3.20687H8.85352V2.20687H9.85352V3.20687ZM12.8535 3.20687H10.8535V2.20687H12.8535V3.20687Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Interactive Heat Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-2xl"
            onClick={() => {
              setShowMapModal(false);
              setHoveredLocation(null);
            }}
          />
          <div
            className="relative z-10 w-full max-w-4xl"
            style={MODAL_MIN_DIMENSIONS}
          >
            <div
              className={chatCardClass(
                "max-h-[85vh] min-h-[556px] overflow-hidden border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)] ring-4 ring-[#0E766E]/18 ring-offset-2 ring-offset-white",
              )}
            >
              <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-7 lg:px-8">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                        Focused artifact
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                        Heat map
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMapModal(false);
                        setHoveredLocation(null);
                      }}
                      className="rounded-full border border-[#dbe9e3] bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                      aria-label="Close heat map"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-semibold leading-tight text-slate-900">
                      Abu Dhabi F&B Hotspot Density
                    </h3>
                    <p className="max-w-2xl text-base text-slate-600">
                      Compare licensing concentration and live footfall signals
                      across the city&apos;s restaurant districts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 lg:px-8 lg:py-7 space-y-6">
                {mapViewMode === "heatmap" ? (
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div
                      className={chatCardClass(
                        "relative flex h-full flex-col gap-5 border border-[#dbe9e3] bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.18)]",
                      )}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 rounded-full border border-[#dbe9e3] bg-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                            Progress
                          </span>
                          <div className="relative h-2.5 w-28 overflow-hidden rounded-full bg-[#e2ede8]">
                            <div
                              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7] shadow-[0_1px_2px_rgba(15,118,110,0.4)]"
                              style={{ width: `${progressValue}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            {progressValue}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                          {(["heatmap", "timeline"] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setMapViewMode(mode)}
                              className={cn(
                                "rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
                                mapViewMode === mode
                                  ? "bg-[#0E766E] text-white shadow-[0_12px_24px_-18px_rgba(14,118,110,0.45)]"
                                  : "text-slate-600 hover:text-[#0E766E]",
                              )}
                            >
                              {mode === "heatmap" ? "Map view" : "Timeline"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div
                        className={chatCardClass(
                          "relative flex-1 overflow-hidden border border-[#dbe9e3] bg-white",
                        )}
                      >
                        <img
                          src="https://api.builder.io/api/v1/image/assets/TEMP/df351a3a49f1c6b9b74765965e6ddb3ecf6799d7?width=1600"
                          alt="Abu Dhabi Map"
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0">
                          <div
                            className="absolute cursor-pointer transition duration-300 hover:scale-110"
                            style={{
                              left: "35%",
                              top: "28%",
                              width: "26%",
                              height: "38%",
                            }}
                            onMouseEnter={() =>
                              setHoveredLocation("khalifa-city")
                            }
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <svg
                              viewBox="0 0 212 212"
                              className="h-full w-full"
                            >
                              <circle
                                cx="106"
                                cy="106"
                                r="105"
                                fill="url(#redGradient)"
                              />
                              <defs>
                                <radialGradient id="redGradient">
                                  <stop stopColor="#FF0000" stopOpacity="0.4" />
                                  <stop
                                    offset="1"
                                    stopColor="#FF0000"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                              </defs>
                            </svg>
                            {hoveredLocation === "khalifa-city" && (
                              <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-[#dbe9e3] bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.2)]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {insightById["khalifa-city"]?.name}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
                                  {insightById["khalifa-city"]?.trend}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {insightById["khalifa-city"]?.footfall}
                                </p>
                              </div>
                            )}
                          </div>

                          <div
                            className="absolute cursor-pointer transition duration-300 hover:scale-110"
                            style={{
                              left: "18%",
                              top: "38%",
                              width: "24%",
                              height: "34%",
                            }}
                            onMouseEnter={() => setHoveredLocation("marina")}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <svg
                              viewBox="0 0 190 190"
                              className="h-full w-full"
                            >
                              <circle
                                cx="95"
                                cy="95"
                                r="94"
                                fill="url(#redGradient2)"
                              />
                              <defs>
                                <radialGradient id="redGradient2">
                                  <stop stopColor="#FF0000" stopOpacity="0.4" />
                                  <stop
                                    offset="1"
                                    stopColor="#FF0000"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                              </defs>
                            </svg>
                            {hoveredLocation === "marina" && (
                              <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-[#dbe9e3] bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.2)]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {insightById["marina"]?.name}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
                                  {insightById["marina"]?.trend}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {insightById["marina"]?.footfall}
                                </p>
                              </div>
                            )}
                          </div>

                          <div
                            className="absolute cursor-pointer transition duration-300 hover:scale-110"
                            style={{
                              left: "18%",
                              top: "20%",
                              width: "22%",
                              height: "32%",
                            }}
                            onMouseEnter={() => setHoveredLocation("central")}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <svg
                              viewBox="0 0 177 177"
                              className="h-full w-full"
                            >
                              <circle
                                cx="88"
                                cy="88"
                                r="88"
                                fill="url(#orangeGradient)"
                              />
                              <defs>
                                <radialGradient id="orangeGradient">
                                  <stop stopColor="#FF9500" stopOpacity="0.4" />
                                  <stop
                                    offset="1"
                                    stopColor="#FFB300"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                              </defs>
                            </svg>
                            {hoveredLocation === "central" && (
                              <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-[#dbe9e3] bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.2)]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {insightById["central"]?.name}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
                                  {insightById["central"]?.trend}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {insightById["central"]?.footfall}
                                </p>
                              </div>
                            )}
                          </div>

                          <div
                            className="absolute cursor-pointer transition duration-300 hover:scale-110"
                            style={{
                              left: "35%",
                              top: "64%",
                              width: "22%",
                              height: "32%",
                            }}
                            onMouseEnter={() => setHoveredLocation("baniyas")}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <svg
                              viewBox="0 0 177 177"
                              className="h-full w-full"
                            >
                              <circle
                                cx="88"
                                cy="88"
                                r="88"
                                fill="url(#orangeGradient2)"
                              />
                              <defs>
                                <radialGradient id="orangeGradient2">
                                  <stop stopColor="#FF9500" stopOpacity="0.4" />
                                  <stop
                                    offset="1"
                                    stopColor="#FFB300"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                              </defs>
                            </svg>
                            {hoveredLocation === "baniyas" && (
                              <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-[#dbe9e3] bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.2)]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {insightById["baniyas"]?.name}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
                                  {insightById["baniyas"]?.trend}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {insightById["baniyas"]?.footfall}
                                </p>
                              </div>
                            )}
                          </div>

                          <div
                            className="absolute cursor-pointer transition duration-300 hover:scale-110"
                            style={{
                              left: "54%",
                              top: "13%",
                              width: "31%",
                              height: "45%",
                            }}
                            onMouseEnter={() => setHoveredLocation("corniche")}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <svg
                              viewBox="0 0 249 249"
                              className="h-full w-full"
                            >
                              <circle
                                cx="124"
                                cy="124"
                                r="124"
                                fill="url(#orangeGradientLarge)"
                              />
                              <defs>
                                <radialGradient id="orangeGradientLarge">
                                  <stop stopColor="#FF9500" stopOpacity="0.4" />
                                  <stop
                                    offset="1"
                                    stopColor="#FFB300"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                              </defs>
                            </svg>
                            {hoveredLocation === "corniche" && (
                              <div className="absolute -top-20 left-1/2 -translate-x-1/2 rounded-2xl border border-[#dbe9e3] bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.2)]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {insightById["corniche"]?.name}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
                                  {insightById["corniche"]?.trend}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {insightById["corniche"]?.footfall}
                                </p>
                              </div>
                            )}
                          </div>

                          <div
                            className="absolute cursor-pointer transition duration-300 hover:scale-110"
                            style={{
                              left: "52%",
                              top: "-5%",
                              width: "25%",
                              height: "32%",
                            }}
                            onMouseEnter={() => setHoveredLocation("coastal")}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <svg
                              viewBox="0 0 203 177"
                              className="h-full w-full"
                            >
                              <circle
                                cx="101"
                                cy="75"
                                r="101"
                                fill="url(#yellowGradient)"
                              />
                              <defs>
                                <radialGradient id="yellowGradient">
                                  <stop stopColor="#FBFF00" stopOpacity="0.4" />
                                  <stop
                                    offset="1"
                                    stopColor="#F7FF00"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                              </defs>
                            </svg>
                            {hoveredLocation === "coastal" && (
                              <div className="absolute top-full left-1/2 mt-3 -translate-x-1/2 rounded-2xl border border-[#dbe9e3] bg-white/95 px-4 py-3 text-xs text-slate-600 shadow-[0_18px_36px_-24px_rgba(11,64,55,0.2)]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {insightById["coastal"]?.name}
                                </p>
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0E766E]">
                                  {insightById["coastal"]?.trend}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {insightById["coastal"]?.footfall}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pointer-events-none absolute inset-x-6 bottom-5 flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-8 rounded-full bg-[#0E766E]" />
                            High density
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-8 rounded-full bg-[#34d399]" />
                            Active growth
                          </span>
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-8 rounded-full bg-[#a7f3d0]" />
                            Seasonal peaks
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          className={cn(
                            ARTIFACT_ACTION_BUTTON_CLASSES,
                            "justify-center",
                          )}
                        >
                          Export insights
                        </button>
                        <button
                          type="button"
                          className={cn(
                            ARTIFACT_ACTION_BUTTON_CLASSES,
                            "justify-center",
                          )}
                        >
                          Download CSV
                        </button>
                        <button
                          type="button"
                          className={cn(
                            ARTIFACT_ACTION_BUTTON_CLASSES,
                            "justify-center",
                          )}
                        >
                          Share view
                        </button>
                      </div>
                    </div>

                    <div
                      className={chatCardClass(
                        "flex h-full flex-col gap-4 border border-[#dbe9e3] bg-white p-6 text-slate-900 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.18)]",
                      )}
                    >
                      <div
                        className={chatCardClass(
                          "relative overflow-hidden border border-[#dbe9e3] bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,118,110,0.25)]",
                        )}
                      >
                        <span className="absolute left-0 top-5 bottom-5 w-1.5 rounded-full bg-gradient-to-b from-[#0E766E] via-[#34d399] to-transparent" />
                        <div className="pl-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                            Focused district
                          </p>
                          <h4 className="mt-2 text-xl font-semibold text-slate-900">
                            {activeInsight.name}
                          </h4>
                          <p className="mt-3 text-sm text-slate-600">
                            {activeInsight.summary}
                          </p>
                          <dl className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-600">
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">
                                Footfall
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-slate-900">
                                {activeInsight.footfall}
                              </dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">
                                Density
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-slate-900">
                                {activeInsight.density}
                              </dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">
                                Trend
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-slate-900">
                                {activeInsight.trend}
                              </dd>
                            </div>
                            <div>
                              <dt className="uppercase tracking-[0.2em] text-slate-400">
                                Cuisine focus
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-slate-900">
                                {activeInsight.focus}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <div
                        className={chatCardClass(
                          "flex-1 overflow-y-auto border border-[#dbe9e3] bg-white/70 p-4",
                        )}
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                          Other hotspots
                        </p>
                        <ul className="mt-4 space-y-3 text-sm">
                          {secondaryInsights.map((spot) => {
                            const isHighlighted = hoveredLocation === spot.id;
                            const width = `${Math.min(spot.intensity, 100)}%`;
                            return (
                              <li
                                key={spot.id}
                                className={cn(
                                  chatCardClass(
                                    "relative overflow-hidden border border-[#dbe9e3] bg-white px-4 py-3 transition hover:border-[#0E766E]/50 hover:shadow-[0_16px_30px_-24px_rgba(15,118,110,0.3)]",
                                  ),
                                  isHighlighted &&
                                    "border-[#0E766E] shadow-[0_22px_48px_-26px_rgba(15,118,110,0.32)]",
                                )}
                                onMouseEnter={() => setHoveredLocation(spot.id)}
                                onMouseLeave={() => setHoveredLocation(null)}
                              >
                                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-[#0E766E] via-[#34d399] to-transparent" />
                                <div className="pl-3">
                                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                                    <span>{spot.name}</span>
                                    <span className="text-slate-500">
                                      {spot.footfall}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                    <span>{spot.density}</span>
                                    <span className="rounded-full bg-[#f6faf8] px-2 py-0.5 text-[10px] text-[#0E766E]">
                                      {spot.trend}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e2ede8]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7]"
                                      style={{ width }}
                                    />
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div
                        className={chatCardClass(
                          "border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500",
                        )}
                      >
                        Powered by aggregated licensing &amp; mobility data
                        (updated weekly)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={chatCardClass(
                      "space-y-6 border border-[#dbe9e3] bg-white p-6",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 rounded-full border border-[#dbe9e3] bg-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                          Progress
                        </span>
                        <div className="relative h-2.5 w-28 overflow-hidden rounded-full bg-[#e2ede8]">
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7] shadow-[0_1px_2px_rgba(15,118,110,0.4)]"
                            style={{ width: `${progressValue}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {progressValue}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 rounded-full border border-[#dbe9e3] bg-white px-2 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                        {(["heatmap", "timeline"] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setMapViewMode(mode)}
                            className={cn(
                              "rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] transition",
                              mapViewMode === mode
                                ? "bg-[#0E766E] text-white shadow-[0_12px_24px_-18px_rgba(14,118,110,0.45)]"
                                : "text-slate-600 hover:text-[#0E766E]",
                            )}
                          >
                            {mode === "heatmap" ? "Map view" : "Timeline"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                        Hotspot rollout timeline
                      </span>
                      <h4 className="text-2xl font-semibold leading-tight text-slate-900">
                        Priority sequence for restaurant expansion
                      </h4>
                      <p className="text-base text-slate-600">
                        Track each district&apos;s readiness, intensity signals,
                        and recommended launch focus.
                      </p>
                    </div>
                    <div className="space-y-4">
                      {heatMapInsights.map((spot, index) => {
                        const isHighlighted = hoveredLocation === spot.id;
                        const width = `${Math.min(spot.intensity, 100)}%`;
                        return (
                          <div
                            key={spot.id}
                            className={cn(
                              chatCardClass(
                                "relative flex gap-4 border border-[#dbe9e3] bg-white px-5 py-4 transition hover:border-[#0E766E]/50 hover:shadow-[0_18px_36px_-28px_rgba(15,118,110,0.28)]",
                              ),
                              isHighlighted &&
                                "border-[#0E766E] shadow-[0_22px_48px_-28px_rgba(15,118,110,0.35)]",
                            )}
                            onMouseEnter={() => setHoveredLocation(spot.id)}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <div className="relative flex w-12 flex-col items-center">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0E766E]">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="mt-2 h-full w-0.5 bg-gradient-to-b from-[#0E766E] via-[#34d399] to-transparent" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-baseline justify-between gap-3">
                                <div>
                                  <h5 className="text-lg font-semibold text-slate-900">
                                    {spot.name}
                                  </h5>
                                  <p className="text-sm text-slate-600">
                                    {spot.summary}
                                  </p>
                                </div>
                                <span className="rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0E766E]">
                                  {spot.density}
                                </span>
                              </div>
                              <div className="mt-3 grid grid-cols-3 gap-4 text-xs text-slate-600 md:grid-cols-4">
                                <div>
                                  <span className="uppercase tracking-[0.2em] text-slate-400">
                                    Footfall
                                  </span>
                                  <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {spot.footfall}
                                  </p>
                                </div>
                                <div>
                                  <span className="uppercase tracking-[0.2em] text-slate-400">
                                    Trend
                                  </span>
                                  <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {spot.trend}
                                  </p>
                                </div>
                                <div className="md:col-span-2">
                                  <span className="uppercase tracking-[0.2em] text-slate-400">
                                    Focus
                                  </span>
                                  <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {spot.focus}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e2ede8]">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-[#0E766E] via-[#2fc4a8] to-[#6ee7b7]"
                                  style={{ width }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        className={cn(
                          ARTIFACT_ACTION_BUTTON_CLASSES,
                          "justify-center",
                        )}
                      >
                        Export timeline
                      </button>
                      <button
                        type="button"
                        className={cn(
                          ARTIFACT_ACTION_BUTTON_CLASSES,
                          "justify-center",
                        )}
                      >
                        Download CSV
                      </button>
                      <button
                        type="button"
                        className={cn(
                          ARTIFACT_ACTION_BUTTON_CLASSES,
                          "justify-center",
                        )}
                      >
                        Share view
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const queryClient = new QueryClient();

export function BusinessChatUI({
  isOpen,
  onClose,
  category,
  title = "AI Business",
  initialMessage,
  onMinimize,
  mode = "modal",
  journeyFocusView = null,
  suppressChatInterface = false,
}: BusinessChatUIProps) {
  const [messages, setMessages] = useState<BusinessMessage[]>([]);
  const [view, setView] = useState<ChatView>("basic");
  const [modalView, setModalView] = useState<ModalView>("chat");
  const [currentStep, setCurrentStep] = useState<ConversationStep>("intro");
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [isCuisineBreakoutOpen, setCuisineBreakoutOpen] = useState(false);
  const [isCompetitorBreakoutOpen, setCompetitorBreakoutOpen] = useState(false);
  const [isGapBreakoutOpen, setGapBreakoutOpen] = useState(false);
  const [dialogueDocState, setDialogueDocState] = useState<DialogueDocState>(
    createInitialDialogueDocState,
  );
  const [inputValue, setInputValue] = useState("");
  const loginTriggerRef = useRef<HTMLElement | null>(null);
  const [shouldPromptLogin, setShouldPromptLogin] = useState(false);
  const [isInvestorLoginPending, setIsInvestorLoginPending] = useState(false);
  const [isInvestorAuthenticated, setIsInvestorAuthenticated] = useState(false);
  const [shouldOpenInvestorView, setShouldOpenInvestorView] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activityOptions, setActivityOptions] = useState<ChatActivityOption[]>(
    () => [...BASE_ACTIVITY_LIBRARY],
  );
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>([]);

  const openApplicantPortal = useCallback(() => {
    navigate("/portal/applicant", {
      state: {
        user: {
          name: ENTREPRENEUR_PROFILE.name,
          role: ENTREPRENEUR_PROFILE.title,
          email: "layla.almansoori@email.ae",
          avatarUrl: ENTREPRENEUR_PROFILE.avatar,
        },
      },
    });
  }, [navigate]);

  const selectedActivities = useMemo(
    () =>
      activityOptions.filter((activity) =>
        selectedActivityIds.includes(activity.id),
      ),
    [activityOptions, selectedActivityIds],
  );

  const shouldSuppressChat = suppressChatInterface;
  const showChatInterface = !shouldSuppressChat;

  const physicalSpacePlan = useMemo<PhysicalSpacePlan | null>(() => {
    if (selectedActivities.length === 0) {
      return null;
    }

    const totalArea = selectedActivities.reduce(
      (sum, activity) => sum + activity.spatial.minArea,
      0,
    );
    const kitchenArea = selectedActivities.reduce(
      (sum, activity) => sum + activity.spatial.kitchenArea,
      0,
    );
    const seatingCapacity = selectedActivities.reduce(
      (sum, activity) => sum + activity.spatial.seatingCapacity,
      0,
    );

    const complianceNotes = Array.from(
      new Set(selectedActivities.flatMap((activity) => activity.spatial.notes)),
    );
    const utilities = Array.from(
      new Set(
        selectedActivities.flatMap((activity) => activity.spatial.utilities),
      ),
    );
    const timelineWeeks = 6 + selectedActivities.length * 2;

    return {
      summary: {
        totalArea: Math.round(totalArea),
        seatingCapacity: Math.round(seatingCapacity),
        kitchenArea: Math.round(kitchenArea),
        complianceNotes,
        timelineWeeks,
        utilities,
      },
      activities: selectedActivities.map((activity) => ({
        id: activity.id,
        label: activity.label,
        minArea: Math.round(activity.spatial.minArea),
        seatingCapacity: Math.round(activity.spatial.seatingCapacity),
        kitchenArea: Math.round(activity.spatial.kitchenArea),
        ventilation: activity.spatial.ventilation,
        notes: activity.spatial.notes,
      })),
    };
  }, [selectedActivities]);

  const handleToggleActivity = useCallback(
    (activityId: string) => {
      setSelectedActivityIds((prev) =>
        prev.includes(activityId)
          ? prev.filter((id) => id !== activityId)
          : [...prev, activityId],
      );
    },
    [],
  );

  const handleAddActivity = useCallback(
    (activityId: string) => {
      setActivityOptions((prev) => {
        if (prev.some((item) => item.id === activityId)) {
          return prev;
        }

        const libraryItem = BASE_ACTIVITY_LIBRARY.find(
          (item) => item.id === activityId,
        );
        return libraryItem ? [...prev, libraryItem] : prev;
      });

      setSelectedActivityIds((prev) =>
        prev.includes(activityId) ? prev : [...prev, activityId],
      );
    },
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    if (!shouldPromptLogin) return;
    if (!isInvestorLoginPending) return;
    const trigger = loginTriggerRef.current;
    if (!trigger) return;
    trigger.click();
    setShouldPromptLogin(false);
  }, [shouldPromptLogin, isInvestorLoginPending, isOpen]);

  const buildMessage = useCallback(
    (
      content: string,
      isAI: boolean,
      extra?: Partial<BusinessMessage>,
    ): BusinessMessage => ({
      id: `${isAI ? "ai" : "user"}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      isAI,
      timestamp: new Date(),
      type: "text",
      ...extra,
    }),
    [],
  );

  const buildStepMessage = useCallback(
    (step: ConversationStep) => {
      const blueprint = CONVERSATION_BLUEPRINT[step];
      return buildMessage(blueprint.message, true, {
        actions: blueprint.actions?.map((action, index) => ({
          id: `${action.action}-${index}`,
          label: action.label,
          action: action.action,
        })),
        stepId: step,
      });
    },
    [buildMessage],
  );

  const handleDialogueDocNotesChange = useCallback((value: string) => {
    setDialogueDocState((prev) => ({ ...prev, notes: value }));
  }, []);

  const handleDialogueDocToggleHighlight = useCallback((id: string) => {
    setDialogueDocState((prev) => ({
      ...prev,
      highlights: prev.highlights.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    }));
  }, []);

  const handleDialogueDocHighlightChange = useCallback(
    (id: string, value: string) => {
      setDialogueDocState((prev) => ({
        ...prev,
        highlights: prev.highlights.map((item) =>
          item.id === id ? { ...item, text: value } : item,
        ),
      }));
    },
    [],
  );

  const handleDialogueDocHighlightRemove = useCallback((id: string) => {
    setDialogueDocState((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((item) => item.id !== id),
    }));
  }, []);

  const handleDialogueDocHighlightAdd = useCallback((value: string) => {
    setDialogueDocState((prev) => ({
      ...prev,
      highlights: [
        ...prev.highlights,
        {
          id: `dialogue-highlight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          text: value,
          completed: false,
        },
      ],
    }));
  }, []);

  const handleSendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) {
        return;
      }

      const lower = trimmed.toLowerCase();
      const userMessage = buildMessage(trimmed, false);
      const responses: BusinessMessage[] = [];

      const normalizedAcknowledgement = lower
        .replace(/[.,!?]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const acknowledgesHandoff =
        normalizedAcknowledgement === "yes i acknowledge" ||
        normalizedAcknowledgement === "i acknowledge" ||
        (normalizedAcknowledgement.startsWith("yes") &&
          normalizedAcknowledgement.includes("acknowledge"));

      if (acknowledgesHandoff) {
        responses.push(buildMessage(ACKNOWLEDGEMENT_MESSAGE, true));

        setMessages((prev) => [...prev, userMessage, ...responses]);
        setInputValue("");
        setTimeout(() => {
          openApplicantPortal();
        }, 100);
        return;
      }

      const appendHeatMapResponse = (content: string) => {
        responses.push(
          buildMessage(content, true, {
            type: "heat-map",
            imageUrl: HEAT_MAP_THUMBNAIL_URL,
          }),
        );
      };

      const mentionsHeatMap =
        lower.includes("heat map") ||
        lower.includes("heatmap") ||
        (lower.includes("map") &&
          (lower.includes("existing") || lower.includes("establishment")));
      const mentionsCorniche = lower.includes("cornich");
      const mentionsCost =
        lower.includes("cost") ||
        lower.includes("price") ||
        lower.includes("budget") ||
        lower.includes("how much") ||
        (lower.includes("money") && lower.includes("open")) ||
        lower.includes("expensive") ||
        lower.includes("cheap");
      const mentionsDemographics =
        lower.includes("demographic") ||
        lower.includes("population") ||
        (lower.includes("data") &&
          (lower.includes("area") || lower.includes("zone"))) ||
        lower.includes("residents") ||
        lower.includes("visitors") ||
        lower.includes("people");
      const mentionsTargetMarket =
        lower.includes("target market") ||
        lower.includes("high end") ||
        lower.includes("high-end") ||
        lower.includes("luxury") ||
        lower.includes("premium") ||
        (lower.includes("who") &&
          (lower.includes("target") || lower.includes("market"))) ||
        lower.includes("fine dining") ||
        lower.includes("upscale");
      const mentionsCornicheDetails =
        mentionsCorniche &&
        (lower.includes("detail") ||
          lower.includes("more detail") ||
          lower.includes("more details") ||
          lower.includes("tell me") ||
          lower.includes("info") ||
          lower.includes("information") ||
          lower.includes("about"));
      const mentionsReports =
        lower.includes("report") ||
        lower.includes("reports") ||
        (lower.includes("go") && lower.includes("deeper")) ||
        lower.includes("generate") ||
        lower.includes("comprehensive") ||
        lower.includes("analysis") ||
        lower.includes("summary") ||
        lower.includes("culmination");

      if (mentionsCost) {
        responses.push(
          buildMessage(
            "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.",
            true,
            {
              type: "budget-ranges",
            },
          ),
        );
      } else if (mentionsDemographics) {
        responses.push(
          buildMessage(
            "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers: Yas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10). Al Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10). Saadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10). Al Reem Island – 30k residents, 35k daytime; dense community market (7/10). Al Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10). Corniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10). Al Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
            true,
            {
              type: "demographics",
            },
          ),
        );
      } else if (mentionsCornicheDetails) {
        responses.push(
          buildMessage(
            "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.",
            true,
          ),
        );
      } else if (mentionsTargetMarket) {
        responses.push(
          buildMessage(
            "For high-end restaurants, your primary targets are: Al Maryah Island (luxury business dining, high-income professionals), Yas Island (affluent tourists and event visitors), Saadiyat Island (cultural tourists and art patrons), Corniche (premium leisure diners and scenic dining seekers), and Al Zahiyah (hotel guests and nightlife crowd). These zones offer the highest spending power, with average dining budgets of AED 200-500 per person for premium experiences. Focus on locations with business districts, luxury hotels, or cultural attractions.",
            true,
          ),
        );
      } else if (mentionsReports) {
        responses.push(
          buildMessage(
            "Generating comprehensive market analysis combining all previous insights. This report synthesizes location data, demographic patterns, budget requirements, and taste preferences into actionable business intelligence.",
            true,
            {
              type: "comprehensive-report",
            },
          ),
        );
      } else if (mentionsCorniche) {
        appendHeatMapResponse(
          "Zooming into the Corniche waterfront cluster. Footfall intensity is at 96% for premium dining, highlighted on the heat map now.",
        );
      } else if (mentionsHeatMap) {
        appendHeatMapResponse(
          "I have created a heat map for the top areas and existing businesses. Compare the highlighted districts to see where activity concentrates.",
        );
      } else if (lower.includes("map")) {
        appendHeatMapResponse(
          "Here's a map-based view so you can explore each neighbourhood visually. Tell me which district you'd like to dive into.",
        );
      } else {
        responses.push(
          buildMessage(
            "Thank you for your question. I'm analyzing the business landscape to provide you with the most relevant insights.",
            true,
          ),
        );
      }

      setMessages((prev) => [...prev, userMessage, ...responses]);
      setInputValue("");
    },
    [buildMessage, openApplicantPortal],
  );

  const openHeatMapFullView = useCallback(() => {
    setModalView("heat-map");
  }, []);

  const openBudgetRangesFocus = useCallback(() => {
    setModalView("budget-ranges");
  }, []);

  const openGapAnalysis = useCallback(() => {
    setModalView("gap-analysis");
  }, []);

  const openRetailLocations = useCallback(() => {
    setModalView("retail-locations");
  }, []);

  const handleAction = useCallback(
    (action: ConversationAction, label: string) => {
      setMessages((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const withoutActions = prev.map((message) =>
          message.actions ? { ...message, actions: undefined } : message,
        );

        const updated = [...withoutActions, buildMessage(label, false)];

        if (action === "show-summary" && currentStep === "intro") {
          setCurrentStep("summary");
          return [...updated, buildStepMessage("summary")];
        }

        if (action === "open-investor-journey") {
          if (isInvestorAuthenticated) {
            setModalView("heat-map");
            return [
              ...updated,
              buildMessage(
                "Where are existing establishments located for specific activities (on a heat map)?",
                true,
              ),
            ];
          }

          setIsInvestorAuthenticated(false);
          setIsInvestorLoginPending(true);
          setShouldPromptLogin(true);
          const loginPromptMessage = buildMessage(
            "Let's get you logged in with UAE Pass to continue with your personalized business setup.",
            true,
          );
          const journeyCardMessage = buildMessage(
            "Your journey, powered by AI.",
            true,
            {
              type: "setup-cta",
              actions: [
                {
                  id: "explore-options",
                  label: "Explore more options",
                  action: "show-summary",
                },
                {
                  id: "setup-business-primary",
                  label: "Set up business",
                  action: "open-investor-journey",
                },
              ],
            },
          );
          return [...updated, loginPromptMessage, journeyCardMessage];
        }

        if (action === "confirm-retail-automation") {
          if (isInvestorAuthenticated) {
            setView("investor-journey");
            const acknowledgement = buildMessage(
              "I'll automate the application and have opened your applicant portal timeline.",
              true,
            );
            return [...updated, acknowledgement];
          }

          setIsInvestorAuthenticated(false);
          setIsInvestorLoginPending(true);
          setShouldPromptLogin(true);
          setShouldOpenInvestorView(true);
          const approvalMessage = buildMessage(
            "Let's get you logged in with UAE Pass.",
            true,
          );
          return [...updated, approvalMessage];
        }

        if (action === "decline-retail-automation") {
          const acknowledgement = buildMessage(
            "No worries. Let me know whenever you’d like me to take care of the paperwork.",
            true,
          );
          return [...updated, acknowledgement];
        }

        return updated;
      });
    },
    [
      buildMessage,
      buildStepMessage,
      currentStep,
      isInvestorAuthenticated,
      setModalView,
      setView,
    ],
  );

  const handleAutoLoginComplete = useCallback(
    (userType: "applicant" | "reviewer", userData: any) => {
      if (!isInvestorLoginPending) {
        return;
      }

      setIsInvestorLoginPending(false);
      setShouldPromptLogin(false);
      setIsInvestorAuthenticated(true);

      const authenticatedName =
        typeof userData?.name === "string" && userData.name.length > 0
          ? userData.name
          : ENTREPRENEUR_PROFILE.name;
      const roleDescriptor =
        userType === "reviewer" ? "reviewer access" : "business account";

      setMessages((prev) => {
        const sanitized = prev.map((message) =>
          message.actions ? { ...message, actions: undefined } : message,
        );

        const sanitizedWithoutJourneyCard = sanitized.filter(
          (message) => !(message.isAI && message.type === "setup-cta"),
        );

        const summaryText = CONVERSATION_BLUEPRINT.summary.message;
        const hasSummaryMessage = sanitizedWithoutJourneyCard.some(
          (message) => message.isAI && message.content === summaryText,
        );

        const nextMessages = [...sanitizedWithoutJourneyCard];

        if (!hasSummaryMessage) {
          nextMessages.push(buildMessage(summaryText, true));
        }

        nextMessages.push(
          buildMessage(
            `${authenticatedName} is now signed in via UAE PASS with ${roleDescriptor}.`,
            true,
          ),
        );

        nextMessages.push(
          buildMessage("Your journey, powered by AI.", true, {
            type: "setup-cta",
            actions: [
              {
                id: "explore-options",
                label: "Explore more options",
                action: "show-summary",
              },
              {
                id: "setup-business-primary",
                label: "Set up business",
                action: "open-investor-journey",
              },
            ],
          }),
        );

        if (shouldOpenInvestorView) {
          nextMessages.push(
            buildMessage(
              "Automation is underway. I've opened your applicant portal workspace with the journey timeline.",
              true,
            ),
          );
        }

        nextMessages.push(buildStepMessage("handoff"));

        return nextMessages;
      });

      setIsInvestorAuthenticated(true);
      if (shouldOpenInvestorView) {
        setView("investor-journey");
        setShouldOpenInvestorView(false);
      }
      setCurrentStep("handoff");
    },
    [
      isInvestorLoginPending,
      shouldOpenInvestorView,
      buildMessage,
      buildStepMessage,
      setView,
      setCurrentStep,
      setIsInvestorAuthenticated,
    ],
  );

  useEffect(() => {
    if (!isOpen) {
      setShowBudgetModal(false);
      setCuisineBreakoutOpen(false);
      setCompetitorBreakoutOpen(false);
      setGapBreakoutOpen(false);
      setDialogueDocState(createInitialDialogueDocState());
      setIsInvestorLoginPending(false);
      setShouldPromptLogin(false);
      setIsInvestorAuthenticated(false);
      setShouldOpenInvestorView(false);
      setModalView("chat");
      return;
    }

    setView("basic");
    setModalView("chat");
    setCurrentStep("intro");
    setDialogueDocState(createInitialDialogueDocState());
    setIsInvestorLoginPending(false);
    setShouldPromptLogin(false);
    setIsInvestorAuthenticated(false);
    setShouldOpenInvestorView(false);

    if (shouldSuppressChat) {
      setMessages([]);
      return;
    }

    const conversation: BusinessMessage[] = [];

    const openingUserMessage = buildMessage(
      initialMessage ??
        "I want to invest my money and open a restaurant business in Abu Dhabi. What commercial activities align with my business type and can you help me set up?",
      false,
    );
    conversation.push(openingUserMessage);

    conversation.push(
      buildMessage(
        "I can help you explore business opportunities in Abu Dhabi and guide you through the setup process. To provide personalized insights and access government services, I'll need to verify your identity first.",
        true,
        {
          actions: [
            {
              id: "start-login",
              label: "Sign in with UAE Pass",
              action: "open-investor-journey",
            },
          ],
        },
      ),
    );

    setMessages(conversation);
  }, [isOpen, buildMessage, initialMessage, shouldSuppressChat]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const latestStepMessage = [...messages]
      .reverse()
      .find((message) => message.stepId !== undefined);

    if (latestStepMessage?.stepId && latestStepMessage.stepId !== currentStep) {
      setCurrentStep(latestStepMessage.stepId);
    }
  }, [messages, currentStep]);

  useEffect(() => {
    const handleRetailLocationSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { automationConfirmed } = customEvent.detail || {};

      setModalView("chat");
      setMessages((prev) => {
        const sanitized = prev.map((message) =>
          message.actions ? { ...message, actions: undefined } : message,
        );

        if (automationConfirmed === true) {
          const acknowledgement = buildMessage(ACKNOWLEDGEMENT_MESSAGE, true);
          setTimeout(() => {
            openApplicantPortal();
          }, 100);
          return [...sanitized, acknowledgement];
        } else if (automationConfirmed === false) {
          return [
            ...sanitized,
            buildMessage(
              "No worries. Let me know whenever you'd like me to take care of the paperwork.",
              true,
            ),
          ];
        }

        return sanitized;
      });
    };

    window.addEventListener(
      "retailLocationSelected",
      handleRetailLocationSelected,
    );

    return () => {
      window.removeEventListener(
        "retailLocationSelected",
        handleRetailLocationSelected,
      );
    };
  }, [buildMessage, openApplicantPortal, setModalView]);

  useEffect(() => {
    const handleCuisineBreakout = () => setCuisineBreakoutOpen(true);
    const handleCompetitorBreakout = () => setCompetitorBreakoutOpen(true);
    const handleGapBreakout = () => setGapBreakoutOpen(true);
    const handleGapAnalysis = () => openGapAnalysis();
    const handleRetailLocations = () => openRetailLocations();

    window.addEventListener("openCuisineBreakout", handleCuisineBreakout);
    window.addEventListener("openCompetitorBreakout", handleCompetitorBreakout);
    window.addEventListener("openGapAnalysisBreakout", handleGapBreakout);
    window.addEventListener("openGapAnalysis", handleGapAnalysis);
    window.addEventListener("openRetailLocations", handleRetailLocations);

    return () => {
      window.removeEventListener("openCuisineBreakout", handleCuisineBreakout);
      window.removeEventListener(
        "openCompetitorBreakout",
        handleCompetitorBreakout,
      );
      window.removeEventListener("openGapAnalysisBreakout", handleGapBreakout);
      window.removeEventListener("openGapAnalysis", handleGapAnalysis);
      window.removeEventListener("openRetailLocations", handleRetailLocations);
    };
  }, [openGapAnalysis, openRetailLocations]);

  if (!isOpen) return null;

  let modalOverlay: React.ReactNode = null;

  if (modalView === "budget-ranges") {
    modalOverlay = (
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setModalView("chat")}
        />
        <div
          className="relative z-10 h-[90vh] w-full max-w-[920px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <BudgetRangesView onBack={() => setModalView("chat")} />
        </div>
      </div>
    );
  } else if (modalView === "heat-map") {
    modalOverlay = (
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setModalView("chat")}
        />
        <div
          className="relative z-10 h-[90vh] w-full max-w-[800px] overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <HeatMapView onBack={() => setModalView("chat")} />
        </div>
      </div>
    );
  } else if (modalView === "gap-analysis") {
    modalOverlay = (
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
          onClick={() => setModalView("chat")}
        />
        <div
          className="relative z-10 h-[95vh] w-full max-w-[1200px] overflow-hidden rounded-2xl shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <GapAnalysisView onBack={() => setModalView("chat")} />
        </div>
      </div>
    );
  } else if (modalView === "retail-locations") {
    modalOverlay = (
      <div className="fixed inset-0 z-[80] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setModalView("chat")}
        />
        <div
          className="relative z-10 h-[95vh] w-full max-w-[1200px] overflow-hidden rounded-2xl shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <RetailLocationsView onBack={() => setModalView("chat")} />
        </div>
      </div>
    );
  }

  const backgroundImage =
    view === "discover-experience"
      ? DISCOVER_EXPERIENCE_BACKGROUND
      : getCategoryBackground(category);
  const categoryName = getCategoryName(category);
  const headerTitle =
    view === "discover-experience"
      ? `Your Investment Journey for ${categoryName}`
      : getCategoryTitle(category);

  const isSidePanel = mode === "side-panel";
  const isModal = mode === "modal";

  const outerContainerClass = cn(
    "relative z-10 flex w-full justify-center px-3 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-10",
    isSidePanel &&
      "h-full justify-end px-0 py-0 sm:px-0 sm:py-0 lg:px-0 lg:py-0",
  );

  const chatShellClass = cn(
    chatCardClass(
      "mx-auto w-full max-w-6xl overflow-hidden border border-white/25 bg-white/15 backdrop-blur-3xl shadow-[0_55px_140px_-65px_rgba(15,23,42,0.45)] ring-1 ring-white/10",
      "sm:rounded-[28px]",
    ),
    isSidePanel &&
      "mx-0 flex h-full max-w-none flex-col rounded-none border-l border-slate-200 bg-white/95 shadow-[0_35px_90px_-45px_rgba(15,23,42,0.35)] backdrop-blur-none ring-0",
  );

  const headerContainerClass = cn(
    "border-b border-white/20 bg-white/20 backdrop-blur-2xl p-4 sm:p-5 lg:p-6",
    isSidePanel && "border-slate-200 bg-white/95",
  );

  const bodyWrapperClass = cn(
    "px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6 lg:pb-8",
    isSidePanel &&
      "flex h-full flex-col overflow-hidden px-4 pb-5 sm:px-5 lg:px-6",
  );

  const conversationContainerClass = cn(
    "flex min-h-[360px] flex-col",
    isSidePanel && "flex-1 min-h-0",
  );

  const messageListClass = cn(
    "flex-1 overflow-y-auto space-y-3 pr-1 sm:space-y-4 sm:pr-2 lg:pr-3 max-h-[52vh] sm:max-h-[58vh]",
    isSidePanel && "max-h-none",
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UAEPassLogin
        trigger={
          <span
            ref={loginTriggerRef}
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
          >
            Launch UAE PASS
          </span>
        }
        mode="quick"
        autoLogin
        defaultUserType="applicant"
        onLogin={handleAutoLoginComplete}
        onClose={() => {
          setIsInvestorLoginPending(false);
          setShouldPromptLogin(false);
          setIsInvestorAuthenticated(false);
          setShouldOpenInvestorView(false);
        }}
      />
      <AnimatePresence>
        {isOpen && (
          <div
            key="chat-ui-root"
            className="fixed inset-0 z-50 overflow-hidden"
          >
            {isSidePanel && (
              <motion.button
                type="button"
                aria-label="Close Business AI chat"
                onClick={onClose}
                className="absolute inset-0 z-40 bg-slate-950/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            )}
            <motion.div
              key={`chat-ui-${mode}`}
              initial={
                isSidePanel ? { x: "100%" } : { opacity: 0, scale: 0.98 }
              }
              animate={isSidePanel ? { x: 0 } : { opacity: 1, scale: 1 }}
              exit={isSidePanel ? { x: "100%" } : { opacity: 0, scale: 0.98 }}
              transition={{
                duration: isSidePanel ? 0.25 : 0.3,
                ease: isSidePanel ? "easeOut" : "easeInOut",
              }}
              aria-hidden={modalView !== "chat"}
              className={cn(
                isSidePanel
                  ? "relative z-50 ml-auto flex h-full w-full max-w-[540px]"
                  : "relative flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-50",
                modalView !== "chat" ? "pointer-events-none" : undefined,
              )}
              style={
                isSidePanel
                  ? undefined
                  : {
                      backgroundImage: "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
              }
            >
              {!isSidePanel && (
                <>
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,159,159,0.18),transparent_55%)]" />
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.08),transparent_60%)]" />
                </>
              )}

              {/* Header */}
              <div className="hidden">
                <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-5 lg:px-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Tamm Logo */}
                    <svg
                      width="111"
                      height="50"
                      viewBox="0 0 111 50"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 sm:h-10 lg:h-12 w-auto"
                    >
                      <path
                        d="M65.7294 29.4798V38.9241H63.8521V29.4798H60.2383V27.6816H69.3588V29.4798H65.7294Z"
                        fill="black"
                      />
                      <path
                        d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z"
                        fill="black"
                      />
                      <path
                        d="M77.7754 38.9247V31.2004H79.5275V32.1855C80.0125 31.4193 80.8573 30.9659 81.7647 30.9815C82.7346 30.9346 83.642 31.4663 84.0643 32.3419C84.565 31.4506 85.5349 30.919 86.5518 30.9815C87.9441 30.9815 89.2582 31.8728 89.2582 33.9211V38.9247H87.4904V34.2339C87.4904 33.327 87.0367 32.6546 86.0199 32.6546C85.1438 32.6546 84.4242 33.3739 84.4242 34.2651C84.4242 34.2964 84.4242 34.312 84.4242 34.3433V38.9247H82.6251V34.2495C82.6251 33.3582 82.187 32.6702 81.1545 32.6702C80.2941 32.6546 79.5745 33.3582 79.5588 34.2182C79.5588 34.2651 79.5588 34.312 79.5588 34.359V38.9404L77.7754 38.9247Z"
                        fill="black"
                      />
                      <path
                        d="M91.5107 38.9247V31.2004H93.2629V32.1855C93.7479 31.4193 94.5926 30.9659 95.5 30.9815C96.4699 30.9346 97.3773 31.4663 97.7997 32.3419C98.3003 31.4506 99.2546 30.919 100.271 30.9815C101.664 30.9815 102.978 31.8728 102.978 33.9211V38.9247H101.257V34.2339C101.351 33.4677 100.819 32.7641 100.052 32.6546C99.9586 32.639 99.8647 32.639 99.7865 32.639C98.9104 32.639 98.1908 33.3582 98.1908 34.2495C98.1908 34.2808 98.1908 34.2964 98.1908 34.3277V38.9091H96.4074V34.2339C96.5012 33.4677 95.9693 32.7641 95.2028 32.6546C95.1089 32.639 95.015 32.639 94.9368 32.639C94.0764 32.6233 93.3568 33.327 93.3411 34.187C93.3411 34.2339 93.3411 34.2808 93.3411 34.3277V38.9091L91.5107 38.9247Z"
                        fill="black"
                      />
                      <path
                        d="M101.07 12.5309C101.586 12.5778 102.04 12.2182 102.086 11.7022C102.086 11.6709 102.086 11.6396 102.086 11.6084C102.024 11.0455 101.523 10.6233 100.96 10.6858C100.475 10.7327 100.1 11.1236 100.037 11.6084C100.037 12.1244 100.444 12.5309 100.96 12.5465C100.991 12.5465 101.038 12.5465 101.07 12.5309Z"
                        fill="black"
                      />
                      <path
                        d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z"
                        fill="black"
                      />
                      <path
                        d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z"
                        fill="black"
                      />
                      <path
                        d="M27.4986 23.1025L26.8103 20.3818C26.3253 20.5069 25.8247 20.5851 25.3241 20.6007C24.8078 20.5538 24.2759 20.4913 23.7753 20.3818L23.0557 23.0713C23.8222 23.2902 24.6044 23.3996 25.4023 23.3996C26.1063 23.3996 26.8103 23.3058 27.4986 23.1025Z"
                        fill="black"
                      />
                      <path
                        d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z"
                        fill="black"
                      />
                      <path
                        d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6298 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0425C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z"
                        fill="black"
                      />
                    </svg>

                    {/* Back button */}
                    <button
                      onClick={onClose}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/60 text-slate-600 transition hover:border-[#0E766E]/70 hover:text-[#0A4A46] sm:h-10 sm:w-10 lg:h-11 lg:w-11"
                      aria-label="Close chat"
                    >
                      <svg
                        width="18"
                        height="18"
                        className="sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 12H5M5 12L11 18M5 12L11 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="mx-auto flex flex-1 flex-col items-center gap-1 text-center">
                    <span className="inline-flex items-center rounded-full border border-slate-200/70 bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Application Journey
                    </span>
                    <h2 className="max-w-[320px] text-sm font-semibold leading-tight text-slate-900 sm:text-base lg:text-lg">
                      {headerTitle}
                    </h2>
                    <p className="hidden text-xs text-slate-500 sm:block">
                      Guided insights tailored to {categoryName} licensing.
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-slate-500">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                      Status
                    </span>
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Container */}
              <div className={outerContainerClass}>
                <div className={chatShellClass}>
                  {/* Chat Header */}
                  <div className={headerContainerClass}>
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex flex-col gap-1 text-left">
                        <span
                          className={cn(
                            "inline-flex w-fit items-center rounded-full border border-white/30 bg-white/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 backdrop-blur-xl",
                            isSidePanel &&
                              "border-slate-200 bg-white/80 backdrop-blur-none",
                          )}
                        >
                          Application Journey
                        </span>
                        <h2 className="max-w-[420px] text-base font-semibold leading-tight text-slate-900 sm:text-lg lg:text-xl">
                          {headerTitle}
                        </h2>
                        <p className="text-xs text-slate-500 sm:text-sm">
                          Guided insights tailored to {categoryName} licensing.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 text-slate-500">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                            Status
                          </span>
                          <span className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-100/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                            Live
                          </span>
                        </div>
                        {onMinimize && (
                          <button
                            type="button"
                            onClick={onMinimize}
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/40 text-slate-500 transition hover:border-[#0E766E]/70 hover:text-[#0A4A46] sm:h-10 sm:w-10 backdrop-blur-xl",
                              isSidePanel &&
                                "border-slate-200 bg-white/90 backdrop-blur-none hover:border-[#0E766E]/60",
                            )}
                            aria-label="Minimize chat"
                          >
                            <svg
                              width="18"
                              height="18"
                              className="h-4 w-4 sm:h-5 sm:w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M5 12H19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={onClose}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/40 text-slate-500 transition hover:border-[#0E766E]/70 hover:text-[#0A4A46] sm:h-10 sm:w-10 backdrop-blur-xl",
                            isSidePanel &&
                              "border-slate-200 bg-white/90 backdrop-blur-none hover:border-[#0E766E]/60",
                          )}
                          aria-label="Close chat"
                        >
                          <svg
                            width="18"
                            height="18"
                            className="h-4 w-4 sm:h-5 sm:w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M19 12H5M5 12L11 18M5 12L11 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {showChatInterface ? (
                      <JourneyBreadcrumb
                        steps={CONVERSATION_STEPS}
                        currentStepId={currentStep}
                        className="mb-4 w-full"
                      />
                    ) : null}
                    <div className="flex items-center gap-3 sm:gap-4">
                      <AIBusinessOrb className="h-12 w-12 sm:h-16 sm:w-16" />
                      <div className="min-w-0 flex-1 text-left">
                        <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
                          AI Business
                        </h3>
                        <p className="text-xs text-slate-500">
                          Guiding your Abu Dhabi investment journey
                        </p>
                      </div>
                      <div className="hidden sm:block">
                        <SoundVisualization />
                      </div>
                    </div>
                  </div>

                  <div className={bodyWrapperClass}>
                    <div
                      className={cn(
                        "flex flex-col gap-4 sm:gap-6 lg:gap-8",
                        isSidePanel && "flex-1 min-h-0",
                      )}
                    >
                      <div className={conversationContainerClass}>
                        <div className={messageListClass}>
                          {journeyFocusView ? (
                            <JourneyStageFocusView {...journeyFocusView} />
                          ) : null}
                          {showChatInterface
                            ? messages.map((message) => (
                                <MessageBubble
                                  key={message.id}
                                  message={message}
                                  onActionClick={handleAction}
                                  dialogueDocProps={
                                    message.type === "dialogue-doc"
                                      ? {
                                          title:
                                            message.docTitle ??
                                            "Investor dialogue workspace",
                                          summary: message.content,
                                          notes: dialogueDocState.notes,
                                          highlights: dialogueDocState.highlights,
                                          onNotesChange:
                                            handleDialogueDocNotesChange,
                                          onToggleHighlight:
                                            handleDialogueDocToggleHighlight,
                                          onHighlightChange:
                                            handleDialogueDocHighlightChange,
                                          onHighlightRemove:
                                            handleDialogueDocHighlightRemove,
                                          onAddHighlight:
                                            handleDialogueDocHighlightAdd,
                                        }
                                      : undefined
                                  }
                                  onHeatMapOpen={openHeatMapFullView}
                                  onBudgetRangesOpen={openBudgetRangesFocus}
                                  businessActivitiesProps={
                                    message.type === "business-activities"
                                      ? {
                                          activities: activityOptions,
                                          selectedActivityIds,
                                          onToggleActivity: handleToggleActivity,
                                          onAddActivity: handleAddActivity,
                                          maxSelection: MAX_LICENSE_ACTIVITIES,
                                          physicalPlan: physicalSpacePlan,
                                        }
                                      : undefined
                                  }
                                  applicationProgressProps={
                                    message.type === "application-progress"
                                      ? { message: message.content }
                                      : undefined
                                  }
                                />
                              ))
                            : null}
                        </div>

                        {showChatInterface && view === "investor-journey" && (
                          <div
                            className={cn(
                              "mt-6 rounded-[28px] border border-white/20 bg-white/16 p-4 backdrop-blur-xl shadow-[0_35px_90px_-60px_rgba(15,23,42,0.28)]",
                              isSidePanel &&
                                "border-slate-200 bg-slate-50/90 backdrop-blur-none shadow-[0_24px_60px_-48px_rgba(15,23,42,0.22)]",
                            )}
                          >
                            <DiscoverExperienceView
                              category={category}
                              onSendMessage={() => {}}
                              isStandalone={false}
                            />
                          </div>
                        )}

                        {showChatInterface ? (
                          <div
                            className={cn(
                              "mt-4 rounded-[24px] border border-white/20 bg-white/14 px-4 py-3 text-xs text-slate-600 backdrop-blur-xl",
                              isSidePanel &&
                                "border-slate-200 bg-slate-50/90 backdrop-blur-none",
                            )}
                          >
                            Use the highlighted action above to move forward.
                            We’ll open the next workspace once you confirm.
                          </div>
                        ) : null}

                        {showChatInterface ? (
                          <div
                            className={cn(
                              "mt-6 border-t border-white/15 pt-6",
                              isSidePanel && "border-slate-200",
                            )}
                          >
                            <ChatInputField
                              value={inputValue}
                              onChange={setInputValue}
                              onSubmit={handleSendMessage}
                              placeholder="Of these who are the target market for a high end restaurants?"
                              className="w-full"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {modalOverlay}

        {/* Budget Ranges Modal */}
        <BudgetRangesModal
          key="budget-ranges-modal"
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
        />
        <CuisinePopularityBreakout
          key="cuisine-breakout-modal"
          isOpen={isCuisineBreakoutOpen}
          onClose={() => setCuisineBreakoutOpen(false)}
        />
        <CompetitorBreakoutModal
          key="competitor-breakout-modal"
          isOpen={isCompetitorBreakoutOpen}
          onClose={() => setCompetitorBreakoutOpen(false)}
        />
        <GapBreakoutModal
          key="gap-breakout-modal"
          isOpen={isGapBreakoutOpen}
          onClose={() => setGapBreakoutOpen(false)}
        />
      </AnimatePresence>
    </QueryClientProvider>
  );
}
