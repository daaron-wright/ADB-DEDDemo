import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { usePersistentState } from "@/hooks/use-persistent-state";
import { useToast } from "@/hooks/use-toast";
import { conversationFlows } from "@/lib/conversations";
import { Button } from "@/components/ui/button";
import BusinessLicensePortalSimplified from "./business-license-portal-simplified";

interface BusinessMessage {
  id: string;
  content: string;
  isAI: boolean;
  timestamp: Date;
  rating?: number;
  hasActions?: boolean;
  type?: "text" | "heat-map";
}

interface BusinessChatUIProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  title?: string;
  initialMessage?: string;
}

type ChatView = "basic" | "investor-journey";

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

// Cuisine Popularity Card Component
const CuisinePopularityCard = ({ className = "" }: { className?: string }) => {
  return (
    <div className={cn("w-full max-w-lg bg-white rounded-3xl border border-slate-200/50 shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Cuisine Popularity Analysis</h3>
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
            <svg width="16" height="16" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#10b981"/>
            </svg>
          </div>
          <p className="text-sm text-slate-600">Middle Eastern cuisine market share</p>
        </div>

        {/* Cuisine Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Middle Eastern</div>
              <div className="text-sm text-slate-600">Cultural resonance, traditional appeal</div>
            </div>
            <div className="text-xl font-bold text-emerald-600">35%</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">American</div>
              <div className="text-sm text-slate-600">Fast-food dominance, brand recognition</div>
            </div>
            <div className="text-xl font-bold text-blue-600">25%</div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Indian</div>
              <div className="text-sm text-slate-600">Expat community support, spice alignment</div>
            </div>
            <div className="text-xl font-bold text-orange-600">20%</div>
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all">
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

// Competitor Analysis Card Component
const CompetitorAnalysisCard = ({ className = "" }: { className?: string }) => {
  return (
    <div className={cn("w-full max-w-lg bg-white rounded-3xl border border-slate-200/50 shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 20V10"/>
              <path d="M12 20V4"/>
              <path d="M6 20v-6"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Competitor Analysis</h3>
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
                <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
              <div className="text-sm text-slate-600">Waterfront premium seafood experience</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">4.8★</div>
              <div className="text-xs text-slate-500">$$$$</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Villa Toscana</div>
              <div className="text-sm text-slate-600">Luxury hotel-based Italian dining</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-blue-600">4.7★</div>
              <div className="text-xs text-slate-500">$$$$</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <div className="font-semibold text-slate-900">Palms & Pearls</div>
              <div className="text-sm text-slate-600">Modern Middle Eastern on Corniche</div>
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
        <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all">
          View Detailed Analysis
        </button>
      </div>
    </div>
  );
};

// Gap Analysis Card Component
const GapAnalysisCard = ({ className = "" }: { className?: string }) => {
  return (
    <div className={cn("w-full max-w-lg bg-white rounded-3xl border border-slate-200/50 shadow-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Gap Analysis</h3>
            <p className="text-sm text-slate-600">Market opportunities identified</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Main Statistic */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-900">6.3%</span>
            <svg width="16" height="16" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#10b981"/>
            </svg>
          </div>
          <p className="text-sm text-slate-600">Footfall growth potential in Corniche area</p>
        </div>

        {/* Gap Opportunities */}
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="font-semibold text-slate-900 mb-2">Emirati Fusion Cuisine</div>
            <div className="text-sm text-slate-600 mb-2">Japanese influences creating new trend</div>
            <div className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full inline-block">High Opportunity</div>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="font-semibold text-slate-900 mb-2">Formal Evening Dining</div>
            <div className="text-sm text-slate-600 mb-2">Waterfront locations with luxury experience</div>
            <div className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block">Medium Opportunity</div>
          </div>

          <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="font-semibold text-slate-900 mb-2">Family-Friendly Dining</div>
            <div className="text-sm text-slate-600 mb-2">Gap in affordable luxury segment</div>
            <div className="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full inline-block">Emerging</div>
          </div>
        </div>

        {/* Area Demographics */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl">
          <h4 className="font-semibold text-slate-900 mb-3">Abu Dhabi Corniche Demographics</h4>
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
        <button className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all">
          View Detailed Opportunities
        </button>
      </div>
    </div>
  );
};

type ContextTabId = "insights" | "workflow" | "reports";

const CONTEXT_TABS: Array<{ id: ContextTabId; label: string; meta: string }> = [
  { id: "insights", label: "Insights", meta: "Live" },
  { id: "workflow", label: "Workflow", meta: "9 routines" },
  { id: "reports", label: "Breakouts", meta: "3 available" },
];

const MetricTile = ({
  label,
  value,
  caption,
  trend,
}: {
  label: string;
  value: string;
  caption: string;
  trend?: string;
}) => {
  return (
    <div className="rounded-xl border border-white/12 bg-white/[0.07] p-3 sm:p-4 text-left">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/60">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      {trend && (
        <div className="text-xs font-semibold text-emerald-300">{trend}</div>
      )}
      <p className="mt-1 text-xs text-white/70 leading-relaxed">{caption}</p>
    </div>
  );
};

const InsightsSummary = () => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <MetricTile
        label="Market appetite"
        value="High · 8.1 index"
        caption="Tourist and resident demand for Corniche dining stays strong."
        trend="▲ 6.2% month-on-month"
      />
      <MetricTile
        label="License readiness"
        value="3 of 4 docs"
        caption="Compliance dossier awaiting final reviewer attachment."
      />
      <MetricTile
        label="Site priority"
        value="Corniche focus"
        caption="Footfall uplift remains highest compared to Yas and Al Maryah."
        trend="▲ 12% week-on-week"
      />
      <MetricTile
        label="Processing SLA"
        value="48h target"
        caption="Average reviewer turnaround for business license issuance."
      />
    </div>
  );
};

