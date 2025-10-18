import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StageSlideNavigator, type StageSlide } from "./StageSlideNavigator";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle,
  Circle,
  FolderOpen,
  Loader2,
  PlayCircle,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";
import {
  PRIMARY_TRADE_NAME_AR,
  PRIMARY_TRADE_NAME_EN,
} from "./trade-name-constants";

type ComplianceStatus = "error" | "warning" | "success" | "info";
type InspectionSubmissionStatus = "idle" | "ready" | "submitted";
type PipelineStatus = "complete" | "active" | "pending";
type FeedbackWorkflowStatus = "draft" | "submitted" | "responded";
type ReadinessStatus = "pass" | "attention";

type ComplianceItem = {
  id: string;
  label: string;
  status: ComplianceStatus;
  detail: string;
};

type PipelineStep = {
  id: string;
  title: string;
  description: string;
  helper: string;
};

type ReadinessItem = {
  id: string;
  label: string;
  detail?: string;
  status: ReadinessStatus;
};

type TextVerificationRow = {
  id: string;
  language: string;
  registered: string;
  extracted: string;
  matchScore: number;
  status: "PASS" | "REVIEW";
};

type GrowthOpportunity = {
  id: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
};

type EvidenceFrameStatus = "pass" | "pending" | "flagged";

type EvidenceFrame = {
  id: string;
  src: string;
  alt: string;
  status: EvidenceFrameStatus;
};

type VideoEvidenceStatus = "processing" | "queued" | "synced";

type VideoEvidence = {
  id: string;
  filename: string;
  sizeMb: number;
  durationLabel: string;
  capturedOn: string;
  status: VideoEvidenceStatus;
  source: string;
  note: string;
  frames: EvidenceFrame[];
};

interface ComplianceGrowthFocusContentProps {
  journeyNumber?: string;
  growthUnlocked?: boolean;
  onComplianceReturn?: () => void;
  isCompliant?: boolean;
}

const DEFAULT_COMPLIANCE_ITEMS: ComplianceItem[] = [
  { id: "civil-defence", label: "Civil Defence", status: "success", detail: "Compliant" },
  { id: "ded-inspection", label: "DED inspection", status: "warning", detail: "29 days remaining" },
  { id: "food-safety", label: "Food & Safety inspection", status: "success", detail: "Pass" },
  { id: "employment-visas", label: "Employment visas", status: "success", detail: "Renewed" },
  { id: "tawtheeq", label: "Tawtheeq lease", status: "info", detail: "Expires in 320 days" },
];

const COMPLIANCE_STATUS_TOKENS: Record<
  ComplianceStatus,
  {
    Icon: React.ElementType;
    iconWrapperClass: string;
    iconClass: string;
    badgeClass: string;
    badgeLabel: string;
  }
> = {
  error: {
    Icon: AlertCircle,
    iconWrapperClass: "border border-red-400/40 bg-red-500/20 text-red-100",
    iconClass: "text-red-200",
    badgeClass: "border-red-200 bg-red-100 text-red-700",
    badgeLabel: "Urgent",
  },
  warning: {
    Icon: AlertTriangle,
    iconWrapperClass: "border border-amber-300/40 bg-amber-200/20 text-amber-100",
    iconClass: "text-amber-200",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    badgeLabel: "Action needed",
  },
  success: {
    Icon: CheckCircle,
    iconWrapperClass: "border border-emerald-200/50 bg-emerald-400/15 text-emerald-50",
    iconClass: "text-emerald-200",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeLabel: "Compliant",
  },
  info: {
    Icon: ShieldCheck,
    iconWrapperClass: "border border-slate-200/40 bg-slate-100/60 text-slate-500",
    iconClass: "text-slate-500",
    badgeClass: "border-slate-200 bg-white text-slate-500",
    badgeLabel: "Monitoring",
  },
};

const INSPECTION_PIPELINE_STEPS: PipelineStep[] = [
  {
    id: "ingest",
    title: "Secure video intake",
    description: "Video uploaded from Layla's workspace and encrypted for review.",
    helper: "14:32 GST • SHA-256 checksum verified",
  },
  {
    id: "sampling",
    title: "Frame sampling",
    description: "Extracting representative frames across exterior and interior walkthrough.",
    helper: "64 key frames prepared",
  },
  {
    id: "yolo",
    title: "YOLO signboard detection",
    description: "Detecting signage, Arabic lettering, and mounting compliance using CV model v8.2.",
    helper: "Confidence threshold 0.85",
  },
  {
    id: "ocr",
    title: "OCR text extraction",
    description: "Capturing bilingual trade name and license references with Polaris OCR.",
    helper: "Detected 3 high-signal lines",
  },
  {
    id: "verification",
    title: "Inspector queue",
    description: "Cross-checking extracted text with registration records before inspector review.",
    helper: "Routing to DED inspector queue",
  },
];

