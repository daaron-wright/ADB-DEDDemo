export type JourneyHighlightState = "done" | "current" | "upcoming";

export type JourneyTaskStatus = "completed" | "in_progress" | "pending";

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
};

export type JourneyAnimationPhase = {
  stageId: string;
  message: string;
  percent: number;
  keyConsiderations: string[];
  dataTags: string[];
};
