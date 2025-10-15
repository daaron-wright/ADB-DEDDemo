import type { DocumentStatus, DocumentVaultItem } from "./document-vault-types";

export const DOCUMENT_VAULT_SOURCE_LABEL = 'Synced from "My Business Documents" Vault';

export const DOCUMENT_VAULT_IMAGE_URL =
  "https://cdn.builder.io/api/v1/image/assets%2F4f55495a54b1427b9bd40ba1c8f3c8aa%2Fdcbbbf1fba0441838566c6e2d3105aa0?format=webp&width=800";

export const INITIAL_DOCUMENTS: DocumentVaultItem[] = [
  {
    id: "tenancy-contract",
    title: "Tenancy Contract",
    description:
      "Omnis pulled your stamped tenancy contract directly from Tamkeen via AD Connect.",
    source: DOCUMENT_VAULT_SOURCE_LABEL,
    sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
    status: "completed",
    actionLabel: "View contract",
    integrationBadge: "AD Connect",
    isExpanded: false,
  },
  {
    id: "memorandum-of-association",
    title: "Memorandum of Association (MOA)",
    description:
      "Drafted with your shareholder details and ready for notarisation with the Abu Dhabi Judicial Department.",
    source: DOCUMENT_VAULT_SOURCE_LABEL,
    sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
    status: "requires_action",
    actionLabel: "Review with Omnis",
    integrationBadge: "ADJD",
    isExpanded: true,
  },
  {
    id: "founders-passports",
    title: "Shareholders’ Passports",
    description:
      "Securely stored copies of all shareholders’ passports, validated through your TAMM account login.",
    source: DOCUMENT_VAULT_SOURCE_LABEL,
    sourceDetail: DOCUMENT_VAULT_SOURCE_LABEL,
    status: "completed",
    actionLabel: "Preview passport pack",
    integrationBadge: "TAMM",
    isExpanded: false,
  },
];