const PIPELINE_STATUS_TOKENS: Record<PipelineStatus, { wrapperClass: string; connectorClass: string; Icon: React.ElementType; iconClass: string }> = {
  complete: {
    wrapperClass: "border-[#0f766e] bg-[#0f766e] text-white",
    connectorClass: "bg-[#0f766e]/30",
    Icon: Check,
    iconClass: "h-4 w-4",
  },
  active: {
    wrapperClass: "border-[#0f766e] bg-[#f5faf7] text-[#0f766e]",
    connectorClass: "bg-[#0f766e]/30",
    Icon: Loader2,
    iconClass: "h-4 w-4 animate-spin",
  },
  pending: {
    wrapperClass: "border-[#d8e4df] bg-white text-[#d8e4df]",
    connectorClass: "bg-[#d8e4df]",
    Icon: Circle,
    iconClass: "h-3.5 w-3.5",
  },
};

const SIGNBOARD_QUALITY_SUMMARY = {
  status: "Suitable",
  confidence: 0.94,
  highlights: [
    "Illuminance measured at 428 lux across lettering",
    "High contrast between gold lettering and charcoal background",
    "Arabic and English typography aligned within 1.4° tolerance",
  ],
};

const PREMIS_READINESS_ITEMS: ReadinessItem[] = [
  {
    id: "entrance",
    label: "Entrance signboard illuminated",
    detail: "Measured lux ≥ 420 across captured frames",
    status: "pass",
  },
  {
    id: "interior",
    label: "Interior walkthrough recorded",
    detail: "Kitchen, counter, and dining zones documented",
    status: "pass",
  },
  {
    id: "storage",
    label: "Dry storage labeling",
    detail: "Shelf 3 expiry labels refreshed",
    status: "pass",
  },
  {
    id: "safety",
    label: "Emergency egress routes visible",
    detail: "Exit signage unobstructed in frames 195-212",
    status: "pass",
  },
];

const READINESS_STATUS_TOKENS: Record<ReadinessStatus, { label: string; className: string }> = {
  pass: {
    label: "Pass",
    className: "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]",
  },
  attention: {
    label: "Attention",
    className: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
  },
};

const TEXT_VERIFICATION_RESULTS: TextVerificationRow[] = [
  {
    id: "english",
    language: "English",
    registered: PRIMARY_TRADE_NAME_EN,
    extracted: PRIMARY_TRADE_NAME_EN,
    matchScore: 0.98,
    status: "PASS",
  },
  {
    id: "arabic",
    language: "Arabic",
    registered: PRIMARY_TRADE_NAME_AR,
    extracted: PRIMARY_TRADE_NAME_AR,
    matchScore: 0.96,
    status: "PASS",
  },
];

const GROWTH_OPPORTUNITIES: GrowthOpportunity[] = [
  {
    id: "delivery-expansion",
    title: "Activate delivery-only kitchen",
    subtitle: "Add a virtual brand with ADM and ADAFSA checks handled automatically.",
    buttonLabel: "Explore virtual kitchen",
  },
  {
    id: "event-catering",
    title: "Launch catering program",
    subtitle: "Onboard catering permits, vehicle endorsements, and staffing support.",
    buttonLabel: "Configure catering",
  },
  {
    id: "second-location",
    title: "Plan second location",
    subtitle: "Clone compliant documentation and run Polaris feasibility modeling.",
    buttonLabel: "Start expansion plan",
  },
];

const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024;
const MEGABYTE = 1024 * 1024;

const VIDEO_STATUS_TOKENS: Record<
  VideoEvidenceStatus,
  { label: string; className: string; helper: string }
> = {
  processing: {
    label: "Processing",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    helper: "Encrypting upload and preparing frame samples for inspectors.",
  },
  queued: {
    label: "Inspector queue",
    className: "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
    helper: "Awaiting inspector acknowledgement in the DED review queue.",
  },
  synced: {
    label: "Synced",
    className: "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]",
    helper: "Available in the TAMM evidence vault for future checks.",
  },
};

const EVIDENCE_FRAME_STATUS_TOKENS: Record<
  EvidenceFrameStatus,
  { label: string; badgeClass: string; helper: string }
> = {
  pass: {
    label: "Pass",
    badgeClass: "bg-emerald-500/95 text-white border border-emerald-300/60",
    helper: "Automation cleared this frame.",
  },
  pending: {
    label: "Analyzing",
    badgeClass: "bg-amber-500/95 text-white border border-amber-300/60",
    helper: "Frame is still being reviewed.",
  },
  flagged: {
    label: "Flagged",
    badgeClass: "bg-rose-500/95 text-white border border-rose-300/60",
    helper: "Inspector follow-up required for this frame.",
  },
};