const InsightAccordionPanel = () => {
  return (
    <Accordion
      type="single"
      collapsible
      className="rounded-2xl border border-white/12 bg-white/10 backdrop-blur-xl"
    >
      <AccordionItem
        value="corniche"
        className="border-b border-white/10 last:border-b-0"
      >
        <AccordionTrigger className="px-4 text-left text-sm font-semibold text-white">
          <span className="flex items-center gap-3">
            <span>Corniche watchlist</span>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 text-[10px] uppercase tracking-wide text-white/80"
            >
              Priority
            </Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 px-4 text-sm text-white/75">
          <p>Waterfront corridor indexed 8/10 on visitor engagement this week.</p>
          <ul className="space-y-2 text-xs text-white/60">
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
              <span>Event calendar drove a 12% uplift from Thursday to Saturday.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
              <span>Premium casual concepts outperform traditional fine dining by 1.4x spend.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
              <span>Morning trade growing due to family wellness events along the promenade.</span>
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem
        value="policy"
        className="border-b border-white/10 last:border-b-0"
      >
        <AccordionTrigger className="px-4 text-left text-sm font-semibold text-white">
          <span className="flex items-center gap-3">
            <span>Policy bulletin</span>
            <Badge
              variant="outline"
              className="border-white/20 bg-white/10 text-[10px] uppercase tracking-wide text-white/80"
            >
              New
            </Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 px-4 text-sm text-white/75">
          <p>DED released an update for Real Beneficiary Declarations across all nine routines.</p>
          <p className="text-xs text-white/60">
            Applicants must confirm shareholder attestations prior to reviewer assignment. UAE Pass signatures are auto-requested at stage three.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="experience">
        <AccordionTrigger className="px-4 text-left text-sm font-semibold text-white">
          <span className="flex items-center gap-3">
            <span>Experience highlights</span>
            <Badge
              variant="outline"
              className="border-white/15 bg-white/10 text-[10px] uppercase tracking-wide text-white/80"
            >
              Journey
            </Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-3 px-4 text-sm text-white/75">
          <p>Investor journey showcases four stages from idea capture to license issuance.</p>
          <p className="text-xs text-white/60">
            Personalised playbooks, onboarding checklist, and portal shortcuts surface here once the applicant signs in.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const WORKFLOW_STEPS: Array<{
  title: string;
  status: "Complete" | "In review" | "Scheduled" | "Upcoming";
  description: string;
}> = [
  {
    title: "Intake & idea capture",
    status: "Complete",
    description: "Opportunity qualified by AI Business and shared with the applicant.",
  },
  {
    title: "Compliance dossier",
    status: "In review",
    description: "Supporting evidence awaiting reviewer assignment via license portal.",
  },
  {
    title: "Stakeholder approvals",
    status: "Scheduled",
    description: "DED legal and finance sign-off queued post compliance validation.",
  },
  {
    title: "License issuance",
    status: "Upcoming",
    description: "UAE Pass notification triggers once approvals are finalised.",
  },
];

const getStatusBadgeClass = (status: "Complete" | "In review" | "Scheduled" | "Upcoming") => {
  switch (status) {
    case "Complete":
      return "border-emerald-300/40 bg-emerald-400/15 text-emerald-200";
    case "In review":
      return "border-amber-300/40 bg-amber-400/15 text-amber-200";
    case "Scheduled":
      return "border-sky-300/40 bg-sky-400/15 text-sky-200";
    case "Upcoming":
    default:
      return "border-white/25 bg-white/10 text-white/70";
  }
};

const WorkflowSnapshot = () => {
  return (
    <div className="space-y-4">
      {WORKFLOW_STEPS.map((step, index) => (
        <div key={step.title} className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-white">{step.title}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase tracking-wide",
                  getStatusBadgeClass(step.status),
                )}
              >
                {step.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-white/70 leading-relaxed">
              {step.description}
            </p>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-white/65">
        Timeline auto-syncs with reviewer assignments and UAE Pass status updates.
      </div>
    </div>
  );
};

interface ContextActionPillProps {
  label: string;
  description: string;
  onClick: () => void;
  gradient: string;
  icon: React.ReactNode;
}

const ContextActionPill = ({
  label,
  description,
  onClick,
  gradient,
  icon,
}: ContextActionPillProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-white/12 bg-white/5 p-4 text-left transition hover:border-[#54FFD4]/70 hover:bg-white/10"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-900",
            gradient,
          )}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <p className="mt-1 text-xs text-white/70 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  );
};

const ReportsPanel = ({
  onOpenCuisine,
  onOpenCompetitor,
  onOpenGap,
  onDownloadDigest,
}: {
  onOpenCuisine: () => void;
  onOpenCompetitor: () => void;
  onOpenGap: () => void;
  onDownloadDigest: () => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <ContextActionPill
          label="Cuisine popularity breakout"
          description="Deep dive into cuisine share, spend behaviour, and recommendation heatmap."
          onClick={onOpenCuisine}
          gradient="bg-gradient-to-br from-emerald-300 to-teal-500"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-900"
            >
              <path
                d="M10 2.5C5.86 2.5 2.5 5.86 2.5 10C2.5 14.14 5.86 17.5 10 17.5C14.14 17.5 17.5 14.14 17.5 10C17.5 5.86 14.14 2.5 10 2.5ZM10 15.8333C6.77667 15.8333 4.16667 13.2233 4.16667 10C4.16667 6.77667 6.77667 4.16667 10 4.16667C13.2233 4.16667 15.8333 6.77667 15.8333 10C15.8333 13.2233 13.2233 15.8333 10 15.8333Z"
                fill="currentColor"
              />
              <path
                d="M10.8333 5.83325H9.16663V9.99992L12.5 12.2083L13.3333 10.9416L10.8333 9.33325V5.83325Z"
                fill="currentColor"
              />
            </svg>
          }
        />
        <ContextActionPill
          label="Competitor radar"
          description="Track ratings, pricing tiers, and positioning across premium venues."
          onClick={onOpenCompetitor}
          gradient="bg-gradient-to-br from-sky-300 to-indigo-500"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-900"
            >
              <path
                d="M4.16667 15.8333H15.8333V14.1666H4.16667V15.8333ZM4.16667 10.8333H15.8333V9.16659H4.16667V10.8333ZM4.16667 4.16659V5.83325H15.8333V4.16659H4.16667Z"
                fill="currentColor"
              />
            </svg>
          }
        />
        <ContextActionPill
          label="Gap opportunity brief"
          description="Surface unmet demand segments and recommended service concepts."
          onClick={onOpenGap}
          gradient="bg-gradient-to-br from-amber-300 to-orange-500"
          icon={
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-slate-900"
            >
              <path
                d="M10 1.66675L1.66667 18.3334H18.3333L10 1.66675ZM10 5.27508L15.4417 16.6667H4.55833L10 5.27508ZM9.16667 13.3334H10.8333V15.0001H9.16667V13.3334ZM9.16667 8.33341H10.8333V11.6667H9.16667V8.33341Z"
                fill="currentColor"
              />
            </svg>
          }
        />
      </div>
      <div className="rounded-2xl border border-white/12 bg-white/6 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Summary digest</p>
            <p className="text-xs text-white/65">Export latest conversation, analysis cards, and compliance status.</p>
          </div>
          <Badge
            variant="outline"
            className="border-sky-300/50 bg-sky-400/10 text-[10px] uppercase tracking-wide text-sky-100"
          >
            Beta
          </Badge>
        </div>
        <button
          type="button"
          onClick={onDownloadDigest}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#54FFD4] hover:text-[#54FFD4]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 13.3333L15 8.33325H11.6667V2.49992H8.33333V8.33325H5L10 13.3333ZM5 15.8333V17.4999H15V15.8333H5Z"
              fill="currentColor"
            />
          </svg>
          Download digest
        </button>
      </div>
    </div>
  );
};

// Preloaded Prompt Selector Component
const PreloadedPrompts = ({
  category,
  onPromptSelect
}: {
  category: string;
  onPromptSelect: (prompt: string) => void;
}) => {
  const prompts = PRELOADED_PROMPTS[category as keyof typeof PRELOADED_PROMPTS] || PRELOADED_PROMPTS.general;

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-slate-300 mb-3">Suggested questions to get you started:</h4>
      <div className="grid gap-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onPromptSelect(prompt)}
            className="text-left p-3 text-sm bg-slate-700/60 border border-slate-600/50 text-slate-200 rounded-xl hover:border-slate-500/70 hover:bg-slate-700/80 hover:shadow-sm transition-all"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};

// Cuisine Popularity Breakout Modal
const CuisinePopularityBreakout = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
              <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z" fill="white"/>
                <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill="white"/>
                <path d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z" fill="white"/>
                <path d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z" fill="white"/>
                <path d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z" fill="white"/>
                <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill="white"/>
                <path d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z" fill="white"/>
                <path d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z" fill="white"/>
                <path d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z" fill="white"/>
                <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
              </svg>
            </div>

            <div className="text-white text-center text-base font-medium leading-[130%] flex-1">
              Cuisine Popularity Analysis
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="relative z-10 h-full">
            {/* Left Side Content */}
            <div className="absolute left-20 top-40">
              <div className="text-white text-lg font-medium mb-2">Market Share Analysis</div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[52px] font-semibold leading-none">35%</span>
                <svg width="19" height="19" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#54FFD4"/>
                </svg>
              </div>
              <div className="text-white text-lg font-semibold leading-[140%] max-w-[346px]">
                Middle Eastern cuisine dominates Abu Dhabi's culinary landscape, followed by American fast-food chains and authentic Indian restaurants. Local preferences drive strong cultural and traditional dining experiences.
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-[81px] top-[146px] w-[381px] h-[501px]">
              <div className="w-full h-full rounded-[24px] bg-white/14 backdrop-blur-md">
                {/* AI Business Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                      alt="AI Business"
                      className="w-16 h-16 rounded-full border border-[#54FFD4]"
                    />
                    <div>
                      <div className="text-white text-lg font-semibold">AI Business</div>
                      <div className="flex items-center gap-1">
                        {[5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499, 16.898, 4.534].map((width, index) => (
                          <div
                            key={index}
                            className="bg-[#54FFD4] rounded-full transform rotate-90"
                            style={{
                              width: '3.297px',
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
                  <div className="text-white text-base font-normal uppercase tracking-wide mb-2">CUISINE ANALYSIS</div>
                  <div className="text-white text-2xl font-semibold mb-6">Popular Cuisines</div>
                  <div className="text-white text-lg leading-[140%] space-y-4">
                    <div>
                      <span className="font-semibold">Middle Eastern (35%):</span>
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
              <div className="w-full h-full rounded-[24px] bg-white/14 backdrop-blur-md">
                <div className="p-6">
                  <div className="text-white text-lg mb-2">INSIGHTS</div>
                  <div className="text-white text-2xl font-semibold mb-4">Abu Dhabi Cuisine Trends</div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-white text-lg mb-1">Fusion cuisine growth</div>
                      <div className="text-white text-[52px] font-semibold leading-none">15%</div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">Health-conscious demand</div>
                      <div className="text-white text-[52px] font-semibold leading-none">+8%</div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">Premium casual dining</div>
                      <div className="text-white text-[52px] font-semibold leading-none">Gap</div>
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
const CompetitorAnalysisBreakout = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
              <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z" fill="white"/>
                <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill="white"/>
                <path d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z" fill="white"/>
                <path d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z" fill="white"/>
                <path d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z" fill="white"/>
                <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill="white"/>
                <path d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z" fill="white"/>
                <path d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z" fill="white"/>
                <path d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z" fill="white"/>
                <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
              </svg>
            </div>

            <div className="text-white text-center text-base font-medium leading-[130%] flex-1">
              Competitor Analysis
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Content */}
          <div className="relative z-10 h-full">
            {/* Left Side Content */}
            <div className="absolute left-20 top-40">
              <div className="text-white text-lg font-medium mb-2">Market Leaders</div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[52px] font-semibold leading-none">4.6</span>
                <svg width="19" height="19" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#54FFD4"/>
                </svg>
              </div>
              <div className="text-white text-lg font-semibold leading-[140%] max-w-[346px]">
                Top competitors maintain premium positioning through exceptional locations, authentic cuisine, and superior service delivery. Market gaps exist in affordable luxury and family-friendly fine dining.
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-[81px] top-[146px] w-[381px] h-[501px]">
              <div className="w-full h-full rounded-[24px] bg-white/14 backdrop-blur-md">
                {/* AI Business Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                      alt="AI Business"
                      className="w-16 h-16 rounded-full border border-[#54FFD4]"
                    />
                    <div>
                      <div className="text-white text-lg font-semibold">AI Business</div>
                      <div className="flex items-center gap-1">
                        {[5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499, 16.898, 4.534].map((width, index) => (
                          <div
                            key={index}
                            className="bg-[#54FFD4] rounded-full transform rotate-90"
                            style={{
                              width: '3.297px',
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
                  <div className="text-white text-base font-normal uppercase tracking-wide mb-2">COMPETITOR ANALYSIS</div>
                  <div className="text-white text-2xl font-semibold mb-6">Market Leaders</div>
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
              <div className="w-full h-full rounded-[24px] bg-white/14 backdrop-blur-md">
                <div className="p-6">
                  <div className="text-white text-lg mb-2">INSIGHTS</div>
                  <div className="text-white text-2xl font-semibold mb-4">Competitive Landscape</div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-white text-lg mb-1">Average rating</div>
                      <div className="text-white text-[52px] font-semibold leading-none">4.5★</div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">Market gaps identified</div>
                      <div className="text-white text-[52px] font-semibold leading-none">3</div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">Premium positioning</div>
                      <div className="text-white text-[52px] font-semibold leading-none">$$$$</div>
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
const GapAnalysisBreakout = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
              <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z" fill="white"/>
                <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill="white"/>
                <path d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z" fill="white"/>
                <path d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z" fill="white"/>
                <path d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z" fill="white"/>
                <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill="white"/>
                <path d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z" fill="white"/>
                <path d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z" fill="white"/>
                <path d="M29.3921 31.1085C27.593 32.4376 26.4041 33.1099 25.262 33.1099C22.8216 33.1099 20.8973 31.0616 20.8973 31.0616L20.209 33.7197C21.6639 34.8455 23.416 35.4866 25.262 35.5804C26.7482 35.5804 28.2032 34.9237 30.1587 33.5946L29.5016 30.999L29.3921 31.1085Z" fill="white"/>
                <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
              </svg>
            </div>

            <div className="text-white text-center text-base font-medium leading-[130%] flex-1">
              Investor Journey for a Restaurant
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Top Banner */}
          <div className="absolute top-[-112px] left-[541px] w-[605px] h-[103px] z-20">
            <div className="w-full h-full rounded-[20px] bg-gradient-to-b from-white to-[#F2F1EE] shadow-[0_0_10px_10px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-5 h-full px-5">
                <div className="flex-1">
                  <div className="text-[#282B3E] font-semibold text-sm mb-1">Analysis Complete</div>
                  <div className="text-[#282B3E] text-sm leading-[19px]">
                    Comprehensive gap analysis and market opportunities identified for Abu Dhabi restaurant sector.
                  </div>
                </div>
                <div className="w-[138px] h-10 rounded-full bg-gradient-to-b from-[#5B6DDE] to-[#273489] flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">View details</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="relative z-10 h-full">
            {/* Left Side Content */}
            <div className="absolute left-20 top-40">
              <div className="text-white text-lg font-medium mb-2">Footfall insights</div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-white text-[52px] font-semibold leading-none">6.3%</span>
                <svg width="19" height="19" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.5 0L16.7272 14.25H0.272758L8.5 0Z" fill="#54FFD4"/>
                </svg>
              </div>
              <div className="text-white text-lg font-semibold leading-[140%] max-w-[346px]">
                The Abu Dhabi Corniche presents a dynamic and lucrative environment for F&B businesses, driven by a mix of residents, tourists, and a strong culture of dining out. Here is an overview of the key insights for the F&B sector in this area:
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="absolute right-[81px] top-[146px] w-[381px] h-[501px]">
              <div className="w-full h-full rounded-[24px] bg-white/14 backdrop-blur-md">
                {/* AI Business Header */}
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                      alt="AI Business"
                      className="w-16 h-16 rounded-full border border-[#54FFD4]"
                    />
                    <div>
                      <div className="text-white text-lg font-semibold">AI Business</div>
                      <div className="flex items-center gap-1">
                        {[5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499, 16.898, 4.534].map((width, index) => (
                          <div
                            key={index}
                            className="bg-[#54FFD4] rounded-full transform rotate-90"
                            style={{
                              width: '3.297px',
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
                  <div className="text-white text-base font-normal uppercase tracking-wide mb-2">GAP ANALYSIS</div>
                  <div className="text-white text-2xl font-semibold mb-6">Abu Dhabi Corniche</div>
                  <div className="text-white text-lg leading-[140%]">
                    <span className="font-semibold">Insights for this area:</span>
                    <br />
                    Emirati Fusion Cuisine Japanese influences new trend
                    <br /><br />
                    Demand for a formal evening dining experience. Waterfront locations
                    <br />
                    High rise luxury experience popular.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Insights Bar */}
            <div className="absolute bottom-[81px] left-[81px] w-[1033px] h-[124px]">
              <div className="w-full h-full rounded-[24px] bg-white/14 backdrop-blur-md">
                <div className="p-6">
                  <div className="text-white text-lg mb-2">INSIGHTS</div>
                  <div className="text-white text-2xl font-semibold mb-4">Abu Dhabi Corniche</div>
                  <div className="grid grid-cols-3 gap-8">
                    <div>
                      <div className="text-white text-lg mb-1">Expats in area</div>
                      <div className="text-white text-[52px] font-semibold leading-none">85-90%</div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">Eat out weekly</div>
                      <div className="text-white text-[52px] font-semibold leading-none">2.5x</div>
                    </div>
                    <div>
                      <div className="text-white text-lg mb-1">% who dine out</div>
                      <div className="text-white text-[52px] font-semibold leading-none">78%</div>
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
const ChatIcon = ({ isAnimated = false, isDark = false }: { isAnimated?: boolean; isDark?: boolean }) => {
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

  const color = isDark ? "#169F9F" : "#FFF";

  return (
    <div className="inline-flex justify-center items-center gap-0.5 w-12 h-8">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={`transform rotate-90 rounded-full transition-all duration-300 ${
            isAnimated ? 'animate-pulse' : ''
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

const TammLogo = ({ className = "", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg
    className={className}
    width="111"
    height="50"
    viewBox="0 0 111 50"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M65.7294 29.4802V38.9245H63.8521V29.4802H60.2383V27.6821H69.3588V29.4802H65.7294Z" fill={color} />
    <path d="M71.2519 34.5151L73.223 34.2493C73.6611 34.1867 73.7862 33.9678 73.7862 33.6864C73.7862 33.0296 73.3482 32.5136 72.3313 32.5136C71.5178 32.4667 70.8138 33.0765 70.7669 33.9053C70.7669 33.9053 70.7669 33.9053 70.7669 33.9209L69.0773 33.5456C69.2181 32.2166 70.4071 31.0282 72.3 31.0282C74.6623 31.0282 75.554 32.3729 75.554 33.9053V37.7518C75.554 38.1583 75.5853 38.5805 75.6479 38.987H73.9583C73.8957 38.6587 73.8644 38.3303 73.8801 38.0019C73.3638 38.7838 72.4721 39.2528 71.5178 39.2059C70.1881 39.3154 69.0304 38.3147 68.9365 37.0012C68.9365 36.9543 68.9365 36.923 68.9365 36.8761C68.9522 35.4532 69.9534 34.7027 71.2519 34.5151ZM73.7862 35.7347V35.3594L71.7838 35.6565C71.2206 35.7503 70.7669 36.0631 70.7669 36.7041C70.7669 37.267 71.2206 37.7205 71.7838 37.7205C71.8151 37.7205 71.8463 37.7205 71.8776 37.7205C72.9101 37.7361 73.7862 37.2358 73.7862 35.7347Z" fill={color} />
    <path d="M77.7754 38.9245V31.2002H79.5275V32.1852C80.0125 31.4191 80.8573 30.9656 81.7647 30.9813C82.7346 30.9344 83.642 31.466 84.0643 32.3416C84.565 31.4503 85.5349 30.9187 86.5518 30.9813C87.9441 30.9813 89.2582 31.8725 89.2582 33.9209V38.9245H87.4904V34.2336C87.4904 33.3267 87.0367 32.6543 86.0199 32.6543C85.1438 32.6543 84.4242 33.3736 84.4242 34.2649C84.4242 34.2961 84.4242 34.3118 84.4242 34.343V38.9245H82.6251V34.2492C82.6251 33.358 82.187 32.67 81.1545 32.67C80.2941 32.6543 79.5745 33.358 79.5588 34.218C79.5588 34.2649 79.5588 34.3118 79.5588 34.3587V38.9401L77.7754 38.9245Z" fill={color} />
    <path d="M91.5107 38.9245V31.2002H93.2629V32.1852C93.7479 31.4191 94.5926 30.9656 95.5 30.9813C96.4699 30.9344 97.3773 31.466 97.7997 32.3416C98.3003 31.4503 99.2546 30.9187 100.271 30.9813C101.664 30.9813 102.978 31.8725 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.052 32.6543C99.9586 32.6387 99.8647 32.6387 99.7865 32.6387C98.9104 32.6387 98.1908 33.358 98.1908 34.2492C98.1908 34.2805 98.1908 34.2961 98.1908 34.3274V38.9088H96.4074V34.2336C96.5012 33.4674 95.9693 32.7638 95.2028 32.6543C95.1089 32.6387 95.015 32.6387 94.9368 32.6387C94.0764 32.6231 93.3568 33.3267 93.3411 34.1867C93.3411 34.2336 93.3411 34.2805 93.3411 34.3274V38.9088L91.5107 38.9245Z" fill={color} />
    <path d="M101.07 12.5305C101.586 12.5775 102.04 12.2178 102.086 11.7018C102.086 11.6706 102.086 11.6393 102.086 11.608C102.024 11.0451 101.523 10.6229 100.96 10.6855C100.475 10.7324 100.1 11.1233 100.037 11.608C100.037 12.124 100.444 12.5305 100.96 12.5462C100.991 12.5462 101.038 12.5462 101.07 12.5305Z" fill={color} />
    <path d="M103.51 10.7011C102.994 10.6542 102.54 11.0295 102.493 11.5611C102.493 11.5924 102.493 11.608 102.493 11.6393C102.556 12.2022 103.056 12.6244 103.62 12.5618C104.105 12.5149 104.48 12.124 104.543 11.6393C104.543 11.1233 104.12 10.7011 103.588 10.7011C103.557 10.6855 103.541 10.6855 103.51 10.7011Z" fill={color} />
    <path d="M69.6404 18.3629C69.6404 18.2378 69.6404 18.1127 69.6404 17.972C69.6404 15.8142 68.3263 14.3756 66.3552 14.3756C64.7125 14.3131 63.2889 15.5327 63.1012 17.1745C61.2864 17.2683 60.2383 18.4723 60.2383 20.505V22.741H62.0061V20.8021C62.0061 19.8014 62.3346 19.1134 63.1325 19.0039C63.4453 20.5207 64.8064 21.5839 66.3395 21.5057C67.3877 21.5526 68.3733 21.0679 68.999 20.2236H102.963V13.5782H101.179V18.3629H69.6404ZM67.857 17.9251C67.857 18.957 67.2938 19.645 66.3552 19.645C65.5104 19.645 64.8064 18.9727 64.8064 18.1127C64.8064 18.0501 64.8064 17.9876 64.822 17.9251C64.822 16.8774 65.4321 16.1738 66.3552 16.1738C67.2625 16.1738 67.857 16.8774 67.857 17.9251Z" fill={color} />
    <path d="M27.4986 23.1028L26.8103 20.3821C26.3253 20.5072 25.8247 20.5854 25.3241 20.601C24.8078 20.5541 24.2759 20.4916 23.7753 20.3821L23.0557 23.0716C23.8222 23.2905 24.6044 23.3999 25.4023 23.3999C26.1063 23.3999 26.8103 23.3061 27.4986 23.1028Z" fill={color} />
    <path d="M29.3916 31.1085C27.5925 32.4376 26.4036 33.1099 25.2616 33.1099C22.8211 33.1099 20.8968 31.0616 20.8968 31.0616L20.2085 33.7197C21.6634 34.8455 23.4155 35.4866 25.2616 35.5804C26.7478 35.5804 28.2027 34.9237 30.1582 33.5946L29.5011 30.999L29.3916 31.1085Z" fill={color} />
    <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill={color} />
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
          className="w-0.5 bg-[#54FFD4] rounded-full transition-all duration-300"
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

const KHALID_AVATAR =
  "https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131";

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



const DashboardView = ({ onBack, onSendMessage }: { onBack: () => void; onSendMessage?: (message: string) => void }) => (
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
          <svg width="18" height="18" className="sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Back</span>
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
        className="mx-auto mb-8 w-full max-w-[605px] h-[103px] rounded-[20px] bg-gradient-to-b from-white to-[#F2F1EE] shadow-[0_0_10px_10px_rgba(0,0,0,0.07)]"
      >
        <div className="flex items-center gap-5 h-full px-5">
          <div className="flex-1">
            <div className="text-[#282B3E] font-semibold text-sm mb-1">Research Complete</div>
            <div className="text-[#282B3E] text-sm leading-[19px]">
              Your comprehensive restaurant investment analysis is ready for review.
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
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20"
          >
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                alt="AI Assistant"
                className="w-16 h-16 rounded-full border border-[#54FFD4]"
              />
              <div>
                <h3 className="text-white text-lg font-semibold">AI Business</h3>
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
                  {[5.77, 11.95, 19.78, 13.19, 8.66, 23.08, 30.5, 16.9, 4.53].map((height, index) => (
                    <motion.div
                      key={index}
                      className="bg-[#54FFD4] rounded-full"
                      style={{
                        width: '3px',
                        height: `${height}px`,
                        transform: 'rotate(-90deg)'
                      }}
                      animate={{
                        height: [`${height * 0.5}px`, `${height}px`, `${height * 0.7}px`],
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
              Analysis complete. This dashboard synthesizes all insights from our conversation about restaurant opportunities in Abu Dhabi.
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openCompetitorBreakout'))}
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
            className="bg-white rounded-[33px] p-4 shadow-lg border border-[#EFEFEF]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-black text-[11px] font-semibold">Visitor Taste Trends</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6.24" cy="6.24" r="4.5" fill="#888888"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M6.97 4.69C7.04 4.57 7.08 4.42 7.08 4.27C7.08 3.81 6.71 3.43 6.24 3.43C5.78 3.43 5.4 3.81 5.4 4.27C5.4 4.74 5.78 5.12 6.24 5.12C6.55 5.12 6.83 4.94 6.97 4.69ZM5.68 5.68H5.96H6.52C6.83 5.68 7.08 5.93 7.08 6.24V6.8V9.05C7.08 9.36 6.83 9.61 6.52 9.61C6.21 9.61 5.96 9.36 5.96 9.05V7.22C5.96 6.99 5.77 6.8 5.54 6.8C5.31 6.8 5.12 6.61 5.12 6.38V6.24C5.12 6.04 5.22 5.87 5.37 5.77C5.46 5.71 5.57 5.68 5.68 5.68Z" fill="white"/>
                </svg>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[#878787] text-[10px] mb-1">Total survey this month</div>
              <div className="text-black text-2xl font-semibold">1230</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-1 border border-[#D9D9D9] rounded-full bg-[#EEE] text-xs">
                  <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                    <path d="M4.87 3.02V7.58H4.12V3.02L2.11 5.03L1.58 4.5L4.49 1.59L7.41 4.5L6.88 5.03L4.87 3.02Z" fill="#434343"/>
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
                  <span className="text-[8px] text-[#878787] text-center">Tourists lean toward Emirati + Asian</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-24 bg-[#429195] rounded mb-2" />
                  <span className="text-[8px] text-[#878787] text-center">Locals prefer Emirati + Mediterranean</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-5 h-10 bg-[#A02E1F] rounded mb-2" />
                  <span className="text-[8px] text-[#878787] text-center">Expats like Emirati + Indian</span>
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
            className="bg-white/14 backdrop-blur-md rounded-3xl p-8 h-full"
          >
            <h2 className="text-white text-xl font-semibold mb-8">
              Popularity of cuisines in Abu Dhabi
            </h2>

            <div className="space-y-6">
              {/* Middle Eastern */}
              <div className="border-b border-white/18 pb-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-white font-bold text-sm">Middle Eastern</h3>
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">Popularity</span>
                    <div className="text-white text-sm">30-35%</div>
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">Supporting Context</span>
                    <div className="text-white text-sm">Cultural resonance, traditional appeal</div>
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
                    <div className="text-white text-sm">Fast-food dominance, familiarity, chain presence</div>
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
                    <div className="text-white text-sm">Large expat community, flavor alignment with local preferences</div>
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
            <div className="text-white text-8xl lg:text-[100px] font-bold leading-none">78%</div>
            <div className="text-white text-sm mt-2">Residents eat out twice a week</div>
          </motion.div>

          {/* Map Visualization */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="rounded-3xl overflow-hidden"
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/6217a05a0af8f9420e0485cc166613634d45f299?width=634"
              alt="Abu Dhabi Map with Demographics"
              className="w-full h-auto rounded-3xl"
            />
          </motion.div>

          {/* Additional Chart */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="rounded-3xl overflow-hidden"
          >
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/eade8edabdbb717ecdef1b65c3b40e5d1928605a?width=418"
              alt="Market Analysis Chart"
              className="w-full h-auto rounded-3xl"
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
            if (e.key === 'Enter' && e.currentTarget.value.trim() && onSendMessage) {
              onSendMessage(e.currentTarget.value.trim());
              e.currentTarget.value = '';
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
        <TammLogo className="w-16 sm:w-20 lg:w-[84px] text-[#0B0C28]" color="#0B0C28" />
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
            <path d="M15 19L8 12L15 5" stroke="#0B0C28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          Your comprehensive restaurant investment analysis is ready. From market research to competitor analysis,
          every insight has been compiled for your investment decision.
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
              onClick={() => window.dispatchEvent(new CustomEvent('openGapAnalysisBreakout'))}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#54FFD4] to-[#169F9F] text-[#042B28] px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              View Gap Analysis
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2h-4"/>
                <path d="M9 7l3-3 3 3"/>
                <path d="M12 4v8"/>
              </svg>
            </button>
            <button className="inline-flex items-center gap-3 bg-gradient-to-r from-[#5B6DDE] to-[#273489] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
              Download Complete Report
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
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

const DiscoveryCompilationCard = ({ onViewDashboard }: { onViewDashboard?: () => void }) => {
  const handleOpenDashboard = () => {
    if (onViewDashboard) {
      onViewDashboard();
    }
  };

  const handleOpenCuisineBreakout = () => {
    // Dispatch custom event to trigger the breakout modal
    window.dispatchEvent(new CustomEvent('openCuisineBreakout'));
  };

  return (
    <div className="w-full max-w-[471px] mx-auto">
      <div className="rounded-[20px] sm:rounded-[24px] bg-gradient-to-br from-[#0B0F2C]/95 via-[#101a43]/90 to-[#152d63]/85 backdrop-blur-xl border border-[#0B0C28]/20 shadow-[0_20px_50px_rgba(7,12,32,0.5)] overflow-hidden">
        {/* AI Business Header */}
        <div className="flex flex-col p-6 pb-8">
          <div className="flex items-center gap-2 mb-8">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
              alt="AI Assistant"
              className="w-16 h-16 rounded-full border border-[#54FFD4]"
            />
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold mb-2">AI Business</h3>
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
                {[5.77, 11.95, 19.78, 13.19, 8.66, 23.08, 30.5, 16.9, 4.53].map((height, index) => (
                  <motion.div
                    key={index}
                    className="bg-[#54FFD4] rounded-full"
                    style={{
                      width: '3px',
                      height: `${Math.max(3, height * 0.8)}px`,
                      transform: 'rotate(-90deg)'
                    }}
                    animate={{
                      height: [`${Math.max(3, height * 0.5)}px`, `${height}px`, `${Math.max(3, height * 0.7)}px`],
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
                  <p className="text-white font-bold text-sm mb-1">Popularity</p>
                  <p className="text-white text-sm leading-[120%]">30-35%</p>
                </div>
                <div>
                  <p className="text-white font-bold text-sm mb-1">Supporting Context</p>
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
                    Large expat community, flavor alignment with local preferences
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={handleOpenCuisineBreakout}
              className="inline-flex items-center gap-2 rounded-full border border-[#54FFD4]/40 px-4 py-2 text-sm font-semibold text-[#54FFD4] transition hover:bg-[#54FFD4]/10"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Detailed breakdown
            </button>
            <button
              type="button"
              onClick={handleOpenDashboard}
              className="inline-flex items-center gap-2 rounded-full bg-[#54FFD4] px-4 py-2 text-sm font-semibold text-[#042B28] shadow-md shadow-[#54FFD4]/40 transition hover:bg-[#42f6c9]"
            >
              View complete analysis
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3.33337L7.05719 4.27618L10.3905 7.61951H3.33331V8.95284H10.3905L7.05719 12.2762L8 13.2189L12.6666 8.55228L8 3.33337Z"
                  fill="#042B28"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({
  message,
  onActionClick,
  isOnLightBackground = false,
}: {
  message: BusinessMessage;
  onActionClick?: (action: string) => void;
  isOnLightBackground?: boolean;
}) => {
  const shouldShowBudgetButton =
    message.isAI &&
    (message.content.includes("AED 10,000 to AED 30,000") ||
     message.content.includes("AED 6,500,000 to AED 14,000,000") ||
     message.content.includes("set up costs"));

  return (
    <div
      className={cn(
        "flex mb-3 sm:mb-4 gap-2 sm:gap-3 items-end",
        message.isAI ? "justify-start" : "justify-end",
      )}
    >
      {message.isAI && (
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-[#54FFD4] bg-white flex items-center justify-center flex-shrink-0">
          <ChatIcon isAnimated={false} isDark={true} />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] sm:max-w-[80%] flex flex-col gap-2 sm:gap-3",
          message.isAI ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm border",
            message.isAI
              ? isOnLightBackground
                ? "bg-white border-slate-300 text-slate-900 rounded-bl-sm"
                : "bg-slate-100 border-slate-300 text-slate-900 rounded-bl-sm shadow-md"
              : isOnLightBackground
                ? "bg-slate-200 border-slate-400 text-slate-900 rounded-br-sm"
                : "bg-[#54FFD4]/90 border-[#54FFD4] text-slate-900 rounded-br-sm shadow-md",
          )}
        >
          {message.rating && <StarRating rating={message.rating} />}
          <div className="text-inherit whitespace-pre-wrap break-words">
            {message.content}
          </div>
        </div>

        {/* Heat map visualization for location-related AI messages */}
        {message.isAI && message.type === "heat-map" && <AccessibleHeatMap />}

        {/* Budget ranges button */}
        {shouldShowBudgetButton && onActionClick && (
          <button
            onClick={() => onActionClick("budget-ranges")}
            className={cn(
              "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-colors shadow-lg text-sm sm:text-base",
              isOnLightBackground
                ? "bg-white border border-slate-300 hover:bg-slate-50 text-slate-900"
                : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 shadow-md"
            )}
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                className="sm:w-8 sm:h-8"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M26.9998 3.00003H4.99976C4.46932 3.00003 3.96061 3.21074 3.58554 3.58582C3.21047 3.96089 2.99976 4.4696 2.99976 5.00003V27C2.99976 27.5305 3.21047 28.0392 3.58554 28.4142C3.96061 28.7893 4.46932 29 4.99976 29H26.9998C27.5302 29 28.0389 28.7893 28.414 28.4142C28.789 28.0392 28.9998 27.5305 28.9998 27V5.00003C28.9998 4.4696 28.789 3.96089 28.414 3.58582C28.0389 3.21074 27.5302 3.00003 26.9998 3.00003ZM26.9998 5.00003V9.00003H4.99976V5.00003H26.9998ZM16.9998 11H26.9998V18H16.9998V11ZM14.9998 18H4.99976V11H14.9998V18ZM4.99976 20H14.9998V27H4.99976V20ZM16.9998 27V20H26.9998V27H16.9998Z"
                  fill="#169F9F"
                />
              </svg>
            </div>
            <span className="font-semibold">
              Budget ranges
            </span>
          </button>
        )}
      </div>
      {!message.isAI && (
        <img
          src={KHALID_AVATAR}
          alt="Khalid"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/50 flex-shrink-0"
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
    <div className="bg-white/14 rounded-3xl p-6 mt-4">
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
            src="https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131"
            alt="Khalid"
            className="w-16 h-16 rounded-full border-2 border-[#54FFD4]"
          />
          <div>
            <h4 className="text-white text-lg font-semibold">
              Investor Journey
            </h4>
            <p className="text-white/90 text-lg">
              <span className="font-semibold">Khalid</span> Entrepreneur
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
          Khalid, an F&B entrepreneur, go from a business idea to a thriving
          restaurant.
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
const BudgetRangesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const budgetRanges = [
    {
      range: "AED 10,000 - 30,000",
      title: "Basic Trade License",
      description: "Standard commercial license for restaurant operations",
      includes: ["Trade license registration", "Initial permits", "Basic approvals"]
    },
    {
      range: "AED 790 - 5,000",
      title: "Tajer/E-commerce License",
      description: "Limited operations license (no full restaurant service)",
      includes: ["Online sales permit", "Delivery operations", "Takeaway service"]
    },
    {
      range: "AED 50,000 - 150,000",
      title: "Premium Location License",
      description: "High-end areas with additional requirements",
      includes: ["Premium location fees", "Enhanced permits", "Tourism board approvals"]
    },
    {
      range: "AED 200,000 - 500,000",
      title: "Comprehensive Setup",
      description: "Full restaurant setup with all permits and approvals",
      includes: ["All licenses", "Health permits", "Fire safety", "Municipality approvals", "Tourism licenses"]
    }
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
        <div className="max-h-[85vh] min-h-[556px] overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)]">
          <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-7 lg:px-8">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                  Budget Analysis
                </span>
                <h3 className="mt-3 text-3xl font-semibold leading-tight text-slate-900">
                  Restaurant License Budget Ranges
                </h3>
                <p className="mt-2 max-w-2xl text-base text-slate-600">
                  Comprehensive breakdown of licensing costs and requirements for different restaurant types in Abu Dhabi.
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full border border-[#dbe9e3] bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                aria-label="Close budget ranges"
              >
                Close
              </button>
            </div>
          </div>

          <div className="px-6 py-6 lg:px-8 lg:py-7">
            <div className="grid gap-6 md:grid-cols-2">
              {budgetRanges.map((budget, index) => (
                <div
                  key={index}
                  className="rounded-[26px] border border-[#dbe9e3] bg-white p-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.18)] transition hover:shadow-[0_22px_48px_-28px_rgba(15,118,110,0.25)]"
                >
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-[#0f766e]">{budget.range}</span>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">{budget.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">{budget.description}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Includes</span>
                    <ul className="space-y-1">
                      {budget.includes.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0f766e]"></span>
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
                  className="p-2 rounded-md bg-[#54FFD4] text-slate-900 transition-colors hover:bg-[#3dd9b5]"
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
          <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#E6F7F3] border border-[#54FFD4]/60 shadow-sm">
            <div className="text-slate-900 text-sm leading-relaxed">
              {conversationMessages[0].content}
            </div>
          </div>
        </div>

        {/* AI Response */}
        <div className="flex justify-start gap-3">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
            alt="AI Assistant"
            className="w-8 h-8 rounded-full border border-[#54FFD4] object-cover flex-shrink-0"
          />
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
          <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-br-sm bg-[#E6F7F3] border border-[#54FFD4]/60 shadow-sm">
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
                className="p-2 rounded-md bg-[#54FFD4] text-slate-900 transition-colors hover:bg-[#3dd9b5]"
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
            className="relative z-10 w-full max-w-6xl"
            style={MODAL_MIN_DIMENSIONS}
          >
            <div className="max-h-[85vh] min-h-[556px] overflow-hidden rounded-[32px] border border-[#e2ede8] bg-white shadow-[0_24px_48px_-32px_rgba(11,64,55,0.25)]">
              <div className="border-b border-[#e2ede8] bg-[#f6faf8] px-6 py-7 lg:px-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                        alt="AI Business Assistant"
                        className="h-12 w-12 rounded-full border border-[#dbe9e3] object-cover"
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                          Heat map
                        </span>
                        <span className="inline-flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                          Commercial licenses
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-3xl font-semibold leading-tight text-slate-900">
                        Abu Dhabi F&B Hotspot Density
                      </h3>
                      <p className="max-w-2xl text-base text-slate-600">
                        Compare licensing concentration and live footfall
                        signals across the city&apos;s restaurant districts.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-stretch gap-3 lg:items-end">
                    <div className="flex items-center gap-3 rounded-full border border-[#dbe9e3] bg-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                        alt="Reviewer avatar"
                        className="h-9 w-9 rounded-full border border-[#dbe9e3] object-cover"
                      />
                      <div className="flex flex-col text-left lg:text-right">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                          Reviewer
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          AI Business Analyst
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-full border border-[#dbe9e3] bg-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
                        Progress
                      </span>
                      <div className="relative h-2.5 w-28 overflow-hidden rounded-full bg-[#e2ede8]">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0f766e] via-[#23b893] to-[#54ffd4] shadow-[0_1px_2px_rgba(15,118,110,0.4)]"
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
                              ? "bg-[#0f766e] text-white shadow-[0_12px_24px_-18px_rgba(15,118,110,0.45)]"
                              : "text-slate-600 hover:text-[#0f766e]",
                          )}
                        >
                          {mode === "heatmap" ? "Map view" : "Timeline"}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMapModal(false);
                        setHoveredLocation(null);
                      }}
                      className="self-end rounded-full border border-[#dbe9e3] bg-white px-3 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                      aria-label="Close heat map"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 lg:px-8 lg:py-7">
                {mapViewMode === "heatmap" ? (
                  <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                    <div className="relative flex h-full flex-col gap-5 rounded-[28px] border border-[#dbe9e3] bg-[#f6faf8] p-6 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.18)]">
                      <div className="relative flex-1 overflow-hidden rounded-[24px] border border-[#dbe9e3] bg-white">
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
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
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
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
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
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
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
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
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
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
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
                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#0f766e]">
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
                            <span className="h-2 w-8 rounded-full bg-[#0f766e]" />
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
                          className="rounded-full bg-[#0f766e] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_16px_30px_-22px_rgba(15,118,110,0.5)] transition hover:bg-[#0c5f58]"
                        >
                          Export insights
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-[#0f766e] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e] transition hover:bg-[#0f766e]/10"
                        >
                          Download CSV
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-[#dbe9e3] bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 transition hover:text-[#0f766e]"
                        >
                          Share view
                        </button>
                      </div>
                    </div>

                    <div className="flex h-full flex-col gap-4 rounded-[26px] border border-[#dbe9e3] bg-white p-5 text-slate-900 shadow-[0_18px_40px_-28px_rgba(15,118,110,0.18)]">
                      <div className="relative overflow-hidden rounded-[26px] border border-[#dbe9e3] bg-white p-5 shadow-[0_18px_36px_-28px_rgba(15,118,110,0.25)]">
                        <span className="absolute left-0 top-5 bottom-5 w-1.5 rounded-full bg-gradient-to-b from-[#0f766e] via-[#34d399] to-transparent" />
                        <div className="pl-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
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

                      <div className="flex-1 overflow-y-auto rounded-[26px] border border-[#dbe9e3] bg-white/70 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
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
                                  "relative overflow-hidden rounded-[24px] border border-[#dbe9e3] bg-white px-4 py-3 transition hover:border-[#0f766e]/50 hover:shadow-[0_16px_30px_-24px_rgba(15,118,110,0.3)]",
                                  isHighlighted &&
                                    "border-[#0f766e] shadow-[0_22px_48px_-26px_rgba(15,118,110,0.32)]",
                                )}
                                onMouseEnter={() => setHoveredLocation(spot.id)}
                                onMouseLeave={() => setHoveredLocation(null)}
                              >
                                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-gradient-to-b from-[#0f766e] via-[#34d399] to-transparent" />
                                <div className="pl-3">
                                  <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                                    <span>{spot.name}</span>
                                    <span className="text-slate-500">
                                      {spot.footfall}
                                    </span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                                    <span>{spot.density}</span>
                                    <span className="rounded-full bg-[#f6faf8] px-2 py-0.5 text-[10px] text-[#0f766e]">
                                      {spot.trend}
                                    </span>
                                  </div>
                                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e2ede8]">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#0f766e] via-[#23b893] to-[#54ffd4]"
                                      style={{ width }}
                                    />
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>

                      <div className="rounded-[26px] border border-[#dbe9e3] bg-[#f6faf8] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                        Powered by aggregated licensing &amp; mobility data
                        (updated weekly)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 rounded-[28px] border border-[#dbe9e3] bg-[#f6faf8] p-6">
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
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
                              "relative flex gap-4 rounded-[26px] border border-[#dbe9e3] bg-white px-5 py-4 transition hover:border-[#0f766e]/50 hover:shadow-[0_18px_36px_-28px_rgba(15,118,110,0.28)]",
                              isHighlighted &&
                                "border-[#0f766e] shadow-[0_22px_48px_-28px_rgba(15,118,110,0.35)]",
                            )}
                            onMouseEnter={() => setHoveredLocation(spot.id)}
                            onMouseLeave={() => setHoveredLocation(null)}
                          >
                            <div className="relative flex w-12 flex-col items-center">
                              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#0f766e]">
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span className="mt-2 h-full w-0.5 bg-gradient-to-b from-[#0f766e] via-[#34d399] to-transparent" />
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
                                <span className="rounded-full border border-[#dbe9e3] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e]">
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
                                  className="h-full rounded-full bg-gradient-to-r from-[#0f766e] via-[#23b893] to-[#54ffd4]"
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
                        className="rounded-full bg-[#0f766e] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-[0_16px_30px_-22px_rgba(15,118,110,0.5)] transition hover:bg-[#0c5f58]"
                      >
                        Export timeline
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-[#0f766e] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0f766e] transition hover:bg-[#0f766e]/10"
                      >
                        Download CSV
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-[#dbe9e3] bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 transition hover:text-[#0f766e]"
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
}: BusinessChatUIProps) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showCuisineCard, setShowCuisineCard] = useState(false);
  const [showCompetitorCard, setShowCompetitorCard] = useState(false);
  const [showGapAnalysisCard, setShowGapAnalysisCard] = useState(false);
  const [showPreloadedPrompts, setShowPreloadedPrompts] = useState(true);
  const [currentInput, setCurrentInput] = useState("");


  // Event listeners for breakout cards
  useEffect(() => {
    const handleOpenCuisineBreakout = () => setShowCuisineCard(true);
    const handleOpenCompetitorBreakout = () => setShowCompetitorCard(true);
    const handleOpenGapAnalysisBreakout = () => setShowGapAnalysisCard(true);

    window.addEventListener('openCuisineBreakout', handleOpenCuisineBreakout);
    window.addEventListener('openCompetitorBreakout', handleOpenCompetitorBreakout);
    window.addEventListener('openGapAnalysisBreakout', handleOpenGapAnalysisBreakout);

    return () => {
      window.removeEventListener('openCuisineBreakout', handleOpenCuisineBreakout);
      window.removeEventListener('openCompetitorBreakout', handleOpenCompetitorBreakout);
      window.removeEventListener('openGapAnalysisBreakout', handleOpenGapAnalysisBreakout);
    };
  }, []);

  // Function to handle preloaded prompt selection
  const handlePromptSelect = (prompt: string) => {
    setCurrentInput(prompt);
    setShowPreloadedPrompts(false);
    // Optionally auto-send the message
    handleSendMessage(prompt);
  };


  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const baseMessages =
      conversationFlows[category as keyof typeof conversationFlows] ||
      conversationFlows.general;
    const clonedMessages = baseMessages.map((message) => ({
      ...message,
      timestamp: new Date(message.timestamp),
      type: (message as any).type || "text",
    }));

    let seededMessages = clonedMessages;
    const trimmedInitial = initialMessage?.trim();

    if (trimmedInitial) {
      const userMessage = {
        id: `user-initial-${Date.now()}`,
        content: trimmedInitial,
        isAI: false,
        timestamp: new Date(),
        type: "text",
      } satisfies BusinessMessage;

      if (seededMessages.length > 0 && seededMessages[0].isAI === false) {
        const [, ...rest] = seededMessages;
        seededMessages = [userMessage, ...rest];
      } else {
        seededMessages = [userMessage, ...seededMessages];
      }
    }

    const newThread: ChatThread = {
      id: `thread-${Date.now()}-${Math.random()}`,
      title: getCategoryTitle(category),
      messages: seededMessages,
      view: "basic",
    };

    setThreads([newThread]);
    setActiveThreadId(newThread.id);
  }, [isOpen, category, initialMessage]);


  const activeThread = threads.find((t) => t.id === activeThreadId);

  const updateThread = (
    threadId: string,
    updates: Partial<Omit<ChatThread, "id">>,
  ) => {
    setThreads(
      threads.map((t) => (t.id === threadId ? { ...t, ...updates } : t)),
    );
  };

  const handleSetupBusiness = () => {
    if (activeThreadId) {
      updateThread(activeThreadId, { view: "investor-journey" });
    }
  };

  const handleNewTab = () => {
    // Alternate between different conversation flows
    const isExtendedFlow = threads.length % 2 === 1;

    if (isExtendedFlow) {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: "Detailed Restaurant Analysis",
        messages: [
          {
            id: "user-detailed-cost-question",
            content:
              "What would the set up and running costs be to open a F&B Restaurant, with 300 covers?",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-detailed-cost-response",
            content:
              "Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs",
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: "user-demographic-question-2",
            content:
              "Can you give me any demographic data you have for this area.",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-demographic-response-2",
            content:
              "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: "user-corniche-question",
            content: "Great can you give me more details on The Corniche",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-corniche-response",
            content:
              "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.",
            isAI: true,
            timestamp: new Date(),
          },
        ],
        view: "basic",
      };
      setThreads([...threads, newThread]);
      setActiveThreadId(newThread.id);
    } else {
      const newThread: ChatThread = {
        id: `thread-${Date.now()}-${Math.random()}`,
        title: "Cost & Demographics",
        messages: [
          {
            id: "user-cost-question",
            content: "How much would it cost to open a restaurant",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-cost-response",
            content:
              "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.",
            isAI: true,
            timestamp: new Date(),
          },
          {
            id: "user-demographic-question",
            content:
              "Can you give me any demographic data you have for this area.",
            isAI: false,
            timestamp: new Date(),
          },
          {
            id: "ai-demographic-response",
            content:
              "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
            isAI: true,
            timestamp: new Date(),
          },
        ],
        view: "basic",
      };
      setThreads([...threads, newThread]);
      setActiveThreadId(newThread.id);
    }
  };

  const handleSendMessage = (message: string) => {
    if (!activeThreadId || !message.trim()) return;

    // Trim the message for consistency
    const trimmedMessage = message.trim();

    const lowerMessage = trimmedMessage.toLowerCase();

    // Check if this should trigger the Corniche detail view
    if (lowerMessage.includes("corniche") || lowerMessage.includes("cornich")) {
      createCorniceDetailThread(trimmedMessage);
      return;
    }

    const userMessage: BusinessMessage = {
      id: `user-${Date.now()}`,
      content: trimmedMessage,
      isAI: false,
      timestamp: new Date(),
      type: "text",
    };

    const activeThread = threads.find((t) => t.id === activeThreadId);

    const aiResponse: BusinessMessage = {
      id: `ai-${Date.now()}`,
      content: generateAIResponse(trimmedMessage),
      isAI: true,
      timestamp: new Date(),
      type: "text",
    };

    if (activeThread) {
      const updatedMessages = [
        ...activeThread.messages,
        userMessage,
        aiResponse,
      ];
      updateThread(activeThreadId, { messages: updatedMessages });
    }

    // Clear input and hide preloaded prompts after sending message
    setCurrentInput("");
    setShowPreloadedPrompts(false);
  };

  const createCorniceDetailThread = (userMessage: string) => {
    const newThread: ChatThread = {
      id: `corniche-detail-${Date.now()}`,
      title: "Corniche Area Analysis",
      messages: [
        {
          id: `user-${Date.now()}`,
          content: "What would the set up and running costs be to open a F&B Restaurant, with 300 covers?",
          isAI: false,
          timestamp: new Date(),
        },
        {
          id: `ai-${Date.now()}-1`,
          content: "Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs",
          isAI: true,
          timestamp: new Date(),
        },
        {
          id: `user-${Date.now()}-2`,
          content: "Can you give me any demographic data you have for this area.",
          isAI: false,
          timestamp: new Date(),
        },
        {
          id: `ai-${Date.now()}-3`,
          content: "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers:\nYas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10).\nAl Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10).\nSaadiyat Island �� 5k residents, 15k visitors; cultural/tourist draw (6/10).\nAl Reem Island – 30k residents, 35k daytime; dense community market (7/10).\nAl Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10).\nCorniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10).\nAl Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).",
          isAI: true,
          timestamp: new Date(),
          type: "corniche-detail",
        },
        {
          id: `user-${Date.now()}-4`,
          content: "Great can you give me more details on The Corniche",
          isAI: false,
          timestamp: new Date(),
        },
        {
          id: `ai-${Date.now()}-5`,
          content: "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.",
          isAI: true,
          timestamp: new Date(),
        },
      ],
      view: "basic",
    };
    setThreads([...threads, newThread]);
    setActiveThreadId(newThread.id);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Check for competitor-related queries and show competitor card
    if (lowerMessage.includes('competitor') || lowerMessage.includes('competition')) {
      setShowCompetitorCard(true);
      return "I've analyzed the competitive landscape for restaurants in Abu Dhabi. Based on our research, here are the top competitors and market positioning insights. You can view the detailed analysis in the card below.";
    }

    // Check for cuisine-related queries and show cuisine card
    if (lowerMessage.includes('cuisine') || lowerMessage.includes('popular') || lowerMessage.includes('food')) {
      setShowCuisineCard(true);
      return "Here's a comprehensive analysis of cuisine popularity in Abu Dhabi. Middle Eastern cuisine leads with 35% market share, followed by American and Indian cuisines. See the detailed breakdown in the analysis card.";
    }

    // Check for gap analysis queries and show gap analysis card
    if (lowerMessage.includes('gap') || lowerMessage.includes('opportunity')) {
      setShowGapAnalysisCard(true);
      return "I've identified several market gaps and opportunities in Abu Dhabi, particularly in the Corniche area. There's strong potential for Emirati fusion cuisine and formal evening dining experiences. Check out the detailed gap analysis below.";
    }

    if (
      lowerMessage.includes("corniche") &&
      (lowerMessage.includes("details") || lowerMessage.includes("more"))
    ) {
      return "The Corniche is a popular choice due to its high foot traffic and scenic views. It attracts both tourists and locals, especially during the cooler months. The area is known for its diverse range of dining options, from casual cafes to upscale restaurants, catering to a wide range of tastes and budgets.";
    }

    if (lowerMessage.includes("corniche") || lowerMessage.includes("cornich")) {
      setShowGapAnalysisCard(true);
      return "Abu Dhabi's Corniche is one of the most prestigious dining locations with ~20k daily leisure visitors and a scenic high-traffic zone rating of 8/10. The area attracts both tourists and locals, making it ideal for upscale restaurants. You can see detailed gap analysis and opportunities for this area in the card below.";
    }

    if (
      lowerMessage.includes("reports") ||
      lowerMessage.includes("deeper") ||
      lowerMessage.includes("generate")
    ) {
      return "I can generate detailed reports covering market analysis, competitor landscape, foot traffic patterns, seasonal variations, target demographics, pricing strategies, and location-specific recommendations for each area. What specific type of report would you like me to focus on?";
    }

    if (
      lowerMessage.includes("300 covers") ||
      lowerMessage.includes("f&b restaurant")
    ) {
      return "Estimated set up costs could range from: Rough Estimate for Total Set-Up Costs: AED 6,500,000 to AED 14,000,000+ Average monthly running costs: AED 545,000 to AED 1,355,000+ all depending on location, level of service offering, staffing and finishing. Here is a breakdown of the estimated set up and national average running costs";
    }

    if (
      lowerMessage.includes("cost") ||
      lowerMessage.includes("price") ||
      lowerMessage.includes("budget")
    ) {
      return "Estimated set up costs could range from: There isn't a single fixed price, but rather a range that can vary from approximately AED 10,000 to AED 30,000 for the trade license itself. Type of License: The cost can differ based on the type of license you get. A Tajer/e-commerce license that don't allow full restaurant operations start at AED 790.";
    }

    if (
      lowerMessage.includes("demographic") ||
      lowerMessage.includes("target") ||
      lowerMessage.includes("market")
    ) {
      return "Abu Dhabi's dining potential varies by zone, each offering unique demographics and footfall drivers: Yas Island – ~10k residents, 25k+ daily visitors; strong tourist hub (index 8/10). Al Maryah Island – 7k residents, 20k workers/visitors; luxury and business dining (7/10). Saadiyat Island – 5k residents, 15k visitors; cultural/tourist draw (6/10). Al Reem Island – 30k residents, 35k daytime; dense community market (7/10). Al Zahiyah – 12k residents, 20k+ daily; hotels and nightlife (8/10). Corniche – ~20k daily leisure visitors; scenic high-traffic zone (8/10). Al Raha / Khalifa City – 20k residents, 25k daily; family-focused community (6/10).";
    }

    return "I can help you with restaurant licensing, location analysis, cost estimates, and demographic data for Abu Dhabi. What specific information would you like to know?";
  };

  if (!isOpen) return null;

  const backgroundImage =
    activeThread?.view === "discover-experience"
      ? DISCOVER_EXPERIENCE_BACKGROUND
      : getCategoryBackground(category);
  const headerTitle =
    activeThread?.view === "discover-experience"
      ? `Your Investment Journey for ${getCategoryName(category)}`
      : getCategoryTitle(category);

  return (
    <QueryClientProvider client={queryClient}>
      <AnimatePresence>
        {isOpen && (
          <div key="chat-ui" className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full relative"
              style={{
                backgroundImage: "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* Gradient Background */}
              {/* Background gradients matching Figma design */}
              <div className="absolute inset-0 bg-white" />

              {/* First gradient blob */}
              <div
                className="absolute w-[1028px] h-[1580px] opacity-80"
                style={{
                  left: "-252px",
                  top: "-1048px",
                  background:
                    "linear-gradient(159deg, #AEAAFE 39.9%, #F0EEFD 71.79%)",
                  filter: "blur(140px)",
                  borderRadius: "50%",
                }}
              />

              {/* Second gradient blob */}
              <div
                className="absolute w-[936px] h-[834px] opacity-80"
                style={{
                  right: "-300px",
                  top: "84px",
                  background:
                    "linear-gradient(159deg, #AEAAFE 39.9%, #F0EEFD 71.79%)",
                  filter: "blur(140px)",
                  borderRadius: "50%",
                }}
              />

              {/* Box shadow overlay */}
              <div
                className="absolute inset-0"
                style={{
                  boxShadow:
                    "0 4px 4px 0 rgba(0, 0, 0, 0.25), 0 4px 4px 0 rgba(0, 0, 0, 0.25)",
                }}
              />


              {/* Header */}
              <div className="relative z-10 w-full h-[70px] sm:h-[87px] border-b border-white/30 bg-white/30 backdrop-blur-[40px]">
                <div className="flex items-center justify-center px-4 sm:px-6 lg:px-10 py-3 sm:py-5 h-full relative">
                  {/* Left side - Logo and back button */}
                  <div className="absolute left-4 sm:left-6 lg:left-10 flex items-center gap-2 sm:gap-4">
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
                      className="w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full border border-black/18 bg-transparent flex items-center justify-center hover:bg-black/5 transition-colors"
                    >
                      <svg
                        width="18"
                        height="18"
                        className="sm:w-5 sm:h-5 lg:w-6 lg:h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 12L5 12M5 12L11 18M5 12L11 6"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Center title */}
                  <div className="text-black text-sm sm:text-base font-medium text-center leading-[130%] max-w-[250px] sm:max-w-[383px] mx-2">
                    "Investor Journey for a Restaurant"
                  </div>

                </div>
              </div>

              {/* Chat Container */}
              <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-87px)] p-2 sm:p-4 lg:p-8">
                <div className="w-full max-w-4xl mx-auto bg-slate-900/85 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-700/50 shadow-xl">
                  {/* Chat Header with Tabs */}
                  <div className="p-3 sm:p-4 lg:p-6 border-b border-slate-600/30">
                    <div className="flex items-center gap-1 sm:gap-2 mb-4 -mx-1 sm:-mx-2 overflow-x-auto">
                      {threads.map((thread) => (
                        <button
                          key={thread.id}
                          onClick={() => setActiveThreadId(thread.id)}
                          className={cn(
                            "px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0",
                            activeThreadId === thread.id
                              ? "border-[#54FFD4] text-white bg-slate-800/50"
                              : "border-transparent text-slate-300 hover:text-white hover:border-slate-400/50 hover:bg-slate-800/30",
                          )}
                        >
                          {thread.title}
                        </button>
                      ))}
                      <button
                        onClick={handleNewTab}
                        className="ml-2 sm:ml-4 p-1.5 sm:p-2 rounded-full hover:bg-slate-700/50 text-slate-300 hover:text-white transition-colors flex-shrink-0"
                        aria-label="New Chat"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          className="sm:w-4 sm:h-4"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img
                        src="https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2F3b9d0a4072bc46a08a41458307d296ac?format=webp&width=800"
                        alt="AI Assistant"
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-[#54FFD4] object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-white text-base sm:text-lg font-semibold truncate">
                          AI Business
                        </h2>
                      </div>
                      <div className="hidden sm:block">
                        <SoundVisualization />
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
                    {activeThread?.messages.map((message) => {
                      const isJourneyIntro = Boolean(message.hasActions);


                      const displayContent = isJourneyIntro
                        ? "I have generated an investor journey below that will assist you. Your journey, powered by AI."
                        : message.content;

                      const enrichedMessage =
                        displayContent === message.content
                          ? message
                          : { ...message, content: displayContent };

                      return (
                        <MessageBubble
                          key={`${activeThread.id}-${message.id}`}
                          message={enrichedMessage}
                          onActionClick={(action) => {
                            if (action === "budget-ranges") {
                              setShowBudgetModal(true);
                            }
                          }}
                          isOnLightBackground={activeThread?.view === "investor-journey"}
                        />
                      );
                    })}

                    {/* Show analysis cards */}
                    {showCuisineCard && (
                      <div className="flex justify-start">
                        <CuisinePopularityCard className="max-w-lg" />
                      </div>
                    )}

                    {showCompetitorCard && (
                      <div className="flex justify-start">
                        <CompetitorAnalysisCard className="max-w-lg" />
                      </div>
                    )}

                    {showGapAnalysisCard && (
                      <div className="flex justify-start">
                        <GapAnalysisCard className="max-w-lg" />
                      </div>
                    )}

                    {/* Show investor journey card on basic view */}
                    {activeThread?.view === "basic" &&
                      activeThread?.messages.length >= 4 &&
                      activeThread?.messages.some(msg => msg.hasActions) && (
                        <InvestorJourneyCard
                          onClose={onClose}
                          onSetupBusiness={handleSetupBusiness}
                        />
                      )}

                    {/* Show investor journey content */}
                    {activeThread?.view === "investor-journey" && (
                      <div className="p-6">
                        <DiscoverExperienceView
                          category={category}
                          onSendMessage={handleSendMessage}
                          isStandalone={false}
                        />
                      </div>
                    )}

                    {/* Preloaded Prompts - Show when no messages or conversation is starting */}
                    {showPreloadedPrompts && activeThread && activeThread.messages.length <= 3 && (
                      <div className="mt-6">
                        <PreloadedPrompts
                          category={category}
                          onPromptSelect={handlePromptSelect}
                        />
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="p-3 sm:p-4 lg:p-6 border-t border-slate-600/30">
                    <div className="flex gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={currentInput}
                        onChange={(e) => setCurrentInput(e.target.value)}
                        placeholder="Ask about market opportunities, competitors, licensing requirements..."
                        className="flex-1 bg-slate-700/80 border border-slate-600/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-white placeholder-slate-400 text-sm sm:text-base outline-none focus:border-[#54FFD4]/70 focus:bg-slate-700/90 transition-all"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && currentInput.trim()) {
                            handleSendMessage(currentInput);
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (currentInput.trim()) {
                            handleSendMessage(currentInput);
                          }
                        }}
                        disabled={!currentInput.trim()}
                        className="bg-[#54FFD4] hover:bg-[#54FFD4]/90 disabled:bg-slate-600/50 disabled:text-slate-400 text-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all disabled:cursor-not-allowed"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m22 2-7 20-4-9-9-4Z"/>
                          <path d="M22 2 11 13"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}


        {/* Budget Ranges Modal */}
        <BudgetRangesModal
          key="budget-ranges-modal"
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
        />

      </AnimatePresence>
    </QueryClientProvider>
  );
}
