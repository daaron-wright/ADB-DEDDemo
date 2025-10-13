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

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-2 gap-8 text-sm">
        {/* Left Column - Demographics */}
        <div>
          <h2 className="text-base font-bold text-teal-600 mb-4">Demographics and Footfall</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-black mb-1">Total Population & Residents:</h3>
              <p className="text-gray-700 leading-relaxed">
                The emirate of Abu Dhabi has a population of over <span className="font-bold text-teal-600">2.2M residents</span>.
                The Corniche, being a central hub, attracts a significant portion of this population, particularly those living in the surrounding
                high-density neighbourhoods like Al Khalidiya.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">A Diverse Mix:</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Corniche has diverse demographics.
              </p>

              <div className="space-y-3">
                <div>
                  <span className="font-bold text-black">Nationals: </span>
                  <span className="text-gray-700">
                    Emirati nationals, who have a high average household income (previously reported at around AED 47,066) and are a key
                    consumer group for both high-end and casual dining.
                  </span>
                </div>

                <div>
                  <span className="font-bold text-black">Expatriates: </span>
                  <span className="text-gray-700">
                    A large population of expatriates from over 200 nationalities, with a strong presence of Western, Indian, and other
                    Asian communities. Their dining preferences are diverse, ranging from budget-friendly options to premium international cuisines.
                  </span>
                </div>

                <div>
                  <span className="font-bold text-black">Tourists: </span>
                  <span className="text-gray-700">
                    The Corniche is a major tourist attraction. In Q1 2025 alone, Abu Dhabi welcomed 1.4 million overnight guests. Top
                    tourist residents include UAE, China, India, Russia, China and the US, all of whom contribute significantly to the F&B sector. A key driver for
                    tourists is the blend of cultural attractions, leisure activities and diverse dining options.
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-black mb-2">Footfall Numbers:</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                The Corniche itself sees a high volume of visitors. Reports from tourism agencies mention monthly averages ranging
                from 30,000 to 50,000 visitors, enjoying the various amenities like cycling paths, beaches, and parks.
              </p>

              <div className="bg-teal-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                  <span className="text-teal-700 font-semibold">New Visitors</span>
                </div>
                <div className="text-2xl font-bold text-teal-600">23,445</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Consumer Behavior & Trends */}
        <div>
          <h2 className="text-base font-bold text-black mb-4">Consumer Behavior & F&B Trends</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-black mb-1">High Dining-Out Culture:</h3>
              <p className="text-gray-700 leading-relaxed">
                The UAE as a whole has a strong dining-out culture, with some reports indicating residents dine out an average of
                2.5 times per week. The Corniche, with its picturesque setting, is a prime location for this activity.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-1">Rising Incomes and Spending:</h3>
              <p className="text-gray-700 leading-relaxed">
                The UAE's economy is growing, with a projected GDP growth of 4% in 2024 and 3.5% in 2025. This translates to
                increased consumer spending, with the overall F&B sector expected to grow. The F&B sector is forecasted to
                increase by 6.3% in 2024, reinforcing its long-term sustainability.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-1">Dominance of QSR and Casual Dining:</h3>
              <p className="text-gray-700 leading-relaxed">
                The Quick Service Restaurant (QSR) segment holds a large market share. The combination of busy
                lifestyles and the convenience culture makes quick service a massive segment, and businesses offering healthy, fresh
                meals on the go makes this segment a strong performer. However, fine dining and entertainment concepts are also gaining traction.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-1">Digitalization:</h3>
              <p className="text-gray-700 leading-relaxed">
                The rise of online food delivery platforms like Talabat, Deliveroo, and Zomato is a key factor. An F&B business on the
                Corniche should be integrated with these services, as they are integral to reaching customers. The online orders of F&B in Abu Dhabi are expected
                to reach AED 2.3 billion by 2025.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-black mb-1">Busy Trails and Spenders:</h3>
              <p className="text-gray-700 leading-relaxed">
                The Corniche sees significant footfall throughout the day, but activity peaks in the evenings and weekends.
                Evening hours offer the best opportunities for a restaurant to roll, to exercise, and to dine
                out are also another traffic driver.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Continued Content Sections */}
      <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-black mb-1">Daily and Weekly Peaks:</h3>
            <p className="text-gray-700 leading-relaxed">
              The Corniche sees significant footfall throughout the day, but activity peaks in the evenings and weekends.
              Evening hours offer the best opportunities for a restaurant stroll, to exercise, and to dine
              out. Events are also another traffic driver.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-black mb-1">Weekends (Friday & Saturday):</h3>
            <p className="text-gray-700 leading-relaxed">
              The Corniche is a major recreational hub for families and friends, leading to a surge in business for F&B
              outlets.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-black mb-1">Seasonality:</h3>
            <div className="space-y-2">
              <div>
                <span className="font-bold text-black">High Season (October - April): </span>
                <span className="text-gray-700">
                  This is the busiest period for both residents and tourists. The weather is cool and pleasant,
                  leading to peak population density and higher revenues.
                </span>
              </div>
              <div>
                <span className="font-bold text-black">Low Season (May - September): </span>
                <span className="text-gray-700">
                  The summer months can be very hot, which reduces outdoor foot traffic. F&B businesses rely more on
                  indoor seating, air-conditioned environments, and online delivery during this time.
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black mb-1">Ramadan:</h3>
            <p className="text-gray-700 leading-relaxed">
              While it is a period of fasting, it is also a time for evening social
              gatherings and Iftar and Suhoor meals. Restaurants often see a shift in
              busy hours, with activity spiking after sunset.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6">
        <p className="text-gray-700 text-sm leading-relaxed">
          In summary, the Abu Dhabi Corniche is a high-traffic location with a
          diverse customer base. A successful F&B business here would need to
          cater to a mix of price points and tastes, embrace digital ordering, and
          be prepared for significant seasonal variations in population density.
        </p>
      </div>

      {/* Income Statistics Bar */}
      <div className="absolute bottom-0 left-0 right-0 -mx-8 -mb-8">
        <div className="bg-teal-500 rounded-b-3xl px-8 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">The Corniche</h3>
              <div className="text-sm opacity-90">Average monthly income AED</div>
            </div>

            <div className="flex gap-8">
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
      </div>
    </motion.div>
  );
};
