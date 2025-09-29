import React, { useState } from 'react';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface QuestionnaireItem {
  id: string;
  text: string;
  status: 'completed' | 'in_progress' | 'pending';
  type: 'checkbox' | 'radio';
}

interface QuestionnaireSection {
  id: string;
  title: string;
  subtitle?: string;
  items: QuestionnaireItem[];
}

interface SimpleQuestionnaireProps {
  journeyNumber: string;
  completedCount: number;
  totalCount: number;
  onItemUpdate?: (sectionId: string, itemId: string, status: QuestionnaireItem['status']) => void;
}

export type SimpleQuestionnaireHandle = {
  scrollToItem: (itemId: string) => void;
};

const CheckmarkIcon: React.FC = () => (
  <svg width="27" height="27" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M14.4999 0.9375C18.0969 0.9375 21.5463 2.36674 24.0898 4.91016C26.6332 7.45361 28.0624 10.903 28.0624 14.5C28.0624 17.1824 27.2675 19.8048 25.7773 22.0352C24.287 24.2655 22.1686 26.0038 19.6904 27.0303C17.2122 28.0568 14.4852 28.325 11.8544 27.8018C9.22356 27.2784 6.80684 25.9866 4.9101 24.0898C3.01338 22.1931 1.72149 19.7763 1.19818 17.1455C0.674976 14.5148 0.943204 11.7877 1.96967 9.30957C2.99612 6.83158 4.7347 4.71385 6.96478 3.22363C9.19509 1.73339 11.8176 0.937525 14.4999 0.9375ZM18.9492 3.75977C16.825 2.87992 14.4873 2.65012 12.2324 3.09863C9.97733 3.54719 7.906 4.65449 6.28021 6.28027C4.65446 7.90605 3.54712 9.97742 3.09857 12.2324C2.65013 14.4872 2.88004 16.8243 3.7597 18.9482C4.63957 21.0724 6.13021 22.8886 8.04193 24.166C9.95355 25.4432 12.2009 26.125 14.4999 26.125C17.5831 26.125 20.5405 24.8998 22.7206 22.7197C24.9005 20.5397 26.1249 17.5829 26.1249 14.5C26.1249 12.2009 25.4432 9.95363 24.166 8.04199C22.8886 6.13036 21.0732 4.63965 18.9492 3.75977ZM21.2812 11.0264L12.5624 19.7441L7.71869 14.8994L9.08783 13.5312L12.5624 17.0049L19.9101 9.65625L21.2812 11.0264Z" 
      fill="#54FFD4"
    />
  </svg>
);

const InProgressIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M14.0002 0C17.7131 5.25326e-05 21.2741 1.47512 23.8996 4.10059C26.525 6.72607 28.0002 10.287 28.0002 14C28.0002 17.713 26.525 21.2739 23.8996 23.8994C21.2741 26.5249 17.7131 27.9999 14.0002 28V26C17.1827 25.9999 20.2351 24.7357 22.4855 22.4854C24.7359 20.2349 26.0002 17.1825 26.0002 14C26.0002 10.8175 24.7359 7.76506 22.4855 5.51465C20.2351 3.26426 17.1827 2.00005 14.0002 2V0ZM6.24042 23.1406C7.31765 24.0481 8.54662 24.7588 9.8703 25.2402L9.17987 27.1104C7.6536 26.5498 6.23876 25.7233 5.00018 24.6699L6.24042 23.1406ZM2.18964 16C2.42408 17.4036 2.89801 18.7566 3.59003 20L1.85956 21C1.04 19.579 0.474833 18.0256 0.189636 16.4102L2.18964 16ZM3.59003 8C2.90893 9.22053 2.4452 10.5503 2.21991 11.9297L0.21991 11.5898C0.501212 9.97774 1.05558 8.42536 1.85956 7L3.59003 8ZM9.81952 2.76074C8.51357 3.24745 7.30252 3.95795 6.24042 4.86035L5.00018 3.33008C6.22367 2.28181 7.62153 1.45639 9.13007 0.890625L9.81952 2.76074Z" 
      fill="#54FFD4"
    />
  </svg>
);

