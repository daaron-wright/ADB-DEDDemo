export type DocumentStatus = "ready" | "requires_action" | "completed";

export interface DocumentVaultItem {
  id: string;
  title: string;
  description: string;
  source: string;
  sourceDetail: string;
  status: DocumentStatus;
  actionLabel: string;
  integrationBadge: string;
  isExpanded: boolean;
  previewImageUrl?: string;
  previewHref?: string;
  previewButtonLabel?: string;
}
