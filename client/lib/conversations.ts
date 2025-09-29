export const conversationFlows = {
  restaurants: [
    {
      id: "1",
      content:
        "I'm interested in opening a fine dining restaurant in Abu Dhabi. What are the specific requirements and what should I consider?",
      isAI: false,
      timestamp: new Date(),
      rating: 5,
    },
    {
      id: "2",
      content:
        "Excellent choice! For a fine dining establishment, you'll need to focus on location, concept, and specific permits related to high-end service. Let's explore the investor journey.",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "I have created a heat map for the top areas and existing businesses in Abu Dhabi. This will help you identify optimal locations for your restaurant.",
      isAI: true,
      timestamp: new Date(),
      type: "heat-map",
    },
    {
      id: "4",
      content:
        "You will need a Commercial License for F&B. I have generated an investor journey below that will assist you.",
      isAI: true,
      timestamp: new Date(),
      hasActions: true,
    },
  ],
  "fast-food": [
    {
      id: "1",
      content:
        "I want to start a fast-food chain. What are the key differences in licensing compared to a regular restaurant?",
      isAI: false,
      timestamp: new Date(),
      rating: 4,
    },
    {
      id: "2",
      content:
        "For a fast-food chain, the process is streamlined for scalability. You'll need to consider central kitchen approvals and standardized health checks across all outlets.",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "Here's a location analysis showing existing fast-food establishments across Abu Dhabi districts.",
      isAI: true,
      timestamp: new Date(),
      type: "heat-map",
    },
    {
      id: "4",
      content:
        "You will need a Commercial License for F&B, with a focus on fast-food operations. Here is a tailored investor journey.",
      isAI: true,
      timestamp: new Date(),
      hasActions: true,
    },
  ],
  branch: [
    {
      id: "1",
      content:
        "My company wants to open a new branch office in Abu Dhabi. What are the requirements for a foreign company?",
      isAI: false,
      timestamp: new Date(),
      rating: 5,
    },
    {
      id: "2",
      content:
        "Opening a branch of a foreign company involves specific legal structures. You'll need a local service agent or can set up in a free zone. Let's look at the journey.",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "A Dual License is often suitable for this. I have prepared an investor journey to guide you through the process.",
      isAI: true,
      timestamp: new Date(),
      hasActions: true,
    },
  ],
  "retail-store": [
    {
      id: "1",
      content:
        "I'm planning to open a luxury retail store. What are the prime locations and what licenses do I need?",
      isAI: false,
      timestamp: new Date(),
      rating: 5,
    },
    {
      id: "2",
      content:
        "For a luxury retail store, location is key. Areas like The Galleria Al Maryah Island are prime. You'll need a Commercial License and possibly specific brand approvals.",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "Here is the investor journey for setting up a retail business. It outlines the steps for licensing and finding the perfect location.",
      isAI: true,
      timestamp: new Date(),
      hasActions: true,
    },
  ],
  general: [
    // Fallback
    {
      id: "1",
      content:
        "I want to invest my money and open a business in Abu Dhabi. What commercial activities align with my business type and can you help me set up?",
      isAI: false,
      timestamp: new Date(),
      rating: 5,
    },
    {
      id: "2",
      content:
        "Opening a business in Abu Dhabi involves several steps: planning, licensing, approvals, and more. Let's find the right path for you.",
      isAI: true,
      timestamp: new Date(),
    },
    {
      id: "3",
      content:
        "I have generated a general investor journey below that will assist you.",
      isAI: true,
      timestamp: new Date(),
      hasActions: true,
    },
  ],
};
