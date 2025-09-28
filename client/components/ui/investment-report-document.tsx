import React from 'react';
import { motion } from 'framer-motion';

interface InvestmentReportDocumentProps {
  className?: string;
}

export const InvestmentReportDocument: React.FC<InvestmentReportDocumentProps> = ({ className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white rounded-3xl p-8 shadow-2xl ${className}`}
      style={{ width: '540px', height: '684px' }}
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1 pr-6">
            <h1 className="text-2xl font-bold text-black leading-tight">
              Abu Dhabi a diverse population for global high-end experiences
            </h1>
          </div>
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden relative bg-gradient-to-br from-orange-400 via-purple-500 to-blue-600">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center">
                <div className="text-white text-xs font-medium">Residents</div>
                <div className="text-white text-lg font-bold">2.2M</div>
              </div>
              {/* City silhouette overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Demographics */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-teal-600 mb-4">Demographics and Footfall</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Total Population & Residents:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The emirate of Abu Dhabi has a population of over <span className="font-semibold text-teal-600">2.2M residents</span>. 
                  The Corniche, being a central hub, attracts a significant portion of this population, particularly those living in the surrounding high-density neighbourhoods like Al Khalidiya.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">A Diverse Mix:</h3>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  The Corniche has diverse demographics.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">Nationals:</h4>
                    <p className="text-gray-600 text-sm">
                      Emirati nationals, who have a high average household income (previously reported at around AED 47,066) and are a key consumer group for both high-end and casual dining.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800">Expatriates:</h4>
                    <p className="text-gray-600 text-sm">
                      A large population of expatriates from over 200 nationalities, with a strong presence of Western, Indian, and other Asian communities. Their dining preferences are diverse, ranging from budget-friendly options to premium dining experiences.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800">Tourists:</h4>
                    <p className="text-gray-600 text-sm">
                      The Corniche is a major tourist attraction. In Q1 2025 alone, Abu Dhabi welcomed 1.4 million overnight guests. Top tourist residents include UAE, India, Russia, China and the US, all of whom contribute significantly to the F&B sector. A key driver for tourists is the blend of cultural attractions, leisure activities and diverse dining options.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Footfall Numbers:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The Corniche itself sees a high volume of visitors. Reports from tourism agencies mention monthly averages ranging from 30,000 to 50,000 visitors, enjoying the various amenities like cycling paths, beaches, and parks.
                </p>
                
                <div className="mt-3 bg-teal-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                    <span className="text-teal-700 text-sm font-semibold">New Visitors</span>
                  </div>
                  <div className="text-2xl font-bold text-teal-600 mt-1">23,445</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Consumer Behavior & Trends */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Consumer Behavior & F&B Trends</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">High Dining-Out Culture:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The UAE as a whole has a strong dining-out culture, with some reports indicating residents dine out an average of 2.5 times per week. The Corniche, with its picturesque setting, is a prime location for this activity.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Rising Incomes and Spending:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The UAE's economy is growing, with a projected GDP growth of 4% in 2024 and 3.5% in 2025. This translates to increased consumer spending, with the overall F&B sector expected to grow. The F&B sector is forecasted to increase by 6.3% in 2024, reinforcing its long-term sustainability.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Dominance of QSR and Casual Dining:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The Quick Service Restaurant (QSR) segment holds a large market share. The combination of busy lifestyles and the convenience culture makes quick service a massive segment, and businesses offering healthy, fresh meals on the go makes this segment a strong performer. However, fine dining and entertainment concepts are also gaining traction.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Digitalization:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The rise of online food delivery platforms like Talabat, Deliveroo, and Zomato is a key factor. An F&B business on the Corniche should be integrated with these services, as they are integral to reaching customers. The online orders of F&B in Abu Dhabi are expected to reach AED 2.3 billion by 2025.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-blue-600 mb-2">Busy and Well Spenders:</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  The Corniche sees significant footfall throughout the day, but activity peaks in the evenings and weekends. Evening hours offer the best opportunities for F&B, to exercise, and to dine. Events are also another traffic driver.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="mt-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-purple-600 mb-3">Peak Timing:</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Weekends (Friday & Saturday):</h4>
                <p className="text-gray-600 text-xs">
                  The Corniche is a major recreational hub for families and friends, leading to a surge in business for F&B outlets.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-purple-600 mb-3">Seasonality:</h3>
            <div className="space-y-2">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">High Season (October - April):</h4>
                <p className="text-gray-600 text-xs">
                  This is the busiest period for both residents and tourists. The weather is cool and pleasant, leading to maximum footfall and higher revenues.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 text-sm">Low Season (May - September):</h4>
                <p className="text-gray-600 text-xs">
                  The summer months can be very hot, which reduces outdoor foot traffic. F&B businesses rely more on indoor seating, air-conditioned environments, and online delivery during this time.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-orange-600 mb-3">Ramadan:</h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            While it is a period of fasting, it is also a time for evening social gatherings and Iftar and Suhoor meals. Restaurants often see a shift in busy hours, with activity spiking after sunset.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 text-sm leading-relaxed italic">
            In summary, the Abu Dhabi Corniche is a high-traffic location with a diverse customer base. A successful F&B business here would need to cater to a mix of price points and tastes, embrace digital ordering, and be prepared for significant seasonal variations in footfall.
          </p>
        </div>
      </div>

      {/* Income Statistics Table */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">The Corniche</h3>
          <div className="text-sm mb-2 opacity-90">Average monthly income AED</div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs opacity-75 mb-1">Area name</div>
              <div className="text-2xl font-bold">25-35K</div>
            </div>
            <div className="text-center">
              <div className="text-xs opacity-75 mb-1">Area name</div>
              <div className="text-2xl font-bold">40-55K</div>
            </div>
            <div className="text-center">
              <div className="text-xs opacity-75 mb-1">Area name</div>
              <div className="text-2xl font-bold">60-75K</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