const RadioIcon: React.FC<{ selected?: boolean }> = ({ selected = false }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M16.0001 2C13.2311 2 10.5244 2.82109 8.22208 4.35943C5.91979 5.89776 4.12538 8.08427 3.06575 10.6424C2.00613 13.2006 1.72888 16.0155 2.26907 18.7313C2.80927 21.447 4.14264 23.9416 6.10057 25.8995C8.05851 27.8574 10.5531 29.1908 13.2688 29.731C15.9845 30.2712 18.7995 29.9939 21.3576 28.9343C23.9158 27.8747 26.1023 26.0803 27.6406 23.778C29.179 21.4757 30.0001 18.7689 30.0001 16C30.0001 12.287 28.5251 8.72601 25.8996 6.1005C23.274 3.475 19.7131 2 16.0001 2V2ZM16.0001 28C13.6267 28 11.3066 27.2962 9.33322 25.9776C7.35983 24.6591 5.82176 22.7849 4.91351 20.5922C4.00526 18.3995 3.76762 15.9867 4.23064 13.6589C4.69367 11.3311 5.83655 9.19295 7.51478 7.51472C9.19301 5.83649 11.3312 4.6936 13.659 4.23058C15.9868 3.76755 18.3996 4.00519 20.5923 4.91345C22.785 5.8217 24.6591 7.35977 25.9777 9.33316C27.2963 11.3065 28.0001 13.6266 28.0001 16C28.0001 19.1826 26.7358 22.2348 24.4853 24.4853C22.2349 26.7357 19.1827 28 16.0001 28Z" 
      fill="white"
    />
    {selected && (
      <circle cx="16" cy="16" r="6" fill="#54FFD4" />
    )}
  </svg>
);

const AddIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M14 0C21.7 0 28 6.30003 28 14C28 21.7 21.7 28 14 28C6.30003 28 0 21.7 0 14C4.11619e-05 6.30006 6.30006 4.11593e-05 14 0ZM14 2C7.40006 2.00004 2.00004 7.40006 2 14C2 20.6 7.40003 26 14 26C20.6 26 26 20.6 26 14C26 7.40003 20.6 2 14 2ZM15 6V13H22V15H15V22H13V15H6V13H13V6H15Z" 
      fill="white"
    />
  </svg>
);

