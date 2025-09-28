import { RequestHandler } from 'express';
import { z } from 'zod';

const generateRequestSchema = z.object({
  message: z.string(),
  category: z.string().optional(),
  type: z.string().optional(),
});

interface ResponseAction {
  label: string;
  type: string;
  action: string;
}

interface BusinessSetupContent {
  response: string;
  actions: ResponseAction[];
  investorData?: {
    businessType: string;
    licenseType: string;
    entrepreneur: {
      name: string;
      title: string;
      avatar: string;
    };
  };
}

interface CategoryResponse {
  businessSetup: BusinessSetupContent;
  marketAnalysis?: {
    response: string;
    actions: ResponseAction[];
  };
}

const getInvestorResponse = (message: string, category: string = 'general') => {
  const responses: Record<string, CategoryResponse> = {
    restaurants: {
      businessSetup: {
        response: "For restaurant investment in Abu Dhabi, you'll need a Commercial License for F&B. The process involves obtaining health permits, liquor license (if applicable), municipality approvals, and fire safety clearance. Initial investment typically ranges from AED 500,000 to AED 2M depending on size and location.",
        investorData: {
          businessType: 'Restaurant',
          licenseType: 'Commercial License for F&B',
          entrepreneur: {
            name: 'Khalid',
            title: 'Entrepreneur',
            avatar: 'https://api.builder.io/api/v1/image/assets/TEMP/0142e541255ee20520b15f139d595835c00ea132?width=131'
          }
        },
        actions: [
          { label: 'Explore more options', type: 'secondary', action: 'explore' },
          { label: 'Set up business', type: 'primary', action: 'setup' },
          { label: 'Start a Demo', type: 'primary', action: 'demo' }
        ]
      },
      marketAnalysis: {
        response: "Abu Dhabi's F&B market is valued at AED 12.8B with 15% annual growth. High-demand areas include Al Reem Island, Corniche, and Marina Mall vicinity. Average restaurant ROI is 18-25% within 2-3 years for well-positioned establishments.",
        actions: [
          { label: 'View market data', type: 'secondary', action: 'market_data' },
          { label: 'Location analysis', type: 'primary', action: 'location' }
        ]
      }
    },
    'fast-food': {
      businessSetup: {
        response: "Fast food franchises in Abu Dhabi require a Commercial License and franchise agreements. Initial investment ranges from AED 200,000 to AED 800,000. Popular locations include malls, business districts, and residential areas. Approval process takes 4-6 weeks.",
        actions: [
          { label: 'Franchise opportunities', type: 'primary', action: 'franchise' },
          { label: 'Location scout', type: 'secondary', action: 'location' }
        ]
      }
    },
    'retail-store': {
      businessSetup: {
        response: "Retail business in Abu Dhabi requires a Commercial License for Trading. Consider e-commerce integration for broader reach. Prime retail locations include Yas Mall, Marina Mall, and Al Wahda Mall. Initial investment varies from AED 150,000 to AED 1.5M.",
        actions: [
          { label: 'E-commerce setup', type: 'primary', action: 'ecommerce' },
          { label: 'Mall partnerships', type: 'secondary', action: 'partnerships' }
        ]
      }
    }
  };

  const categoryData = responses[category as keyof typeof responses] || responses.restaurants;

  if (message.toLowerCase().includes('invest') || message.toLowerCase().includes('business') || message.toLowerCase().includes('setup')) {
    return categoryData.businessSetup;
  }

  if (message.toLowerCase().includes('market') || message.toLowerCase().includes('analysis')) {
    return categoryData.marketAnalysis || categoryData.businessSetup;
  }

  return categoryData.businessSetup;
};

export const handleGenerate: RequestHandler = async (req, res) => {
  try {
    const { message, category = 'general', type = 'general' } = generateRequestSchema.parse(req.body);

    let responseData;

    if (type === 'investor') {
      responseData = getInvestorResponse(message, category);
    } else {
      // Standard chat response
      responseData = {
        response: `I understand you're asking about: "${message}". Let me help you with that business inquiry.`,
        actions: [
          { label: 'Learn more', type: 'secondary', action: 'learn' },
          { label: 'Get started', type: 'primary', action: 'start' }
        ]
      };
    }

    res.json(responseData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid request body', details: error.errors });
    }
    console.error('Error generating response:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
};
