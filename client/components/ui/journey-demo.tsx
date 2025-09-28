import React from 'react';
import { CollapsibleJourneyView } from './collapsible-journey-view';

export const JourneyDemo: React.FC = () => {
  const sampleSections = [
    {
      id: 'legal-structure',
      title: 'Legal Structure',
      isCollapsed: false,
      items: [
        {
          id: 'business-type',
          text: 'New Business - Limited Liability Company',
          status: 'completed' as const,
          type: 'checkbox' as const
        },
        {
          id: 'ownership',
          text: 'Ownership - Single Owner',
          status: 'completed' as const,
          type: 'checkbox' as const
        },
        {
          id: 'nationality',
          text: 'Nationality - UAE National',
          status: 'in_progress' as const,
          type: 'checkbox' as const
        }
      ]
    },
    {
      id: 'business-activities',
      title: 'Business Activities',
      isCollapsed: false,
      items: [
        {
          id: 'full-service',
          text: 'Full-service restaurant',
          status: 'pending' as const,
          type: 'radio' as const
        },
        {
          id: 'bbq-services',
          text: 'Charcoal/coal BBQ services',
          status: 'pending' as const,
          type: 'radio' as const
        },
        {
          id: 'catering',
          text: 'Hospitality and catering services',
          status: 'pending' as const,
          type: 'radio' as const
        },
        {
          id: 'add-activity',
          text: 'Add a new activity',
          status: 'pending' as const,
          type: 'radio' as const
        }
      ]
    },
    {
      id: 'physical-space',
      title: 'Physical Space Requirements',
      isCollapsed: true,
      items: [
        {
          id: 'registration',
          text: 'Step 1: Business Registration',
          status: 'pending' as const,
          type: 'radio' as const
        },
        {
          id: 'documents',
          text: 'Step 2: Submission of Documents',
          status: 'pending' as const,
          type: 'radio' as const
        },
        {
          id: 'licensing',
          text: 'Step 3: Business Licensing',
          status: 'pending' as const,
          type: 'radio' as const
        },
        {
          id: 'inspection',
          text: 'Step 4: Pre-Operational Inspection',
          status: 'pending' as const,
          type: 'radio' as const
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0C28] via-[#1E3A8A] to-[#7C3AED] p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-white text-3xl font-bold mb-4">Collapsible Journey View Demo</h1>
          <p className="text-white/70 text-lg">
            A responsive, collapsible component matching the Figma design
          </p>
        </div>
        
        <div className="flex justify-center">
          <CollapsibleJourneyView
            journeyNumber="0987654321"
            completedCount={2}
            totalCount={8}
            sections={sampleSections}
            onItemUpdate={(sectionId, itemId, status) => {
              console.log(`Section: ${sectionId}, Item: ${itemId}, Status: ${status}`);
            }}
          />
        </div>

        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-white text-lg font-semibold mb-3">Features:</h3>
            <ul className="text-white/80 text-left space-y-2 text-sm">
              <li>✅ Fully responsive design using Flexbox and CSS Grid</li>
              <li>✅ Smooth collapse/expand animations with Framer Motion</li>
              <li>✅ Interactive status icons (completed, in-progress, pending)</li>
              <li>✅ Pixel-perfect recreation of Figma design</li>
              <li>✅ Modern glassmorphism styling with backdrop blur</li>
              <li>✅ Accessible button interactions and hover states</li>
              <li>✅ Progress indicator in header</li>
              <li>✅ TypeScript support with proper interfaces</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