const SIGNBOARD_FRAME_IMAGE_SETS: ReadonlyArray<ReadonlyArray<EvidenceFrame>> = [
  [
    {
      id: "frame-entrance-daylight",
      src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=640&q=80",
      alt: "Exterior restaurant signboard during daylight",
      status: "pass",
    },
    {
      id: "frame-night-illumination",
      src: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=640&q=80",
      alt: "Illuminated signboard captured at night",
      status: "pass",
    },
    {
      id: "frame-closeup-arabic",
      src: "https://images.unsplash.com/photo-1529429617124-aee0a9cea41f?auto=format&fit=crop&w=640&q=80",
      alt: "Close-up of bilingual lettering on signage",
      status: "pass",
    },
  ],
  [
    {
      id: "frame-interior-menu",
      src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=640&q=80",
      alt: "Interior counter with illuminated menu",
      status: "pass",
    },
    {
      id: "frame-glare-check",
      src: "https://images.unsplash.com/photo-1522199993-ffe49272d1b1?auto=format&fit=crop&w=640&q=80",
      alt: "Inspector reviewing signage glare levels",
      status: "flagged",
    },
    {
      id: "frame-exit-sign",
      src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=640&q=80",
      alt: "Exterior signage captured from street level",
      status: "pass",
    },
  ],
  [
    {
      id: "frame-mounting-check",
      src: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=640&q=80",
      alt: "Inspector verifying mounting height of signboard",
      status: "pending",
    },
    {
      id: "frame-lux-reading",
      src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=640&q=80",
      alt: "Lux meter capturing signboard illumination",
      status: "pass",
    },
    {
      id: "frame-entrance-wide",
      src: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=640&q=80",
      alt: "Wide shot of restaurant entrance signage",
      status: "pass",
    },
  ],
];

const DEFAULT_VIDEO_LIBRARY: VideoEvidence[] = [
  {
    id: "sync-20240321",
    filename: "marwah_exterior_walkthrough.mp4",
    sizeMb: 284.32,
    durationLabel: "04:18",
    capturedOn: "2024-03-21T09:20:00.000Z",
    status: "synced",
    source: "Polaris field kit",
    note: "Exterior signage capture with calibrated lux readings and multilingual text checks.",
    frames: SIGNBOARD_FRAME_IMAGE_SETS[0].map((frame) => ({ ...frame })),
  },
  {
    id: "sync-20240312",
    filename: "kitchen_operational_check.mov",
    sizeMb: 312.71,
    durationLabel: "05:02",
    capturedOn: "2024-03-12T12:05:00.000Z",
    status: "synced",
    source: "Workspace upload",
    note: "Interior walkthrough covering kitchen, storage, and guest areas for compliance snapshots.",
    frames: SIGNBOARD_FRAME_IMAGE_SETS[1].map((frame) => ({ ...frame })),
  },
  {
    id: "sync-20240228",
    filename: "signboard_night_inspection.webm",
    sizeMb: 198.42,
    durationLabel: "03:45",
    capturedOn: "2024-02-28T18:40:00.000Z",
    status: "queued",
    source: "Workspace upload",
    note: "Nighttime contrast capture staged for inspector acknowledgement and OCR validation.",
    frames: SIGNBOARD_FRAME_IMAGE_SETS[2].map((frame) => ({ ...frame })),
  },
];

const evidenceTimestampFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

const bytesToMegabytes = (bytes: number) => Number((bytes / MEGABYTE).toFixed(2));
const formatMegabytes = (value: number) => `${value.toFixed(2)} MB`;
const formatFileSize = (bytes: number) => formatMegabytes(bytesToMegabytes(bytes));
const formatEvidenceTimestamp = (iso: string) =>
  evidenceTimestampFormatter.format(new Date(iso));

const SUBMISSION_STATUS_TOKENS: Record<InspectionSubmissionStatus, { label: string; className: string }> = {
  idle: {
    label: "Awaiting upload",
    className: "border-[#d8e4df] bg-white text-slate-600",
  },
  ready: {
    label: "Ready to submit",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  submitted: {
    label: "Pending review",
    className: "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]",
  },
};

const FEEDBACK_STATUS_LABEL: Record<FeedbackWorkflowStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  responded: "Responded",
};

