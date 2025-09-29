import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { JourneyView } from "@/components/portal/JourneyView";
import type { JourneyStep } from "@/components/portal/JourneyStepper";
import type {
  ActorOption,
  BusinessActivity,
} from "@/components/portal/BusinessActivitiesSelection";

const JOURNEY_NUMBER = "0987654321";

const ACTOR_OPTIONS: ActorOption[] = [
  { id: "ded", label: "Department of Economic Development" },
  { id: "adafsa", label: "Abu Dhabi Agriculture & Food Safety Authority" },
  { id: "adm", label: "Abu Dhabi Municipality" },
  { id: "tamm", label: "TAMM" },
];

const INITIAL_STEPS: JourneyStep[] = [
  { id: "questionnaire", label: "Questionnaire", state: "completed" },
  { id: "business-registration", label: "Business Registration", state: "completed" },
  { id: "submit-documents", label: "Submit Documents", state: "completed" },
  { id: "business-licensing", label: "Business Licensing", state: "current" },
  {
    id: "pre-operational-inspection",
    label: "Pre-Operational Inspection",
    state: "upcoming",
  },
];

const RECOMMENDED_ACTIVITIES: BusinessActivity[] = [
  {
    id: "full-service-restaurant",
    label: "Full-service restaurant",
    description: "Operate a dine-in restaurant with full kitchen facilities.",
    isRecommended: true,
    actors: ["ded", "adafsa"],
  },
  {
    id: "charcoal-bbq",
    label: "Charcoal/coal BBQ services",
    description: "Indoor and outdoor charcoal grilling operations.",
    isRecommended: true,
    actors: ["adafsa"],
  },
  {
    id: "hospitality-catering",
    label: "Hospitality and catering services",
    description: "Provide event catering and hospitality staffing support.",
    actors: ["adm"],
  },
];

const ADDITIONAL_ACTIVITIES: BusinessActivity[] = [
  {
    id: "delivery-kitchen",
    label: "Delivery-only kitchen",
    description: "Virtual kitchen focused on delivery-only operations.",
    actors: ["ded"],
  },
  {
    id: "food-truck",
    label: "Mobile food truck operations",
    description: "Serve food from licensed mobile units across Abu Dhabi.",
    actors: ["adm"],
  },
  {
    id: "pastry-production",
    label: "Central bakery and pastry production",
    description: "Produce baked goods for wholesale and retail distribution.",
    actors: ["adafsa"],
  },
];

const INITIAL_SELECTED_ACTIVITY_IDS = [
  "full-service-restaurant",
  "charcoal-bbq",
];

const computeSteps = (activeStepId: string): JourneyStep[] => {
  const targetIndex = INITIAL_STEPS.findIndex((step) => step.id === activeStepId);

  return INITIAL_STEPS.map((step, index) => {
    if (targetIndex === -1) {
      return { ...step };
    }

    const state =
      index < targetIndex
        ? "completed"
        : index === targetIndex
          ? "current"
          : "upcoming";

    return { ...step, state };
  });
};

export default function InvestorJourney() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const stageParam = searchParams.get("stage");
  const defaultStepId = stageParam && INITIAL_STEPS.some((step) => step.id === stageParam)
    ? stageParam
    : INITIAL_STEPS.find((step) => step.state === "current")?.id ?? INITIAL_STEPS[0].id;

  const [steps, setSteps] = useState<JourneyStep[]>(() => computeSteps(defaultStepId));
  const [currentStepId, setCurrentStepId] = useState<string>(defaultStepId);
  const [activities, setActivities] = useState<BusinessActivity[]>(RECOMMENDED_ACTIVITIES);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(
    INITIAL_SELECTED_ACTIVITY_IDS,
  );
  const [availableActivities, setAvailableActivities] = useState<BusinessActivity[]>(
    ADDITIONAL_ACTIVITIES,
  );

  const updateCurrentStep = useCallback(
    (stepId: string, syncQuery = true) => {
      if (!INITIAL_STEPS.some((step) => step.id === stepId)) {
        return;
      }

      setSteps(computeSteps(stepId));
      setCurrentStepId(stepId);

      if (syncQuery) {
        setSearchParams({ stage: stepId });
      }
    },
    [setSearchParams],
  );

  useEffect(() => {
    const stage = searchParams.get("stage");
    if (stage && stage !== currentStepId && INITIAL_STEPS.some((step) => step.id === stage)) {
      updateCurrentStep(stage, false);
    }
  }, [searchParams, currentStepId, updateCurrentStep]);

  const handleStepChange = useCallback(
    (stepId: string) => {
      updateCurrentStep(stepId);
    },
    [updateCurrentStep],
  );

  const handleActivityToggle = useCallback((activityId: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId],
    );
  }, []);

  const handleAddActivity = useCallback((activityId: string) => {
    setAvailableActivities((prev) => {
      const activity = prev.find((item) => item.id === activityId);
      if (!activity) {
        return prev;
      }

      setActivities((current) =>
        current.some((item) => item.id === activityId)
          ? current
          : [...current, activity],
      );
      setSelectedActivityIds((current) =>
        current.includes(activityId) ? current : [...current, activityId],
      );

      return prev.filter((item) => item.id !== activityId);
    });
  }, []);

  const completedSteps = useMemo(
    () => steps.filter((step) => step.state === "completed").length,
    [steps],
  );

  return (
    <JourneyView
      journeyNumber={JOURNEY_NUMBER}
      completedSteps={completedSteps}
      totalSteps={steps.length}
      currentStepId={currentStepId}
      steps={steps}
      activities={activities}
      selectedActivityIds={selectedActivityIds}
      availableActivities={availableActivities}
      actorOptions={ACTOR_OPTIONS}
      onStepChange={handleStepChange}
      onActivityToggle={handleActivityToggle}
      onAddActivity={handleAddActivity}
      onClose={() => navigate(-1)}
    />
  );
}
