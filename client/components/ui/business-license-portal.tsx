import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CollapsibleJourneyView } from './collapsible-journey-view';

interface User {
  id: string;
  name: string;
  email: string;
  emiratesId: string;
  userType: 'applicant' | 'reviewer';
  role: string;
  department?: string;
}

interface BusinessLicensePortalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

interface JourneyItem {
  id: string;
  text: string;
  completed: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
}

interface JourneyCardProps {
  title: string;
  description: string;
  items: JourneyItem[];
  onAddItem: (item: JourneyItem) => void;
  onUpdateItem: (id: string, updates: Partial<JourneyItem>) => void;
  onRemoveItem: (id: string) => void;
  showAdminActions?: boolean;
  onToggleAdminView?: () => void;
  isAdminView?: boolean;
  progress?: number;
}

const JourneyCard: React.FC<JourneyCardProps> = ({
  title,
  description,
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  showAdminActions = false,
  onToggleAdminView,
  isAdminView = false,
  progress = 0
}) => {
  const [newItem, setNewItem] = useState('');
  const [newItemPriority, setNewItemPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showActivitySelector, setShowActivitySelector] = useState(false);

  const completedItems = items.filter(item => item.completed).length;
  const progressPercentage = items.length > 0 ? (completedItems / items.length) * 100 : 0;

  const handleAddItem = () => {
    if (newItem.trim()) {
      const newJourneyItem: JourneyItem = {
        id: Date.now().toString(),
        text: newItem.trim(),
        completed: false,
        status: 'pending',
        priority: newItemPriority
      };
      onAddItem(newJourneyItem);
      setNewItem('');
      setIsAddingItem(false);
      setNewItemPriority('medium');
    }
  };

  const handleCheckboxChange = (item: JourneyItem) => {
    const newStatus = item.completed ? 'pending' : 'completed';
    onUpdateItem(item.id, {
      completed: !item.completed,
      status: newStatus
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'in_progress': return 'text-blue-400';
      case 'blocked': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-400/50 bg-red-500/10';
      case 'medium': return 'border-yellow-400/50 bg-yellow-500/10';
      case 'low': return 'border-green-400/50 bg-green-500/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const predefinedActivities = [
    'Prepare Emirates ID copy',
    'Submit trade name application',
    'Obtain NOC from municipality',
    'Complete fire safety inspection',
    'Get health department approval',
    'Submit financial documents',
    'Pay government fees',
    'Schedule site inspection',
    'Complete training requirements',
    'Submit insurance documentation'
  ];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      {/* Header with Progress */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-white font-['DM_Sans'] text-xl font-semibold leading-[160%] tracking-[0.058px]">
              {title}
            </h3>
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
              <span className="text-[#54FFD4] font-['DM_Sans'] text-xs font-medium">
                {completedItems}/{items.length}
              </span>
            </div>
          </div>
          <p className="text-white/70 font-['DM_Sans'] text-sm">{description}</p>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#54FFD4] to-[#21FCC6] transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-white/60 mt-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
          </div>
        </div>

        {showAdminActions && (
          <button
            onClick={onToggleAdminView}
            className="ml-4 flex items-center gap-2 bg-[#54FFD4]/20 hover:bg-[#54FFD4]/30 px-3 py-2 rounded-lg border border-[#54FFD4]/30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="#54FFD4"/>
            </svg>
            <span className="text-[#54FFD4] font-['DM_Sans'] text-sm font-medium">
              {isAdminView ? 'View Applicant' : 'View Admin Actions'}
            </span>
          </button>
        )}
      </div>

      {/* Admin View Toggle Info */}
      {isAdminView && (
        <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#60A5FA"/>
            </svg>
            <span className="text-blue-300 font-['DM_Sans'] text-sm font-medium">Administrative View Active</span>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-lg p-3 border transition-all duration-200 ${getPriorityColor(item.priority)} ${
              item.completed ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-center gap-3 flex-1">
              {/* Interactive Checkbox */}
              <button
                onClick={() => handleCheckboxChange(item)}
                className="w-6 h-6 flex items-center justify-center transition-all duration-200"
              >
                {item.completed ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#54FFD4"/>
                    <path d="M9 12l2 2 4-4" stroke="#0B0C28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="#54FFD4" strokeWidth="2" fill="none"/>
                  </svg>
                )}
              </button>

              <div className="flex-1">
                <span className={`text-white font-['DM_Sans'] text-sm ${item.completed ? 'line-through opacity-75' : ''}`}>
                  {item.text}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-white/50">•</span>
                  <span className="text-xs text-white/50 capitalize">{item.priority} Priority</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Status Change Buttons */}
              <div className="flex gap-1">
                <button
                  onClick={() => onUpdateItem(item.id, { status: 'in_progress' })}
                  className="w-6 h-6 bg-blue-500/20 hover:bg-blue-500/40 rounded border border-blue-400/30 flex items-center justify-center transition-colors"
                  title="Set In Progress"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" fill="#60A5FA"/>
                  </svg>
                </button>
                <button
                  onClick={() => onUpdateItem(item.id, { status: 'blocked' })}
                  className="w-6 h-6 bg-red-500/20 hover:bg-red-500/40 rounded border border-red-400/30 flex items-center justify-center transition-colors"
                  title="Mark as Blocked"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-white/50 hover:text-red-400 transition-colors p-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Section */}
      {isAddingItem ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Enter new task..."
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 font-['DM_Sans'] text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
              autoFocus
            />
            <select
              value={newItemPriority}
              onChange={(e) => setNewItemPriority(e.target.value as 'low' | 'medium' | 'high')}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white font-['DM_Sans'] text-sm"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleAddItem}
              className="bg-[#54FFD4] hover:bg-[#54FFD4]/80 px-4 py-2 rounded-lg text-black font-['DM_Sans'] text-sm font-medium transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => setShowActivitySelector(!showActivitySelector)}
              className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 px-4 py-2 rounded-lg text-blue-300 font-['DM_Sans'] text-sm font-medium transition-colors"
            >
              Quick Add
            </button>
            <button
              onClick={() => {
                setIsAddingItem(false);
                setNewItem('');
                setShowActivitySelector(false);
              }}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-white font-['DM_Sans'] text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Quick Activity Selector */}
          {showActivitySelector && (
            <div className="bg-white/5 border border-white/20 rounded-lg p-3">
              <h4 className="text-white font-['DM_Sans'] text-sm font-semibold mb-2">Quick Add Activities:</h4>
              <div className="grid grid-cols-1 gap-2">
                {predefinedActivities.map((activity, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newJourneyItem: JourneyItem = {
                        id: Date.now().toString() + index,
                        text: activity,
                        completed: false,
                        status: 'pending',
                        priority: 'medium'
                      };
                      onAddItem(newJourneyItem);
                    }}
                    className="text-left p-2 bg-white/5 hover:bg-white/10 rounded border border-white/10 hover:border-[#54FFD4]/30 text-white text-sm transition-colors"
                  >
                    + {activity}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsAddingItem(true)}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-[#54FFD4]/50 rounded-lg p-3 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5v14M5 12h14" stroke="#54FFD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[#54FFD4] font-['DM_Sans'] text-sm font-medium">Add New Task</span>
        </button>
      )}
    </div>
  );
};

interface Application {
  id: string;
  applicantName: string;
  businessName: string;
  businessType: string;
  location: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedDate: string;
  reviewedBy?: string;
}

const mockApplications: Application[] = [
  {
    id: 'APP-2024-001',
    applicantName: 'Ahmed Al Mansoori',
    businessName: 'Corniche Fine Dining',
    businessType: 'Restaurant',
    location: 'Abu Dhabi Corniche',
    status: 'pending',
    submittedDate: '2024-01-15'
  },
  {
    id: 'APP-2024-002',
    applicantName: 'Fatima Al Zahra',
    businessName: 'Quick Bites Express',
    businessType: 'Fast Food',
    location: 'Al Khalidiya',
    status: 'under_review',
    submittedDate: '2024-01-12'
  },
  {
    id: 'APP-2024-003',
    applicantName: 'Omar Al Rashid',
    businessName: 'Tech Solutions Branch',
    businessType: 'Branch Office',
    location: 'ADGM',
    status: 'approved',
    submittedDate: '2024-01-10'
  }
];

const ApplicantView: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [selectedActivities, setSelectedActivities] = useState(['Full-service restaurant']);
  const [businessRegistrationItems, setBusinessRegistrationItems] = useState<JourneyItem[]>([
    {
      id: '1',
      text: 'Prepare required documents',
      completed: true,
      status: 'completed',
      priority: 'high'
    },
    {
      id: '2',
      text: 'Submit application form',
      completed: false,
      status: 'in_progress',
      priority: 'high'
    },
    {
      id: '3',
      text: 'Pay registration fees',
      completed: false,
      status: 'pending',
      priority: 'medium'
    }
  ]);
  const [businessLicensingItems, setBusinessLicensingItems] = useState<JourneyItem[]>([
    {
      id: '4',
      text: 'Food service license application',
      completed: false,
      status: 'pending',
      priority: 'high'
    },
    {
      id: '5',
      text: 'Safety compliance documentation',
      completed: false,
      status: 'pending',
      priority: 'medium'
    },
    {
      id: '6',
      text: 'Health department approval',
      completed: false,
      status: 'blocked',
      priority: 'high'
    }
  ]);
  const [showBusinessRegAdmin, setShowBusinessRegAdmin] = useState(false);
  const [showBusinessLicAdmin, setShowBusinessLicAdmin] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-refresh and activity tracking
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      if (timeSinceLastActivity > 30000) { // 30 seconds of inactivity
        showNotification('💡 Tip: Check service status for updates');
        setLastActivity(Date.now());
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [lastActivity]);

  const showNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setLastActivity(Date.now());
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 4000);
  };

  const handleUpdateBusinessRegItem = (id: string, updates: Partial<JourneyItem>) => {
    setBusinessRegistrationItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));

    if (updates.completed !== undefined) {
      showNotification(updates.completed ? '✅ Task completed!' : '↩️ Task reopened');
    } else if (updates.status) {
      showNotification(`📋 Status updated to ${updates.status.replace('_', ' ')}`);
    }
  };

  const handleUpdateBusinessLicItem = (id: string, updates: Partial<JourneyItem>) => {
    setBusinessLicensingItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));

    if (updates.completed !== undefined) {
      showNotification(updates.completed ? '✅ Task completed!' : '↩️ Task reopened');
    } else if (updates.status) {
      showNotification(`📋 Status updated to ${updates.status.replace('_', ' ')}`);
    }
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev =>
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  return (
    <div className="w-full h-screen bg-[#0B0C28] relative overflow-hidden">
      {/* Complex background with gradients and filters */}
      <div className="absolute inset-0">
        {/* Base gradient background */}
        <div className="absolute inset-0 bg-[#0B0C28]"></div>

        {/* Gradient overlays to match Figma design */}
        <div className="absolute -left-96 -top-48 w-[2310px] h-[1719px] rounded-full bg-[#0E0A2B] opacity-40 blur-[200px]"></div>
        <div className="absolute left-60 top-8 w-[1227px] h-[934px] rounded-full bg-[#0919B6] opacity-30 blur-[200px] rotate-[30deg]"></div>
        <div className="absolute left-44 -top-[506px] w-[775px] h-[767px] rounded-full bg-[#07D2FB] opacity-20 blur-[140px]"></div>
        <div className="absolute -left-20 -top-[455px] w-[806px] h-[698px] rounded-full bg-[#21FCC6] opacity-25 blur-[200px]"></div>

        {/* Top overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/30"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 w-full h-[87px] bg-white/30 backdrop-blur-[40px] border-b border-white/30 z-10">
        <div className="flex items-center justify-between h-full px-10">
          {/* TAMM Logo */}
          <div className="flex items-center">
            <svg width="111" height="50" viewBox="0 0 111 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M65.7295 29.4803V38.9246H63.8522V29.4803H60.2384V27.6821H69.359V29.4803H65.7295Z" fill="white"/>
              <path d="M71.2519 34.5152L73.223 34.2494C73.6611 34.1868 73.7862 33.9679 73.7862 33.6865C73.7862 33.0298 73.3482 32.5138 72.3313 32.5138C71.5178 32.4669 70.8138 33.0767 70.7669 33.9054C70.7669 33.9054 70.7669 33.9054 70.7669 33.921L69.0773 33.5458C69.2181 32.2167 70.4071 31.0283 72.3 31.0283C74.6623 31.0283 75.554 32.373 75.554 33.9054V37.7519C75.554 38.1584 75.5853 38.5806 75.6479 38.9871H73.9583C73.8957 38.6588 73.8644 38.3304 73.8801 38.0021C73.3638 38.7839 72.4721 39.253 71.5178 39.2061C70.1881 39.3155 69.0304 38.3148 68.9365 37.0014C68.9365 36.9544 68.9365 36.9232 68.9365 36.8763C68.9522 35.4534 69.9534 34.7028 71.2519 34.5152ZM73.7862 35.7348V35.3596L71.7838 35.6566C71.2206 35.7505 70.7669 36.0632 70.7669 36.7043C70.7669 37.2672 71.2206 37.7206 71.7838 37.7206C71.8151 37.7206 71.8463 37.7206 71.8776 37.7206C72.9101 37.7363 73.7862 37.2359 73.7862 35.7348Z" fill="white"/>
              <path d="M77.7755 38.9245V31.2002H79.5277V32.1853C80.0126 31.4191 80.8574 30.9657 81.7648 30.9813C82.7347 30.9344 83.6421 31.466 84.0645 32.3416C84.5651 31.4504 85.535 30.9187 86.5519 30.9813C87.9442 30.9813 89.2583 31.8726 89.2583 33.9209V38.9245H87.4905V34.2336C87.4905 33.3267 87.0369 32.6544 86.02 32.6544C85.1439 32.6544 84.4243 33.3736 84.4243 34.2649C84.4243 34.2962 84.4243 34.3118 84.4243 34.3431V38.9245H82.6252V34.2493C82.6252 33.358 82.1872 32.67 81.1547 32.67C80.2942 32.6544 79.5746 33.358 79.5589 34.218C79.5589 34.2649 79.5589 34.3118 79.5589 34.3587V38.9401L77.7755 38.9245Z" fill="white"/>
              <path d="M91.511 38.9245V31.2002H93.2631V32.1853C93.7481 31.4191 94.5929 30.9657 95.5003 30.9813C96.4702 30.9344 97.3775 31.466 97.7999 32.3416C98.3006 31.4504 99.2549 30.9187 100.272 30.9813C101.664 30.9813 102.978 31.8726 102.978 33.9209V38.9245H101.257V34.2336C101.351 33.4674 100.819 32.7638 100.053 32.6544C99.9588 32.6387 99.865 32.6387 99.7868 32.6387C98.9107 32.6387 98.191 33.358 98.191 34.2493C98.191 34.2805 98.191 34.2962 98.191 34.3274V38.9088H96.4076V34.2336C96.5015 33.4674 95.9696 32.7638 95.203 32.6544C95.1091 32.6387 95.0153 32.6387 94.9371 32.6387C94.0766 32.6231 93.357 33.3267 93.3414 34.1867C93.3414 34.2336 93.3414 34.2805 93.3414 34.3274V38.9088L91.511 38.9245Z" fill="white"/>
              <path d="M45.6929 19.8349L43.1117 17.2549L43.0647 17.208C42.173 16.4575 41.0466 16.0353 39.8733 15.9727C39.7169 15.9727 37.0417 15.6444 35.0705 16.7545L31.5193 18.6934L32.1764 21.2421L36.2595 19.0062C37.3546 18.4902 38.5748 18.3182 39.7794 18.5058C40.3426 18.5527 40.8902 18.7403 41.3439 19.0687L43.2055 20.9294C40.9997 21.6643 39.3727 23.0872 36.2595 25.9017L33.9285 27.9344L34.6482 30.6708L37.9804 27.8406C40.7807 25.2919 43.1586 23.2905 44.457 23.2905C44.6135 23.2748 44.7699 23.2905 44.9264 23.3374C44.9577 23.7439 44.9107 24.1661 44.8012 24.5726C44.6135 25.0886 44.4101 25.589 44.1598 26.0737L42.9083 28.9195L42.6893 29.373C40.8902 33.0006 40.4521 34.4235 38.5592 35.8933C38.2307 36.1434 37.8709 36.3311 37.4798 36.4562L37.3233 36.5031C36.8227 36.6438 36.3064 36.6438 35.8215 36.5031C35.5868 36.4249 35.3834 36.3154 35.2113 36.1591C34.8828 35.8776 34.6482 35.4711 34.5699 35.0333L29.5169 15.2378C29.1571 13.7837 28.4374 11.1568 24.3699 11.0004H20.2399C19.6297 10.9848 19.0822 11.407 18.9258 12.0011C18.7693 12.5953 19.0353 13.2051 19.5672 13.5022C19.8801 13.7055 20.1304 13.9713 20.3181 14.284C20.7874 15.0502 20.9439 15.9571 20.7718 16.8327L20.6466 17.3018L15.9847 35.0176C15.8908 35.4398 15.6718 35.8307 15.3432 36.1434C14.9991 36.4249 14.561 36.5969 14.123 36.5969C13.3252 36.6282 12.5429 36.3623 11.9328 35.862C10.0555 34.3922 9.60184 32.9693 7.80276 29.3573L6.31656 26.0424C6.06625 25.5577 5.84724 25.0574 5.67515 24.5414C5.58129 24.1348 5.53435 23.7283 5.55 23.3061C5.70644 23.2436 5.86288 23.2279 6.01932 23.2592C7.63067 23.4781 9.68006 25.2606 12.496 27.8093L15.8282 30.6395L16.5322 27.9188L14.1856 25.9174C11.1037 23.1185 9.42975 21.6799 7.23957 20.9294L9.10123 19.0687C9.57055 18.7403 10.1025 18.5527 10.6813 18.5058C11.8702 18.3025 13.1061 18.4745 14.1856 19.0062L18.2687 21.2421L18.9258 18.6934L15.3745 16.7545C13.419 15.6287 10.7439 15.9415 10.5718 15.9884C9.39846 16.0353 8.28773 16.4731 7.38037 17.2236L7.33343 17.2705L4.75214 19.8505C3.70398 20.7574 3.06258 22.0709 3 23.4625C3.06258 24.8072 3.45368 26.105 4.12638 27.2621L5.59693 30.5457C7.45859 34.3453 8.08435 36.0965 10.4153 37.9416C11.1037 38.4889 11.9172 38.8641 12.7776 39.0674C13.7163 39.2707 14.7018 39.2238 15.6092 38.9423C16.6574 38.5827 17.5334 37.8321 18.0653 36.8627C18.2687 36.5031 18.4095 36.1278 18.519 35.7369L23.2905 17.5051C23.2905 17.4582 23.2905 17.4269 23.2905 17.38C23.5408 16.0822 23.3844 14.7531 22.8212 13.5648H24.2135C24.9957 13.5022 25.7466 13.7837 26.3098 14.3153C26.654 14.7844 26.873 15.3316 26.9669 15.9102L32.0199 35.6431C32.1138 36.0496 32.2702 36.4562 32.4736 36.8314C32.9899 37.8165 33.8659 38.5827 34.9298 38.9267C35.4617 39.0987 36.0092 39.1925 36.5567 39.1925C36.9478 39.1925 37.3546 39.1456 37.7457 39.0674C38.6061 38.8641 39.4196 38.4889 40.1236 37.9416C42.4546 36.0965 43.0804 34.3453 44.942 30.5457L46.4126 27.2621C47.0853 26.105 47.4607 24.8072 47.539 23.4625C47.4294 22.0709 46.7724 20.7574 45.6929 19.8349Z" fill="white"/>
            </svg>
          </div>

          {/* Center Title */}
          <div className="text-white text-center font-['DM_Sans'] text-base font-medium leading-[130%]">
            Investor Journey for a Restaurant
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 text-white">
            <div className="text-right">
              <div className="font-['DM_Sans'] text-sm font-semibold">{user.name}</div>
              <div className="font-['DM_Sans'] text-xs opacity-75">Emirates ID: {user.emiratesId}</div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-['DM_Sans'] text-sm font-bold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps Bar - Matching Figma Design Exactly */}
      <div className="w-full h-20 bg-white/30 backdrop-blur-[40px] shadow-[0_4px_4px_0_rgba(0,0,0,0.25),0_4px_4px_0_rgba(0,0,0,0.25)] flex items-center justify-center absolute top-[87px] left-0 z-10">
        <div className="w-full h-full flex items-center">
          {/* Step 1: Questionnaire - Active */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-3 border-r border-white/30 bg-white/10 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Questionnaire
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.4001 1.50024C10.3234 1.50024 8.29333 2.11606 6.56661 3.26981C4.83989 4.42357 3.49408 6.06344 2.69936 7.98207C1.90464 9.90069 1.69671 12.0119 2.10185 14.0487C2.507 16.0855 3.50703 17.9564 4.97548 19.4249C6.44393 20.8933 8.31485 21.8933 10.3517 22.2985C12.3885 22.7036 14.4997 22.4957 16.4183 21.701C18.3369 20.9063 19.9768 19.5604 21.1305 17.8337C22.2843 16.107 22.9001 14.0769 22.9001 12.0002C22.9001 9.21547 21.7938 6.54475 19.8247 4.57562C17.8556 2.60649 15.1849 1.50024 12.4001 1.50024ZM12.4001 21.0002C10.6201 21.0002 8.88001 20.4724 7.39997 19.4835C5.91992 18.4945 4.76637 17.0889 4.08518 15.4444C3.40399 13.7999 3.22576 11.9903 3.57303 10.2444C3.9203 8.4986 4.77746 6.89496 6.03614 5.63628C7.29481 4.37761 8.89846 3.52044 10.6443 3.17318C12.3901 2.82591 14.1997 3.00414 15.8442 3.68533C17.4888 4.36652 18.8944 5.52007 19.8833 7.00011C20.8723 8.48015 21.4001 10.2202 21.4001 12.0002C21.4001 14.3872 20.4519 16.6764 18.7641 18.3642C17.0762 20.052 14.787 21.0002 12.4001 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 2: Business Registration - Inactive */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-3 border-r border-white/30 opacity-50 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Business Registration
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.2 1.50024C10.1233 1.50024 8.09328 2.11606 6.36656 3.26981C4.63984 4.42357 3.29403 6.06344 2.49931 7.98207C1.70459 9.90069 1.49666 12.0119 1.9018 14.0487C2.30695 16.0855 3.30697 17.9564 4.77543 19.4249C6.24388 20.8933 8.1148 21.8933 10.1516 22.2985C12.1884 22.7036 14.2996 22.4957 16.2182 21.701C18.1368 20.9063 19.7767 19.5604 20.9305 17.8337C22.0842 16.107 22.7 14.0769 22.7 12.0002C22.7 9.21547 21.5938 6.54475 19.6247 4.57562C17.6555 2.60649 14.9848 1.50024 12.2 1.50024ZM12.2 21.0002C10.42 21.0002 8.67996 20.4724 7.19992 19.4835C5.71987 18.4945 4.56632 17.0889 3.88513 15.4444C3.20394 13.7999 3.02571 11.9903 3.37298 10.2444C3.72025 8.4986 4.57741 6.89496 5.83609 5.63628C7.09476 4.37761 8.69841 3.52044 10.4442 3.17318C12.1901 2.82591 13.9997 3.00414 15.6442 3.68533C17.2887 4.36652 18.6943 5.52007 19.6833 7.00011C20.6722 8.48015 21.2 10.2202 21.2 12.0002C21.2 14.3872 20.2518 16.6764 18.564 18.3642C16.8762 20.052 14.587 21.0002 12.2 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 3: Submit Documents - Inactive */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-2 border-r border-white/30 opacity-50 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Submit Documents
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.0002 2.00024C9.92348 2.00024 7.89342 2.61606 6.1667 3.76981C4.43998 4.92357 3.09417 6.56344 2.29945 8.48207C1.50473 10.4007 1.2968 12.5119 1.70194 14.5487C2.10709 16.5855 3.10712 18.4564 4.57557 19.9249C6.04402 21.3933 7.91494 22.3933 9.95174 22.7985C11.9885 23.2036 14.0997 22.9957 16.0184 22.201C17.937 21.4063 19.5769 20.0604 20.7306 18.3337C21.8844 16.607 22.5002 14.5769 22.5002 12.5002C22.5002 9.71547 21.3939 7.04475 19.4248 5.07562C17.4557 3.10649 14.785 2.00024 12.0002 2.00024ZM12.0002 21.5002C10.2202 21.5002 8.4801 20.9724 7.00006 19.9835C5.52001 18.9945 4.36646 17.5889 3.68527 15.9444C3.00408 14.2999 2.82585 12.4903 3.17312 10.7444C3.52039 8.9986 4.37755 7.39496 5.63623 6.13628C6.8949 4.87761 8.49855 4.02044 10.2444 3.67318C11.9902 3.32591 13.7998 3.50414 15.4443 4.18533C17.0889 4.86652 18.4945 6.02007 19.4834 7.50011C20.4723 8.98015 21.0002 10.7202 21.0002 12.5002C21.0002 14.8872 20.052 17.1764 18.3641 18.8642C16.6763 20.552 14.3871 21.5002 12.0002 21.5002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 4: Business Licensing - Inactive */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-2 border-r border-white/30 opacity-50 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Business Licensing
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.8002 1.50024C10.7235 1.50024 8.69346 2.11606 6.96675 3.26981C5.24003 4.42357 3.89422 6.06344 3.0995 7.98207C2.30478 9.90069 2.09685 12.0119 2.50199 14.0487C2.90714 16.0855 3.90716 17.9564 5.37562 19.4249C6.84407 20.8933 8.71499 21.8933 10.7518 22.2985C12.7886 22.7036 14.8998 22.4957 16.8184 21.701C18.737 20.9063 20.3769 19.5604 21.5307 17.8337C22.6844 16.107 23.3002 14.0769 23.3002 12.0002C23.3002 9.21547 22.194 6.54475 20.2249 4.57562C18.2557 2.60649 15.585 1.50024 12.8002 1.50024ZM12.8002 21.0002C11.0202 21.0002 9.28015 20.4724 7.8001 19.4835C6.32006 18.4945 5.16651 17.0889 4.48532 15.4444C3.80413 13.7999 3.6259 11.9903 3.97317 10.2444C4.32044 8.4986 5.1776 6.89496 6.43628 5.63628C7.69495 4.37761 9.2986 3.52044 11.0444 3.17318C12.7903 2.82591 14.5999 3.00414 16.2444 3.68533C17.8889 4.36652 19.2945 5.52007 20.2835 7.00011C21.2724 8.48015 21.8002 10.2202 21.8002 12.0002C21.8002 14.3872 20.852 16.6764 19.1642 18.3642C17.4764 20.052 15.1872 21.0002 12.8002 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Step 5: Pre-Operational Inspection - Inactive */}
          <div className="flex-1 flex flex-col items-center justify-center gap-2.5 px-5 py-2 opacity-50 relative">
            <div className="flex flex-col items-center gap-1">
              <div className="text-white text-center font-['Manrope'] text-sm font-bold leading-[133%]">
                Pre-Operational Inspection
              </div>
              <div className="w-6 h-6 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.6001 1.50024C10.5234 1.50024 8.49333 2.11606 6.76661 3.26981C5.0399 4.42357 3.69409 6.06344 2.89937 7.98207C2.10465 9.90069 1.89671 12.0119 2.30186 14.0487C2.707 16.0855 3.70703 17.9564 5.17548 19.4249C6.64393 20.8933 8.51485 21.8933 10.5517 22.2985C12.5885 22.7036 14.6997 22.4957 16.6183 21.701C18.5369 20.9063 20.1768 19.5604 21.3305 17.8337C22.4843 16.107 23.1001 14.0769 23.1001 12.0002C23.1001 9.21547 21.9939 6.54475 20.0247 4.57562C18.0556 2.60649 15.3849 1.50024 12.6001 1.50024ZM12.6001 21.0002C10.8201 21.0002 9.08001 20.4724 7.59997 19.4835C6.11993 18.4945 4.96638 17.0889 4.28519 15.4444C3.604 13.7999 3.42577 11.9903 3.77303 10.2444C4.1203 8.4986 4.97747 6.89496 6.23614 5.63628C7.49481 4.37761 9.09846 3.52044 10.8443 3.17318C12.5901 2.82591 14.3997 3.00414 16.0443 3.68533C17.6888 4.36652 19.0944 5.52007 20.0833 7.00011C21.0723 8.48015 21.6001 10.2202 21.6001 12.0002C21.6001 14.3872 20.6519 16.6764 18.9641 18.3642C17.2762 20.052 14.9871 21.0002 12.6001 21.0002Z" fill="white"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="absolute top-[167px] left-0 w-full h-[calc(100vh-167px)] flex gap-6 px-11 py-12">
        {/* Left Panel - Form */}
        <div className="w-[633px] h-[1030px] bg-white/14 rounded-3xl opacity-80 relative">
          {/* Dividers */}
          <div className="absolute w-full h-0 bg-white/18 top-[77px]"></div>
          <div className="absolute w-full h-0 bg-white/18 top-[344px]"></div>
          <div className="absolute w-full h-0 bg-white/18 top-[695px]"></div>

          {/* Journey Number */}
          <div className="absolute left-8 top-6 w-[410px] h-[29px]">
            <span className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
              Journey Number: 0987654321
            </span>
          </div>

          {/* Progress indicator */}
          <div className="absolute right-8 top-6 w-[118px] h-[26px]">
            <span className="text-[#54FFD4] font-['DM_Sans'] text-base font-normal leading-[160%] tracking-[0.051px]">
              2 of 8 complete
            </span>
          </div>

          {/* Legal Structure Section */}
          <div className="absolute left-8 top-[109px] w-[410px] h-[29px]">
            <span className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
              1. Legal Structure
            </span>
          </div>

          {/* New Business - Limited Liability Company */}
          <div className="absolute left-10 top-[170px] flex items-center gap-10 w-[528px] h-[31px]">
            <div className="w-[31px] h-[31px] flex items-center justify-center">
              <svg width="27" height="27" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.4999 0.9375C18.0969 0.9375 21.5463 2.36674 24.0898 4.91016C26.6332 7.45361 28.0624 10.903 28.0624 14.5C28.0624 17.1824 27.2675 19.8048 25.7773 22.0352C24.287 24.2655 22.1686 26.0038 19.6904 27.0303C17.2122 28.0568 14.4852 28.325 11.8544 27.8018C9.22356 27.2784 6.80684 25.9866 4.9101 24.0898C3.01338 22.1931 1.72149 19.7763 1.19818 17.1455C0.674976 14.5148 0.943204 11.7877 1.96967 9.30957C2.99612 6.83158 4.7347 4.71385 6.96478 3.22363C9.19509 1.73339 11.8176 0.937525 14.4999 0.9375ZM18.9492 3.75977C16.825 2.87992 14.4873 2.65012 12.2324 3.09863C9.97733 3.54719 7.906 4.65449 6.28021 6.28027C4.65446 7.90605 3.54712 9.97742 3.09857 12.2324C2.65013 14.4872 2.88004 16.8243 3.7597 18.9482C4.63957 21.0724 6.13021 22.8886 8.04193 24.166C9.95355 25.4432 12.2009 26.125 14.4999 26.125C17.5831 26.125 20.5405 24.8998 22.7206 22.7197C24.9005 20.5397 26.1249 17.5829 26.1249 14.5C26.1249 12.2009 25.4432 9.95363 24.166 8.04199C22.8886 6.13036 21.0732 4.63965 18.9492 3.75977ZM21.2812 11.0264L12.5624 19.7441L7.71869 14.8994L9.08783 13.5312L12.5624 17.0049L19.9101 9.65625L21.2812 11.0264Z" fill="#54FFD4"/>
              </svg>
            </div>
            <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%]">
              New Business - Limited Liability Company
            </div>
          </div>

          {/* Ownership - Single Owner */}
          <div className="absolute left-10 top-[225px] flex items-center gap-10 w-[528px] h-[31px]">
            <div className="w-[31px] h-[31px] flex items-center justify-center">
              <svg width="27" height="27" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.4999 0.9375C18.0969 0.9375 21.5463 2.36674 24.0898 4.91016C26.6332 7.45361 28.0624 10.903 28.0624 14.5C28.0624 17.1824 27.2675 19.8048 25.7773 22.0352C24.287 24.2655 22.1686 26.0038 19.6904 27.0303C17.2122 28.0568 14.4852 28.325 11.8544 27.8018C9.22356 27.2784 6.80684 25.9866 4.9101 24.0898C3.01338 22.1931 1.72149 19.7763 1.19818 17.1455C0.674976 14.5148 0.943204 11.7877 1.96967 9.30957C2.99612 6.83158 4.7347 4.71385 6.96478 3.22363C9.19509 1.73339 11.8176 0.937525 14.4999 0.9375ZM18.9492 3.75977C16.825 2.87992 14.4873 2.65012 12.2324 3.09863C9.97733 3.54719 7.906 4.65449 6.28021 6.28027C4.65446 7.90605 3.54712 9.97742 3.09857 12.2324C2.65013 14.4872 2.88004 16.8243 3.7597 18.9482C4.63957 21.0724 6.13021 22.8886 8.04193 24.166C9.95355 25.4432 12.2009 26.125 14.4999 26.125C17.5831 26.125 20.5405 24.8998 22.7206 22.7197C24.9005 20.5397 26.1249 17.5829 26.1249 14.5C26.1249 12.2009 25.4432 9.95363 24.166 8.04199C22.8886 6.13036 21.0732 4.63965 18.9492 3.75977ZM21.2812 11.0264L12.5624 19.7441L7.71869 14.8994L9.08783 13.5312L12.5624 17.0049L19.9101 9.65625L21.2812 11.0264Z" fill="#54FFD4"/>
              </svg>
            </div>
            <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%]">
              Ownership - Single Owner
            </div>
          </div>

          {/* Nationality - UAE National */}
          <div className="absolute left-10 top-[280px] flex items-center gap-10 w-[529px] h-[32px]">
            <div className="w-8 h-8 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14.0002 0C17.7131 5.25326e-05 21.2741 1.47512 23.8996 4.10059C26.525 6.72607 28.0002 10.287 28.0002 14C28.0002 17.713 26.525 21.2739 23.8996 23.8994C21.2741 26.5249 17.7131 27.9999 14.0002 28V26C17.1827 25.9999 20.2351 24.7357 22.4855 22.4854C24.7359 20.2349 26.0002 17.1825 26.0002 14C26.0002 10.8175 24.7359 7.76506 22.4855 5.51465C20.2351 3.26426 17.1827 2.00005 14.0002 2V0ZM6.24042 23.1406C7.31765 24.0481 8.54662 24.7588 9.8703 25.2402L9.17987 27.1104C7.6536 26.5498 6.23876 25.7233 5.00018 24.6699L6.24042 23.1406ZM2.18964 16C2.42408 17.4036 2.89801 18.7566 3.59003 20L1.85956 21C1.04 19.579 0.474833 18.0256 0.189636 16.4102L2.18964 16ZM3.59003 8C2.90893 9.22053 2.4452 10.5503 2.21991 11.9297L0.21991 11.5898C0.501212 9.97774 1.05558 8.42536 1.85956 7L3.59003 8ZM9.81952 2.76074C8.51357 3.24745 7.30252 3.95795 6.24042 4.86035L5.00018 3.33008C6.22367 2.28181 7.62153 1.45639 9.13007 0.890625L9.81952 2.76074Z" fill="#54FFD4"/>
              </svg>
            </div>
            <div className="text-white font-['DM_Sans'] text-lg font-normal leading-[136%]">
              Nationality - UAE National
            </div>
          </div>

          {/* Business Activities Section */}
          <div className="absolute left-8 top-[376px] w-[410px] h-[29px]">
            <span className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
              2. Business Activities
            </span>
          </div>

          <div className="absolute left-10 top-[417px] w-[332px] h-[22px]">
            <span className="text-white font-['DM_Sans'] text-sm font-normal leading-[160%] tracking-[0.045px]">
              Choose from the below AI recommended activities
            </span>
          </div>

          {/* Interactive Business Activities List */}
          <div className="absolute left-10 top-[463px] w-[550px] space-y-4">
            {selectedActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between bg-white/10 rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#54FFD4"/>
                      <path d="M9 12l2 2 4-4" stroke="#0B0C28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-white font-['DM_Sans'] text-lg font-normal leading-[160%] tracking-[0.058px]">
                    {activity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400 text-sm font-medium bg-green-400/10 px-2 py-1 rounded border border-green-400/30">
                    APPROVED
                  </span>
                  <button
                    onClick={() => {
                      setSelectedActivities(selectedActivities.filter((_, i) => i !== index));
                      showNotification('❌ Activity removed');
                    }}
                    className="text-white/50 hover:text-red-400 transition-colors p-1"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Activity Selector */}
            <div className="bg-white/5 border border-white/20 rounded-lg p-4">
              <h4 className="text-white font-['DM_Sans'] text-sm font-semibold mb-3">Add Business Activities:</h4>
              <div className="grid grid-cols-1 gap-2 mb-3">
                {[
                  'Take-away/delivery services',
                  'Outdoor seating services',
                  'Live entertainment',
                  'Alcohol service',
                  'Private dining rooms',
                  'Catering services',
                  'Event hosting',
                  'Cooking classes'
                ].filter(activity => !selectedActivities.includes(activity)).map((activity, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedActivities([...selectedActivities, activity]);
                      showNotification('✅ New activity added');
                    }}
                    className="text-left p-3 bg-white/5 hover:bg-white/10 rounded border border-white/10 hover:border-[#54FFD4]/30 text-white text-sm transition-colors flex items-center justify-between"
                  >
                    <span>+ {activity}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded border border-blue-400/30">
                        RECOMMENDED
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Activity Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter custom activity..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 font-['DM_Sans'] text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim() && !selectedActivities.includes(input.value.trim())) {
                        setSelectedActivities([...selectedActivities, input.value.trim()]);
                        showNotification('��� Custom activity added');
                        input.value = '';
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                    if (input.value.trim() && !selectedActivities.includes(input.value.trim())) {
                      setSelectedActivities([...selectedActivities, input.value.trim()]);
                      showNotification('✅ Custom activity added');
                      input.value = '';
                    }
                  }}
                  className="bg-[#54FFD4] hover:bg-[#54FFD4]/80 px-4 py-2 rounded-lg text-black font-['DM_Sans'] text-sm font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Physical Space Requirements Section */}
          <div className="absolute left-8 top-[727px] w-[410px] h-[29px]">
            <span className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
              3. Physical Space Requirements
            </span>
          </div>

          {/* Journey Cards Section - replacing the static list */}
          <div className="absolute left-10 top-[788px] w-[570px] space-y-6">
            {/* Business Registration Journey Card */}
            <JourneyCard
              title="Business Registration"
              description="Complete the business registration process"
              items={businessRegistrationItems}
              onAddItem={(item) => {
                setBusinessRegistrationItems([...businessRegistrationItems, item]);
                showNotification('➕ New task added to Business Registration');
              }}
              onUpdateItem={handleUpdateBusinessRegItem}
              onRemoveItem={(id) => {
                setBusinessRegistrationItems(businessRegistrationItems.filter(item => item.id !== id));
                showNotification('🗑️ Task removed');
              }}
              showAdminActions={true}
              onToggleAdminView={() => setShowBusinessRegAdmin(!showBusinessRegAdmin)}
              isAdminView={showBusinessRegAdmin}
            />

            {/* Business Licensing Journey Card */}
            <JourneyCard
              title="Business Licensing"
              description="Obtain required licenses for restaurant operation"
              items={businessLicensingItems}
              onAddItem={(item) => {
                setBusinessLicensingItems([...businessLicensingItems, item]);
                showNotification('➕ New task added to Business Licensing');
              }}
              onUpdateItem={handleUpdateBusinessLicItem}
              onRemoveItem={(id) => {
                setBusinessLicensingItems(businessLicensingItems.filter(item => item.id !== id));
                showNotification('🗑️ Task removed');
              }}
              showAdminActions={true}
              onToggleAdminView={() => setShowBusinessLicAdmin(!showBusinessLicAdmin)}
              isAdminView={showBusinessLicAdmin}
            />
          </div>

          {/* Enhanced Notification Toast System */}
          <div className="fixed top-24 right-6 z-50 space-y-2">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 300, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 30
                    }
                  }}
                  exit={{
                    opacity: 0,
                    x: 300,
                    scale: 0.8,
                    transition: {
                      duration: 0.2
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-3 rounded-lg shadow-lg font-['DM_Sans'] text-sm font-medium max-w-sm border ${
                    notification.includes('✅')
                      ? 'bg-gradient-to-r from-green-400 to-green-500 text-white border-green-300'
                      : notification.includes('❌') || notification.includes('🗑️')
                      ? 'bg-gradient-to-r from-red-400 to-red-500 text-white border-red-300'
                      : notification.includes('📋') || notification.includes('🔄')
                      ? 'bg-gradient-to-r from-blue-400 to-blue-500 text-white border-blue-300'
                      : 'bg-gradient-to-r from-[#54FFD4] to-[#21FCC6] text-black border-[#54FFD4]'
                  } cursor-pointer`}
                  onClick={() => {
                    setNotifications(prev => prev.filter((_, i) => i !== index));
                  }}
                >
                  <div className="flex items-center gap-2">
                    {notification.includes('✅') && (
                      <motion.div
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        🎉
                      </motion.div>
                    )}
                    <span>{notification}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Celebration Effect for Major Completions */}
          {businessRegistrationItems.every(item => item.completed) && businessLicensingItems.every(item => item.completed) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-gradient-to-r from-green-400 to-green-600 text-white px-8 py-4 rounded-2xl shadow-2xl"
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🎉 Congratulations! 🎉</div>
                  <div className="text-lg font-bold">All Tasks Completed!</div>
                  <div className="text-sm opacity-90">Your restaurant license application is ready for submission</div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Right Panel - AI Assistant or Admin Details */}
        <div className="w-[446px] min-h-[426px] bg-white/20 rounded-3xl shadow-[0_4px_44px_0_#169F9F] relative">
          {(showBusinessRegAdmin || showBusinessLicAdmin) && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-['DM_Sans'] text-lg font-semibold">
                  {showBusinessRegAdmin ? 'Business Registration Admin' : 'Business Licensing Admin'}
                </h3>
                <button
                  onClick={() => {
                    setShowBusinessRegAdmin(false);
                    setShowBusinessLicAdmin(false);
                  }}
                  className="text-white/70 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                  <h4 className="text-blue-300 font-['DM_Sans'] text-sm font-semibold mb-2">Reviewer Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg p-2 text-green-300 text-sm transition-colors">
                      Approve Section
                    </button>
                    <button className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-lg p-2 text-yellow-300 text-sm transition-colors">
                      Request Changes
                    </button>
                    <button className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg p-2 text-red-300 text-sm transition-colors">
                      Reject Section
                    </button>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                  <h4 className="text-white font-['DM_Sans'] text-sm font-semibold mb-2">Status Information</h4>
                  <div className="text-white/70 text-sm space-y-1">
                    <p>• Current Status: Under Review</p>
                    <p>• Assigned Reviewer: {user.name}</p>
                    <p>• Last Updated: {new Date().toLocaleDateString()}</p>
                    <p>• Processing Time: 2-3 business days</p>
                  </div>
                </div>

                <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                  <h4 className="text-white font-['DM_Sans'] text-sm font-semibold mb-2">Comments</h4>
                  <textarea
                    placeholder="Add review comments..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white placeholder-white/50 text-sm h-20 resize-none"
                  />
                  <button className="mt-2 bg-[#54FFD4] hover:bg-[#54FFD4]/80 px-4 py-2 rounded-lg text-black font-['DM_Sans'] text-sm font-medium transition-colors">
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Dashboard Content */}
          <div className={`${(showBusinessRegAdmin || showBusinessLicAdmin) ? 'opacity-30' : ''} h-full`}>
            {/* Header with Service Status */}
            <div className="absolute top-4 left-6 right-6 h-[77px]">
              <div className="flex items-center gap-2 p-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/af7a85c3abd1e9919038804c2289238af996c940?width=128"
                  alt="AI Assistant"
                  className="w-16 h-16 rounded-full border border-[#54FFD4]"
                />
                <div>
                  <div className="text-white font-['DM_Sans'] text-lg font-semibold leading-[160%] tracking-[0.058px]">
                    Smart Assistant
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-['DM_Sans'] text-xs">Online</span>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 ml-auto">
                  {[5.77, 11.952, 19.783, 13.189, 8.655, 23.081, 30.499, 16.898, 4.534].map((width, i) => (
                    <div
                      key={i}
                      className="bg-[#54FFD4] rounded-[15.737px] transform -rotate-90"
                      style={{ width: `${width}px`, height: '3.297px' }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Overall Progress Section */}
            <div className="absolute top-[100px] left-6 right-6">
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="text-white font-['DM_Sans'] text-base font-semibold mb-2">
                  Overall Progress
                </div>

                {/* Combined Progress Bar */}
                <div className="mb-3">
                  <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#54FFD4] to-[#21FCC6] transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.round(((businessRegistrationItems.filter(i => i.completed).length + businessLicensingItems.filter(i => i.completed).length) / (businessRegistrationItems.length + businessLicensingItems.length)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-white/60 mt-1">
                    <span>Journey Progress</span>
                    <span>{Math.round(((businessRegistrationItems.filter(i => i.completed).length + businessLicensingItems.filter(i => i.completed).length) / (businessRegistrationItems.length + businessLicensingItems.length)) * 100)}% Complete</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/10 rounded p-2">
                    <div className="text-xs text-white/70">Completed</div>
                    <div className="text-lg font-bold text-green-400">
                      {businessRegistrationItems.filter(i => i.completed).length + businessLicensingItems.filter(i => i.completed).length}
                    </div>
                  </div>
                  <div className="bg-white/10 rounded p-2">
                    <div className="text-xs text-white/70">Remaining</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {businessRegistrationItems.filter(i => !i.completed).length + businessLicensingItems.filter(i => !i.completed).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Status Checker */}
            <div className="absolute top-[250px] left-6 right-6">
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <div className="text-white font-['DM_Sans'] text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="3" fill="#54FFD4"/>
                    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" stroke="#54FFD4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Service Status
                </div>

                <div className="space-y-2">
                  {[
                    { service: 'DED Portal', status: 'online', responseTime: '1.2s' },
                    { service: 'Municipality System', status: 'online', responseTime: '0.8s' },
                    { service: 'Health Department', status: 'maintenance', responseTime: '5.0s' },
                    { service: 'Fire Safety Dept', status: 'online', responseTime: '1.5s' }
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          service.status === 'online' ? 'bg-green-400' :
                          service.status === 'maintenance' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                        <span className="text-white text-xs">{service.service}</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${
                          service.status === 'online' ? 'text-green-400' :
                          service.status === 'maintenance' ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {service.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-white/50">{service.responseTime}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showNotification('🔄 Services refreshed')}
                  className="w-full mt-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded p-2 text-white text-xs transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="absolute top-[420px] left-6 right-6 bottom-6">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-white font-['DM_Sans'] text-sm font-semibold mb-3">Quick Actions</div>
                <div className="space-y-2">
                  <button
                    onClick={() => showNotification('📋 Application summary generated')}
                    className="w-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded p-2 text-blue-300 text-sm transition-colors"
                  >
                    Generate Summary
                  </button>
                  <button
                    onClick={() => showNotification('📧 Email notifications enabled')}
                    className="w-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded p-2 text-purple-300 text-sm transition-colors"
                  >
                    Setup Notifications
                  </button>
                  <button
                    onClick={() => showNotification('💾 Progress saved successfully')}
                    className="w-full bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded p-2 text-green-300 text-sm transition-colors"
                  >
                    Save Progress
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReviewerView: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
  const [applications, setApplications] = useState(mockApplications);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (appId: string, newStatus: Application['status']) => {
    setApplications(apps => 
      apps.map(app => 
        app.id === appId 
          ? { ...app, status: newStatus, reviewedBy: user.name }
          : app
      )
    );
    setSelectedApp(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">License Review Dashboard</h1>
            <p className="text-gray-600">Review and process business license applications</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        {/* Reviewer Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">{user.name}</h3>
              <p className="text-sm text-blue-700">{user.department} • {user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-600 text-sm font-medium">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-800">
            {applications.filter(app => app.status === 'pending').length}
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">Under Review</div>
          <div className="text-2xl font-bold text-blue-800">
            {applications.filter(app => app.status === 'under_review').length}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium">Approved</div>
          <div className="text-2xl font-bold text-green-800">
            {applications.filter(app => app.status === 'approved').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm font-medium">Rejected</div>
          <div className="text-2xl font-bold text-red-800">
            {applications.filter(app => app.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {app.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.applicantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{app.businessName}</div>
                    <div className="text-sm text-gray-500">{app.businessType} • {app.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(app.status)}`}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {app.submittedDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setSelectedApp(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Review Application: {selectedApp.id}</h3>
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div><span className="font-medium">Applicant:</span> {selectedApp.applicantName}</div>
                  <div><span className="font-medium">Business Name:</span> {selectedApp.businessName}</div>
                  <div><span className="font-medium">Type:</span> {selectedApp.businessType}</div>
                  <div><span className="font-medium">Location:</span> {selectedApp.location}</div>
                  <div><span className="font-medium">Current Status:</span> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApp.status)}`}>
                      {selectedApp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'under_review')}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                  >
                    Under Review
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const BusinessLicensePortal: React.FC<BusinessLicensePortalProps> = ({ isOpen, user, onClose }) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] bg-gray-100 overflow-y-auto"
    >
      {user.userType === 'applicant' ? (
        <ApplicantView user={user} onClose={onClose} />
      ) : (
        <ReviewerView user={user} onClose={onClose} />
      )}
    </motion.div>
  );
};
