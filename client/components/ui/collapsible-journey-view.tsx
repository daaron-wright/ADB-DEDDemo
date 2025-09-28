import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneySection {
  id: string;
  title: string;
  items: JourneyItem[];
  isCollapsed?: boolean;
}

interface JourneyItem {
  id: string;
  text: string;
  status: 'completed' | 'in_progress' | 'pending';
  type: 'checkbox' | 'radio';
}

interface CollapsibleJourneyViewProps {
  journeyNumber: string;
  completedCount: number;
  totalCount: number;
  sections: JourneySection[];
  onItemUpdate?: (sectionId: string, itemId: string, status: JourneyItem['status']) => void;
}

const StatusIcon: React.FC<{ status: JourneyItem['status']; type: JourneyItem['type'] }> = ({ status, type }) => {
  const baseClasses = 'flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-200';

  if (status === 'completed') {
    return (
      <div className={`${baseClasses} border-emerald-300/50 bg-emerald-200/15 text-emerald-100`}>
        <svg
          width="14"
          height="10"
          viewBox="0 0 14 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M1 5l3.5 3L13 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  if (status === 'in_progress') {
    return (
      <div className={`${baseClasses} border-sky-300/40 bg-sky-200/10 text-sky-100`}>
        <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
      </div>
    );
  }

  if (type === 'radio') {
    return (
      <div className={`${baseClasses} border-white/25 text-white/70`}>
        <span className="h-3 w-3 rounded-full border border-current" />
      </div>
    );
  }

  return (
    <div className={`${baseClasses} border-white/20 text-white/60`}>
      <span className="h-2 w-2 rounded-full bg-current" />
    </div>
  );
};

const CollapsibleSection: React.FC<{
  section: JourneySection;
  onToggle: () => void;
  onItemUpdate?: (itemId: string, status: JourneyItem['status']) => void;
}> = ({ section, onToggle, onItemUpdate }) => {
  return (
    <div className="border-t border-white/12 first:border-t-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors duration-200 hover:bg-white/6"
      >
        <h3 className="text-base font-semibold tracking-tight text-white/85 sm:text-lg">
          {section.title}
        </h3>
        <motion.div
          animate={{ rotate: section.isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          className="text-white/55"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {!section.isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-3 px-6 pb-5">
              {section.id === 'business-activities' && (
                <p className="text-sm text-white/60">
                  Choose from the below AI recommended activities.
                </p>
              )}

              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3"
                >
                  <button
                    onClick={() =>
                      onItemUpdate?.(item.id, item.status === 'completed' ? 'pending' : 'completed')
                    }
                    className="flex-shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-white/30"
                    aria-label={`Toggle ${item.text}`}
                  >
                    <StatusIcon status={item.status} type={item.type} />
                  </button>
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-medium text-white/85 sm:text-base">
                      {item.text}
                    </span>
                    <span className="text-xs font-medium capitalize tracking-[0.08em] text-white/45">
                      {formatStatus(item.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const CollapsibleJourneyView: React.FC<CollapsibleJourneyViewProps> = ({
  journeyNumber,
  completedCount,
  totalCount,
  sections: initialSections,
  onItemUpdate
}) => {
  const [sections, setSections] = useState<JourneySection[]>(initialSections);

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? { ...section, isCollapsed: !section.isCollapsed }
        : section
    ));
  };

  const handleItemUpdate = (sectionId: string, itemId: string, status: JourneyItem['status']) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            items: section.items.map(item => 
              item.id === itemId ? { ...item, status } : item
            )
          }
        : section
    ));
    onItemUpdate?.(sectionId, itemId, status);
  };

  return (
    <div className="w-full max-w-2xl bg-white/14 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
        <h2 className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
          Journey Number: {journeyNumber}
        </h2>
        <span className="text-[#54FFD4] font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px]">
          {completedCount} of {totalCount} complete
        </span>
      </div>

      {/* Sections */}
      <div>
        {sections.map((section) => (
          <CollapsibleSection
            key={section.id}
            section={section}
            onToggle={() => toggleSection(section.id)}
            onItemUpdate={(itemId, status) => handleItemUpdate(section.id, itemId, status)}
          />
        ))}
      </div>
    </div>
  );
};