const SimpleQuestionnaire = forwardRef<SimpleQuestionnaireHandle, SimpleQuestionnaireProps>(
  ({ journeyNumber, completedCount, totalCount, onItemUpdate }, ref) => {
  const [sections, setSections] = useState<QuestionnaireSection[]>([
    {
      id: 'legal-structure',
      title: 'Legal Structure',
      items: [
        {
          id: 'business-type',
          text: 'New Business - Limited Liability Company',
          status: 'completed',
          type: 'checkbox'
        },
        {
          id: 'ownership',
          text: 'Ownership - Single Owner',
          status: 'completed',
          type: 'checkbox'
        },
        {
          id: 'nationality',
          text: 'Nationality - UAE National',
          status: 'in_progress',
          type: 'checkbox'
        }
      ]
    },
    {
      id: 'business-activities',
      title: 'Business Activities',
      subtitle: 'Choose from the below AI recommended activities',
      items: [
        {
          id: 'full-service',
          text: 'Full-service restaurant',
          status: 'pending',
          type: 'radio'
        },
        {
          id: 'bbq-services',
          text: 'Charcoal/coal BBQ services',
          status: 'pending',
          type: 'radio'
        },
        {
          id: 'catering',
          text: 'Hospitality and catering services',
          status: 'pending',
          type: 'radio'
        },
        {
          id: 'add-activity',
          text: 'Add a new activity',
          status: 'pending',
          type: 'radio'
        }
      ]
    },
    {
      id: 'physical-space',
      title: 'Physical Space Requirements',
      items: [
        {
          id: 'registration',
          text: 'Step 1: Business Registration',
          status: 'pending',
          type: 'radio'
        },
        {
          id: 'documents',
          text: 'Step 2: Submission of Documents',
          status: 'pending',
          type: 'radio'
        },
        {
          id: 'licensing',
          text: 'Step 3: Business Licensing',
          status: 'pending',
          type: 'radio'
        },
        {
          id: 'inspection',
          text: 'Step 4: Pre-Operational Inspection',
          status: 'pending',
          type: 'radio'
        }
      ]
    }
  ]);

  const [selectedRadioItems, setSelectedRadioItems] = useState<Record<string, string>>({});
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const highlightTimeoutRef = useRef<number | null>(null);

  const scrollToItem = (itemId: string) => {
    const element = itemRefs.current[itemId];
    if (!element) {
      return;
    }

    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    setHighlightedItem(itemId);

    if (highlightTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    if (typeof window !== 'undefined') {
      highlightTimeoutRef.current = window.setTimeout(() => {
        setHighlightedItem((current) => (current === itemId ? null : current));
      }, 2000);
    }
  };

  useImperativeHandle(ref, () => ({
    scrollToItem
  }));

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleItemClick = (sectionId: string, itemId: string, currentStatus: QuestionnaireItem['status'], type: QuestionnaireItem['type']) => {
    if (type === 'checkbox') {
      // Toggle checkbox items
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      updateItemStatus(sectionId, itemId, newStatus);
    } else if (type === 'radio') {
      // Handle radio button selection
      setSelectedRadioItems(prev => ({
        ...prev,
        [sectionId]: itemId
      }));
      updateItemStatus(sectionId, itemId, 'completed');
    }
  };

  const updateItemStatus = (sectionId: string, itemId: string, newStatus: QuestionnaireItem['status']) => {
    setSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId ? { ...item, status: newStatus } : item
              )
            }
          : section
      )
    );

    onItemUpdate?.(sectionId, itemId, newStatus);
  };

  const renderIcon = (item: QuestionnaireItem, sectionId: string) => {
    if (item.type === 'checkbox') {
      switch (item.status) {
        case 'completed':
          return <CheckmarkIcon />;
        case 'in_progress':
          return <InProgressIcon />;
        default:
          return <RadioIcon />;
      }
    } else if (item.type === 'radio') {
      if (item.id === 'add-activity') {
        return <AddIcon />;
      }
      return <RadioIcon selected={selectedRadioItems[sectionId] === item.id} />;
    }
    return <RadioIcon />;
  };

  return (
    <div className="w-full max-w-[633px] mx-auto">
      {/* Main Container - Glass Effect */}
      <div className="rounded-3xl bg-white/14 opacity-80 backdrop-blur-xl border border-white/12 p-0 relative overflow-hidden">
        {/* Section Dividers */}
        <div className="absolute w-full h-px bg-white/18 top-[77px]" />
        <div className="absolute w-full h-px bg-white/18 top-[344px]" />
        <div className="absolute w-full h-px bg-white/18 top-[695px]" />

        {/* Header */}
        <div className="px-8 py-6 relative">
          <div className="flex items-center justify-between">
            <h1 className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
              Journey Number: {journeyNumber}
            </h1>
            <div className="text-[#54FFD4] font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px] text-right">
              {completedCount} of {totalCount} complete
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-0">
          {sections.map((section, index) => (
            <div key={section.id} className="relative">
              <div className={`px-8 ${index === 0 ? 'pt-6 pb-8' : index === 1 ? 'py-8' : 'pt-8 pb-8'}`}>
                {/* Section Title */}
                <h2 className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px] mb-6">
                  {index + 1}. {section.title}
                </h2>

                {/* Subtitle */}
                {section.subtitle && (
                  <p className="text-white font-['DM_Sans'] text-sm font-normal leading-[160%] tracking-[0.045px] mb-6">
                    {section.subtitle}
                  </p>
                )}

                {/* Items */}
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <motion.div
                      key={item.id}
                      className={cn(
                        'group flex cursor-pointer items-center gap-10 rounded-2xl transition-colors duration-200',
                        highlightedItem === item.id ? 'bg-white/10 ring-2 ring-[#54FFD4]' : 'hover:bg-white/6'
                      )}
                      ref={(element) => {
                        itemRefs.current[item.id] = element;
                      }}
                      onClick={() => handleItemClick(section.id, item.id, item.status, item.type)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Icon */}
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-110">
                        {renderIcon(item, section.id)}
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <span className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%] transition-colors duration-200 group-hover:text-white/90">
                          {item.text}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default SimpleQuestionnaire;
export type { SimpleQuestionnaireHandle };
