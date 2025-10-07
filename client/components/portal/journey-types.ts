export type JourneyHighlightState = "done" | "current" | "upcoming";

export type JourneyTaskStatus = "completed" | "in_progress" | "pending";

export type JourneyStageStatusState =
  | "in_progress"
  | "completed"
  | "scheduled";

export type JourneyStageStatusTransition = {
  id: string;
  status: JourneyStageStatusState;
  label: string;
  detail?: string;
  timestamp?: string;
};

export type JourneyTask = {
  id: string;
  label: string;
  status: JourneyTaskStatus;
  owner: string;
  dueDate?: string;
  completedOn?: string;
};

export type NextActionStatus = JourneyTaskStatus | "guidance" | "workflow";

export type NextActionItem = {
  id: string;
  label: string;
  status: NextActionStatus;
  stageId?: string;
  stageTitle?: string;
  description?: string;
  dueDate?: string;
};

export type JourneyTimelineItem = {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  statusBadgeClass: string;
  statusHelperClass: string;
  meta?: string;
  isCurrent: boolean;
  showProgress?: boolean;
};

export type JourneyStage = {
  id: string;
  title: string;
  highlight: {
    label: string;
    detail?: string;
  };
  description: string;
  state: JourneyHighlightState;
  statusDetail?: string;
  tasks: JourneyTask[];
  statusTransitions?: JourneyStageStatusTransition[];
};

export type JourneyAnimationPhase = {
  stageId: string;
  message: string;
  percent: number;
  keyConsiderations: string[];
  dataTags: string[];
};