export function ComplianceGrowthFocusContent({
  journeyNumber = "0987654321",
  growthUnlocked = false,
  onComplianceReturn,
  isCompliant = false,
}: ComplianceGrowthFocusContentProps) {
  const { toast } = useToast();
  const [activeSlideId, setActiveSlideId] = React.useState<StageSlide["id"]>(
    "compliance",
  );
  const [complianceItems, setComplianceItems] = React.useState<ComplianceItem[]>(
    () => DEFAULT_COMPLIANCE_ITEMS,
  );
  const [pipelineIndex, setPipelineIndex] = React.useState<number>(2);
  const [submissionStatus, setSubmissionStatus] =
    React.useState<InspectionSubmissionStatus>("idle");
  const [feedbackStatus, setFeedbackStatus] =
    React.useState<FeedbackWorkflowStatus>("draft");
  const [feedbackNotes, setFeedbackNotes] = React.useState("");
  const [contactEmail, setContactEmail] = React.useState("layla@marwah.ae");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [pendingVideo, setPendingVideo] = React.useState<File | null>(null);
  const [videoLibrary, setVideoLibrary] = React.useState<VideoEvidence[]>(
    () => DEFAULT_VIDEO_LIBRARY,
  );
  const [libraryDialogOpen, setLibraryDialogOpen] = React.useState(false);
  const [isSubmittingVideo, setIsSubmittingVideo] = React.useState(false);
  const frameTimersRef = React.useRef<number[]>([]);

  const compliantCount = React.useMemo(() => {
    return complianceItems.filter((item) => item.status === "success").length;
  }, [complianceItems]);

  const pipelineStatuses = React.useMemo(() => {
    return INSPECTION_PIPELINE_STEPS.map((step, index) => {
      if (index < pipelineIndex) {
        return { ...step, status: "complete" as PipelineStatus };
      }
      if (index === pipelineIndex) {
        return { ...step, status: "active" as PipelineStatus };
      }
      return { ...step, status: "pending" as PipelineStatus };
    });
  }, [pipelineIndex]);

  const libraryPreview = React.useMemo(() => {
    return videoLibrary.slice(0, 3);
  }, [videoLibrary]);

  const latestVideoEvidence = React.useMemo(() => {
    return videoLibrary[0];
  }, [videoLibrary]);

  const evidenceGallery = React.useMemo(
    () =>
      videoLibrary
        .flatMap((item) =>
          item.frames.map((frame) => ({
            key: `${item.id}-${frame.id}`,
            frame,
            videoFilename: item.filename,
            capturedOn: item.capturedOn,
          })),
        )
        .sort(
          (a, b) =>
            new Date(b.capturedOn).getTime() - new Date(a.capturedOn).getTime(),
        )
        .slice(0, 6),
    [videoLibrary],
  );

  const handleDismissCompliance = React.useCallback(
    (id: string) => {
      setComplianceItems((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, status: "success", detail: "Resolved" } : item,
        ),
      );
      toast({
        title: "Marked as resolved",
        description: "We'll keep monitoring this obligation as automation progresses.",
      });
    },
    [toast],
  );

  const handleComplianceReturn = React.useCallback(() => {
    onComplianceReturn?.();
    toast({
      title: "Compliance action logged",
      description: "A licensing specialist will confirm once the authority acknowledges your submission.",
    });
    setActiveSlideId("automation");
  }, [onComplianceReturn, toast]);

  const resetPendingVideo = React.useCallback(() => {
    setPendingVideo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleVideoSelect = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      if (!file.type.startsWith("video/")) {
        toast({
          title: "Unsupported file type",
          description: "Upload MP4, MOV, or WebM walkthroughs for signboard verification.",
          variant: "destructive",
        });
        resetPendingVideo();
        setSubmissionStatus("idle");
        return;
      }

      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        toast({
          title: "Video exceeds size limit",
          description: "Each walkthrough must be 2 GB or smaller before encryption.",
          variant: "destructive",
        });
        resetPendingVideo();
        setSubmissionStatus("idle");
        return;
      }

      setPendingVideo(file);
      setSubmissionStatus("ready");
    },
    [resetPendingVideo, toast],
  );

  const handleRemovePendingVideo = React.useCallback(() => {
    if (!pendingVideo) {
      return;
    }

    resetPendingVideo();
    setSubmissionStatus("idle");
    toast({
      title: "Upload cleared",
      description: "Select a new walkthrough to keep inspectors updated.",
    });
  }, [pendingVideo, resetPendingVideo, toast]);

  const handleSubmitVideoEvidence = React.useCallback(() => {
    if (!pendingVideo) {
      toast({
        title: "Add a walkthrough video",
        description: "Select a signboard capture before submitting to inspectors.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingVideo(true);
    const videoToSubmit = pendingVideo;
    const evidenceId = `upload-${Date.now()}`;
    const capturedOn = new Date().toISOString();
    const baseVideo: Omit<VideoEvidence, "frames"> = {
      id: evidenceId,
      filename: videoToSubmit.name,
      sizeMb: bytesToMegabytes(videoToSubmit.size),
      durationLabel: "Duration pending analysis",
      capturedOn,
      status: "queued",
      source: "Workspace upload",
      note: "Polaris is extracting frames and forwarding the footage to inspectors.",
    };

    setVideoLibrary((previous) => {
      const frameSource =
        SIGNBOARD_FRAME_IMAGE_SETS[previous.length % SIGNBOARD_FRAME_IMAGE_SETS.length] ??
        SIGNBOARD_FRAME_IMAGE_SETS[0];
      const frames = frameSource.map((frame, index) => ({
        ...frame,
        id: `${frame.id}-${evidenceId}-${index}`,
        status: index === 0 ? "pending" : frame.status,
      }));

      const newEvidence: VideoEvidence = {
        ...baseVideo,
        frames,
      };

      return [newEvidence, ...previous];
    });

    setSubmissionStatus("submitted");
    setPipelineIndex((previous) =>
      previous >= INSPECTION_PIPELINE_STEPS.length - 1 ? previous : previous + 1,
    );
    toast({
      title: "Video submitted",
      description: `${videoToSubmit.name} is syncing to the inspector queue.`,
    });
    resetPendingVideo();

    const processingTimer = window.setTimeout(() => {
      setVideoLibrary((current) =>
        current.map((item) =>
          item.id === evidenceId
            ? {
                ...item,
                status: "processing",
                note: "Automation is sampling frames and preparing OCR checks.",
              }
            : item,
        ),
      );
    }, 1200);

    const syncedTimer = window.setTimeout(() => {
      setVideoLibrary((current) =>
        current.map((item) =>
          item.id === evidenceId
            ? {
                ...item,
                status: "synced",
                note: "Frames cleared and synced to the TAMM evidence vault.",
                frames: item.frames.map((frame) =>
                  frame.status === "pending"
                    ? { ...frame, status: "pass" as EvidenceFrameStatus }
                    : frame,
                ),
              }
            : item,
        ),
      );
    }, 2900);

    frameTimersRef.current.push(processingTimer, syncedTimer);

    setTimeout(() => {
      setIsSubmittingVideo(false);
    }, 600);
  }, [pendingVideo, resetPendingVideo, toast]);

  React.useEffect(() => {
    return () => {
      frameTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      frameTimersRef.current = [];
    };
  }, []);

  const handleSubmitFeedback = React.useCallback(() => {
    if (!feedbackNotes.trim()) {
      toast({
        title: "Add feedback notes",
        description: "Share at least one insight so the team can follow up.",
        variant: "destructive",
      });
      return;
    }

    setFeedbackStatus("submitted");
    toast({
      title: "Feedback sent",
      description: "Growth desk will respond within one business day.",
    });
  }, [feedbackNotes, toast]);

  const slides: StageSlide[] = [
    {
      id: "compliance",
      heading: "Compliance overview",
      description: `${compliantCount}/${complianceItems.length} obligations are fully compliant. Polaris monitors the rest automatically.`,
      content: (
        <div className="space-y-5">
          <div className="rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_26px_60px_-50px_rgba(15,23,42,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Journey number
                </p>
                <p className="text-lg font-semibold text-slate-900">{journeyNumber}</p>
              </div>
              <Badge className="inline-flex items-center gap-2 rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Compliance tracking
              </Badge>
            </div>
            <div className="mt-5 space-y-3">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                  Stage 5 • Compliance & growth
                </p>
                <h3 className="text-2xl font-semibold text-slate-900">
                  Stay compliant after launch
                </h3>
                <p className="text-sm text-slate-600">
                  Polaris watches every renewal, inspection, and dependency so you focus on operating the restaurant.
                </p>
              </div>
              <p className="text-sm text-slate-600">
                Polaris keeps obligations in sync across every authority. When something needs your attention, it moves to the top of this list.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-slate-900">Authority obligations</h4>
              <Badge className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                isCompliant
                  ? "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]"
                  : "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
              )}>
                {isCompliant ? "Compliant" : "Action required"}
              </Badge>
            </div>
            <div className="space-y-3">
              {complianceItems.map((item) => {
                const token = COMPLIANCE_STATUS_TOKENS[item.status];
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-[#e6f2ed] bg-white/95 p-4 shadow-[0_24px_56px_-40px_rgba(15,23,42,0.2)]"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border",
                          token.iconWrapperClass,
                        )}
                      >
                        <token.Icon className={cn("h-4 w-4", token.iconClass)} />
                      </span>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                          <Badge className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                            token.badgeClass,
                          )}>
                            {token.badgeLabel}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      </div>
                    </div>
                    {item.status !== "success" ? (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-full border-[#0f766e]/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                          onClick={() => handleDismissCompliance(item.id)}
                        >
                          Mark as resolved
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-full bg-[#0f766e] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.35)]"
                          onClick={() => setActiveSlideId("automation")}
                        >
                          View evidence
                        </Button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Automation covers renewals and inspections.
              </div>
              <Button
                type="button"
                onClick={handleComplianceReturn}
                className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.45)]"
              >
                Confirm compliance return
              </Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "automation",
      heading: "Signboard verification automation",
      description:
        "See how Polaris validates your evidence and routes it to inspectors.",
      content: (
        <div className="space-y-5">
          <div className="space-y-6 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-slate-900">Inspection pipeline</h4>
              <Badge
                className={cn(
                  "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  SUBMISSION_STATUS_TOKENS[submissionStatus].className,
                )}
              >
                {SUBMISSION_STATUS_TOKENS[submissionStatus].label}
              </Badge>
            </div>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-5">
                  {pipelineStatuses.map((step, index) => {
                    const token = PIPELINE_STATUS_TOKENS[step.status];
                    const isLast = index === pipelineStatuses.length - 1;
                    return (
                      <div key={step.id} className="flex flex-col items-start gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-10 w-10 items-center justify-center rounded-full border",
                              token.wrapperClass,
                            )}
                          >
                            <token.Icon className={token.iconClass} />
                          </span>
                          {!isLast ? (
                            <span
                              className={cn(
                                "h-0.5 w-16 rounded-full",
                                token.connectorClass,
                              )}
                              aria-hidden
                            />
                          ) : null}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                          <p className="text-xs text-slate-500">{step.description}</p>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            {step.helper}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="rounded-2xl border border-[#d8e4df] bg-[#f5faf7] p-4 text-sm text-[#0f766e]">
                  {latestVideoEvidence ? (
                    <div className="space-y-1 text-sm">
                      <span className="font-semibold text-slate-900">
                        Latest submission: {latestVideoEvidence.filename}
                      </span>
                      <div className="text-xs text-[#0f766e]">
                        Uploaded {formatEvidenceTimestamp(latestVideoEvidence.capturedOn)} • {latestVideoEvidence.source}
                      </div>
                      <div className="text-xs text-[#0f766e]">{latestVideoEvidence.note}</div>
                    </div>
                  ) : (
                    "Upload a walkthrough to trigger Polaris encryption and inspector routing."
                  )}
                </div>
              </div>
              <div className="space-y-4 rounded-2xl border border-[#e6f2ed] bg-white/95 p-5">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">Upload signboard walkthrough</p>
                  <p className="text-xs text-slate-500">
                    Provide a continuous exterior and interior capture so Polaris can validate signage, illuminance, and bilingual text.
                  </p>
                </div>
                <label
                  htmlFor="signboard-video-upload"
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#0f766e]/40 bg-white/85 px-4 py-6 text-center transition hover:border-[#0f766e] hover:bg-[#f5faf7]"
                >
                  <UploadCloud className="h-6 w-6 text-[#0f766e]" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Drop video or browse</p>
                    <p className="text-xs text-slate-500">MP4, MOV, or WebM up to 2 GB</p>
                  </div>
                </label>
                <Input
                  id="signboard-video-upload"
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoSelect}
                />
                {pendingVideo ? (
                  <div className="space-y-2 rounded-xl border border-[#d8e4df] bg-white/90 p-4 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{pendingVideo.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(pendingVideo.size)} • Ready for submission
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 hover:text-slate-900"
                        onClick={handleRemovePendingVideo}
                      >
                        Remove
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Polaris will encrypt the footage and extract annotated frames before inspectors review it.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#d8e4df] bg-white/70 p-4 text-xs text-slate-500">
                    No new walkthrough selected.
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleSubmitVideoEvidence}
                    disabled={!pendingVideo || isSubmittingVideo}
                    className="flex-1 rounded-full bg-[#0f766e] px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_-30px_rgba(15,118,110,0.45)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingVideo ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Submit to inspectors
                  </Button>
                  <Dialog open={libraryDialogOpen} onOpenChange={setLibraryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border-[#0f766e]/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                      >
                        <FolderOpen className="h-4 w-4" />
                        View library
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-30px_rgba(15,23,42,0.24)]">
                      <DialogHeader className="space-y-2 text-left">
                        <DialogTitle className="text-xl font-semibold text-slate-900">
                          Signboard evidence library
                        </DialogTitle>
                        <DialogDescription className="text-sm text-slate-600">
                          Every submitted walkthrough stays available for inspectors and TAMM audits.
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="max-h-[420px] pr-2">
                        <div className="space-y-3">
                          {videoLibrary.map((item) => {
                            const token = VIDEO_STATUS_TOKENS[item.status];
                            return (
                              <div
                                key={item.id}
                                className="space-y-3 rounded-2xl border border-[#e6f2ed] bg-[#f9fbfd] p-4"
                              >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0f766e]/15 bg-[#f5faf7] text-[#0f766e]">
                                      <PlayCircle className="h-5 w-5" />
                                    </span>
                                    <div className="space-y-1">
                                      <p className="text-sm font-semibold text-slate-900">{item.filename}</p>
                                      <p className="text-xs text-slate-500">
                                        {formatMegabytes(item.sizeMb)} • {item.durationLabel}
                                      </p>
                                      <p className="text-xs text-slate-500">{item.note}</p>
                                      <p className="text-xs text-slate-400">
                                        Uploaded {formatEvidenceTimestamp(item.capturedOn)} • {item.source}
                                      </p>
                                    </div>
                                  </div>
                                  <Badge
                                    className={cn(
                                      "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                      token.className,
                                    )}
                                  >
                                    {token.label}
                                  </Badge>
                                </div>
                                {item.frames.length > 0 ? (
                                  <div className="grid grid-cols-3 gap-2">
                                    {item.frames.map((frame) => {
                                      const frameToken = EVIDENCE_FRAME_STATUS_TOKENS[frame.status];
                                      return (
                                        <div
                                          key={frame.id}
                                          className="group relative overflow-hidden rounded-xl border border-[#e6f2ed] bg-white"
                                          title={frameToken.helper}
                                        >
                                          <img
                                            src={frame.src}
                                            alt={frame.alt}
                                            className="h-24 w-full object-cover transition duration-300 group-hover:scale-105"
                                          />
                                          <span
                                            className={cn(
                                              "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                                              frameToken.badgeClass,
                                            )}
                                          >
                                            {frameToken.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Library preview
                    </p>
                    <p className="text-xs text-slate-500">
                      Latest {libraryPreview.length} of {videoLibrary.length}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {libraryPreview.map((item) => {
                      const token = VIDEO_STATUS_TOKENS[item.status];
                      return (
                        <div
                          key={item.id}
                          className="space-y-3 rounded-xl border border-[#e6f2ed] bg-white/90 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-900">{item.filename}</p>
                              <p className="text-xs text-slate-500">
                                {formatMegabytes(item.sizeMb)} • {item.durationLabel}
                              </p>
                              <p className="text-xs text-slate-500">{token.helper}</p>
                              <p className="text-xs text-slate-400">
                                Uploaded {formatEvidenceTimestamp(item.capturedOn)} • {item.source}
                              </p>
                            </div>
                            <Badge
                              className={cn(
                                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                                token.className,
                              )}
                            >
                              {token.label}
                            </Badge>
                          </div>
                          {item.frames.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                              {item.frames.slice(0, 3).map((frame) => {
                                const frameToken = EVIDENCE_FRAME_STATUS_TOKENS[frame.status];
                                return (
                                  <div
                                    key={frame.id}
                                    className="group relative overflow-hidden rounded-xl border border-[#e6f2ed] bg-white"
                                    title={frameToken.helper}
                                  >
                                    <img
                                      src={frame.src}
                                      alt={frame.alt}
                                      className="h-20 w-full object-cover transition duration-300 group-hover:scale-105"
                                    />
                                    <span
                                      className={cn(
                                        "absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                                        frameToken.badgeClass,
                                      )}
                                    >
                                      {frameToken.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  {videoLibrary.length > libraryPreview.length ? (
                    <p className="text-xs text-slate-500">
                      {videoLibrary.length - libraryPreview.length} more walkthrough
                      {videoLibrary.length - libraryPreview.length > 1 ? "s" : ""} stored in the evidence library.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-base font-semibold text-slate-900">Signboard quality summary</h4>
                <Badge className="rounded-full border border-[#94d2c2] bg-[#dff2ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0b7d6f]">
                  {`${Math.round(SIGNBOARD_QUALITY_SUMMARY.confidence * 100)}% confidence`}
                </Badge>
              </div>
              <ul className="space-y-2 text-sm text-slate-600">
                {SIGNBOARD_QUALITY_SUMMARY.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 rounded-2xl border border-[#d8e4df] bg-[#f5faf7] p-4 text-sm text-[#0f766e]">
                <UploadCloud className="h-5 w-5" />
                Latest signboard footage and annotated frames are synced for inspectors.
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
              <h4 className="text-base font-semibold text-slate-900">Premises readiness</h4>
              <div className="space-y-3">
                {PREMIS_READINESS_ITEMS.map((item) => {
                  const token = READINESS_STATUS_TOKENS[item.status];
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-2 rounded-2xl border border-[#e6f2ed] bg-white/95 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <Badge className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                          token.className,
                        )}>
                          {token.label}
                        </Badge>
                      </div>
                      {item.detail ? (
                        <p className="text-xs text-slate-500">{item.detail}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-2 rounded-2xl border border-[#e6f2ed] bg-white/90 p-4">
                <p className="text-sm font-semibold text-slate-900">Text verification</p>
                <div className="space-y-2">
                  {TEXT_VERIFICATION_RESULTS.map((row) => (
                    <div
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f0f4f8] bg-[#f9fbfd] px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{row.language}</p>
                        <p className="text-xs text-slate-500">
                          Registered: {row.registered}
                        </p>
                        <p className="text-xs text-slate-500">
                          Extracted: {row.extracted}
                        </p>
                      </div>
                      <Badge className="rounded-full border border-[#94d2c2] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                        {row.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "growth",
      heading: "Growth opportunities",
      description: growthUnlocked
        ? "Activate new revenue streams with the same automation that keeps you compliant."
        : "Complete outstanding compliance actions to unlock proactive growth support.",
      content: (
        <div className="space-y-5">
          <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-base font-semibold text-slate-900">Opportunities curated for you</h4>
              <Badge className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                growthUnlocked
                  ? "border-[#94d2c2] bg-[#eaf7f3] text-[#0f766e]"
                  : "border-[#f3dcb6] bg-[#fdf6e4] text-[#b97324]",
              )}>
                {growthUnlocked ? "Unlocked" : "Locked"}
              </Badge>
            </div>
            <div className="space-y-3">
              {GROWTH_OPPORTUNITIES.map((opportunity) => (
                <div
                  key={opportunity.id}
                  className="flex flex-col gap-3 rounded-2xl border border-[#e6f2ed] bg-white/95 p-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">{opportunity.title}</p>
                    <p className="text-xs text-slate-500">{opportunity.subtitle}</p>
                  </div>
                  <Button
                    type="button"
                    disabled={!growthUnlocked}
                    className="inline-flex items-center gap-2 rounded-full bg-[#0f766e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.45)] disabled:cursor-not-allowed disabled:bg-[#0f766e]/20"
                    onClick={() =>
                      toast({
                        title: growthUnlocked
                          ? "Growth workflow initiated"
                          : "Complete compliance first",
                        description: growthUnlocked
                          ? `${opportunity.title} is underway. Polaris will guide you through each step.`
                          : "Finish outstanding compliance tasks to unlock growth playbooks.",
                      })
                    }
                  >
                    {opportunity.buttonLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-3xl border border-[#d8e4df] bg-white p-6 shadow-[0_24px_56px_-34px_rgba(15,23,42,0.22)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-slate-900">
                  Feedback to growth desk
                </h4>
                <p className="text-xs text-slate-500">
                  Share expansion plans or request tailored support.
                </p>
              </div>
              <Badge className="rounded-full border border-[#94d2c2] bg-[#eaf7f3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0f766e]">
                {FEEDBACK_STATUS_LABEL[feedbackStatus]}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Contact email
                </label>
                <Input
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  className="h-11 rounded-full border-slate-200 bg-white px-4 text-sm text-slate-900"
                  type="email"
                />
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Notes for growth desk
                </label>
                <Textarea
                  value={feedbackNotes}
                  onChange={(event) => setFeedbackNotes(event.target.value)}
                  rows={6}
                  placeholder="Share the next initiative you want Polaris to help with..."
                  className="resize-none border-slate-200 bg-white text-sm leading-relaxed text-slate-700"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    onClick={handleSubmitFeedback}
                    className="rounded-full bg-[#0f766e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-[0_18px_36px_-28px_rgba(15,118,110,0.45)]"
                  >
                    Send feedback
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFeedbackNotes("");
                      setFeedbackStatus("draft");
                    }}
                    className="rounded-full border-[#0f766e]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]"
                  >
                    Reset form
                  </Button>
                </div>
              </div>
              <div className="space-y-3 rounded-2xl border border-[#e6f2ed] bg-[#f9fbfd] p-5 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">What happens next?</p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                    Growth desk reviews your request within one business day.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                    Polaris drafts an execution plan with dependencies and approvals.
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 text-[#0f766e]" strokeWidth={3} />
                    You track progress here, the same way you do for compliance.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <StageSlideNavigator
      slides={slides}
      activeSlideId={activeSlideId}
      onSlideChange={setActiveSlideId}
      className="mt-6"
    />
  );
}
