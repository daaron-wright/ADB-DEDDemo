import * as React from "react";

import { INITIAL_DOCUMENTS } from "./document-vault-data";
import type { DocumentVaultItem } from "./document-vault-types";

export interface DocumentVaultContextValue {
  documents: DocumentVaultItem[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentVaultItem[]>>;
  isVaultSyncing: boolean;
  triggerVaultSync: (duration?: number) => void;
  totalDocuments: number;
  completedDocuments: number;
  allDocumentsCompleted: boolean;
}

const DocumentVaultContext = React.createContext<DocumentVaultContextValue | null>(null);

function useDocumentVaultState(): DocumentVaultContextValue {
  const [documents, setDocuments] = React.useState<DocumentVaultItem[]>(INITIAL_DOCUMENTS);
  const [isVaultSyncing, setIsVaultSyncing] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);
  const previousStatusesRef = React.useRef<string>(
    INITIAL_DOCUMENTS.map((item) => item.status).join("|"),
  );

  const clearSyncTimeout = React.useCallback(() => {
    if (timeoutRef.current !== null) {
      if (typeof window !== "undefined") {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = null;
    }
  }, []);

  const triggerVaultSync = React.useCallback(
    (duration = 1200) => {
      setIsVaultSyncing(true);
      if (typeof window !== "undefined") {
        clearSyncTimeout();
        timeoutRef.current = window.setTimeout(() => {
          setIsVaultSyncing(false);
          timeoutRef.current = null;
        }, duration);
      } else {
        setIsVaultSyncing(false);
      }
    },
    [clearSyncTimeout],
  );

  React.useEffect(() => {
    return () => {
      clearSyncTimeout();
    };
  }, [clearSyncTimeout]);

  React.useEffect(() => {
    const currentStatuses = documents.map((item) => item.status).join("|");
    if (previousStatusesRef.current !== currentStatuses) {
      previousStatusesRef.current = currentStatuses;
      triggerVaultSync();
    }
  }, [documents, triggerVaultSync]);

  const completedDocuments = React.useMemo(() => {
    return documents.filter((item) => item.status === "completed").length;
  }, [documents]);

  const totalDocuments = documents.length;
  const allDocumentsCompleted = completedDocuments === totalDocuments && totalDocuments > 0;

  return React.useMemo<DocumentVaultContextValue>(
    () => ({
      documents,
      setDocuments,
      isVaultSyncing,
      triggerVaultSync,
      totalDocuments,
      completedDocuments,
      allDocumentsCompleted,
    }),
    [
      documents,
      setDocuments,
      isVaultSyncing,
      triggerVaultSync,
      totalDocuments,
      completedDocuments,
      allDocumentsCompleted,
    ],
  );
}

export function DocumentVaultProvider({ children }: { children: React.ReactNode }) {
  const vaultState = useDocumentVaultState();

  return (
    <DocumentVaultContext.Provider value={vaultState}>{children}</DocumentVaultContext.Provider>
  );
}

export function useDocumentVaultContext() {
  return React.useContext(DocumentVaultContext);
}

export function useDocumentVault() {
  const context = useDocumentVaultContext();
  const fallbackState = useDocumentVaultState();
  return context ?? fallbackState;
}
