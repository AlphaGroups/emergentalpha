import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { PACKAGES, MATERIAL_SPECS, QUALITY_CHECKPOINTS } from '@/lib/packageData';

const PackagesPage = () => {
  const [packages] = useState(PACKAGES);
  const [selectedType, setSelectedType] = useState('independent_house');

  const projectTypes = [
    { key: 'independent_house', label: 'Independent House' },
    { key: 'villa', label: 'Luxury Villa' },
    { key: 'apartment', label: 'Apartment' },
    { key: 'school', label: 'School' },
    { key: 'interior', label: 'Interior' },
  ];

  const packageOrder = ['basic', 'premium', 'luxury'];

  return (
    <div data-testid="packages-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#010822] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Transparent Construction Packages
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Choose from our carefully curated packages - each with detailed material 
            specifications and no hidden costs.
          </p>
        </div>
      </section>

      {/* Project Type Selector */}
      <section className="py-8 bg-slate-50 border-b border-slate-200 sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {projectTypes.map((type) => (
              <button
                key={type.key}
                data-testid={`project-type-${type.key}`}
                onClick={() => setSelectedType(type.key)}
                className={`px-6 py-3 text-sm font-semibold rounded-sm transition-all ${
                  selectedType === type.key
                    ? 'bg-[#2a4599] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {packages && packageOrder.map((key) => {
              const pkg = packages[key];
              const rate = pkg.rates[selectedType];
              const isPremium = key === 'premium';

              return (
                <div
                  key={key}
                  data-testid={`package-${key}`}
                  className={`relative bg-white border-2 p-8 transition-all hover:shadow-xl ${
                    isPremium
                      ? 'border-[#2a4599] scale-105 shadow-lg'
                      : 'border-slate-200 hover:border-[#2a4599]'
                  }`}
                >
                  {isPremium && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#F97316] text-white px-4 py-1 text-xs font-bold uppercase tracking-wider">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-[#010822] mb-2">{pkg.name}</h3>
                    <p className="text-slate-500 text-sm">{pkg.description}</p>
                  </div>

                  <div className="text-center mb-8 pb-8 border-b border-slate-100">
                    <div className="text-4xl font-bold text-[#2a4599]">
                      ₹{rate?.toLocaleString()}
                    </div>
                    <div className="text-slate-500 text-sm">per sq.ft</div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="text-green-500 mt-0.5 flex-shrink-0" size={18} />
                        <span className="text-sm text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={`/calculator?package=${key}&type=${selectedType}`}>
                    <Button
                      data-testid={`select-${key}`}
                      className={`w-full py-4 font-bold rounded-sm ${
                        isPremium
                          ? 'bg-[#F97316] hover:bg-[#ea580c] text-white'
                          : 'bg-[#2a4599] hover:bg-[#1e3a8a] text-white'
                      }`}
                    >
                      Get Estimate
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Material Specifications */}
      <section className="py-20 bg-slate-50" data-testid="material-specs-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#010822] mb-4">
              Material Specifications
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Complete transparency in what goes into building your home
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MATERIAL_SPECS.map((spec) => (
              <div key={spec.category} className="bg-white p-6 border border-slate-100">
                <h4 className="font-bold text-[#010822] mb-4 pb-2 border-b border-slate-100">
                  {spec.category}
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Basic:</span>
                    <span className="text-slate-700 font-medium">{spec.basic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Premium:</span>
                    <span className="text-slate-700 font-medium">{spec.premium}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Luxury:</span>
                    <span className="text-slate-700 font-medium">{spec.luxury}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Checkpoints */}
      <section className="py-20 bg-[#2a4599]" data-testid="quality-checkpoints">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              400+ Quality Checkpoints
            </h2>
            <p className="text-slate-200 max-w-2xl mx-auto">
              Every project goes through rigorous quality checks at each stage
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {QUALITY_CHECKPOINTS.map((stage) => (
              <div key={stage.stage} className="bg-white/10 backdrop-blur-sm p-6 rounded-sm">
                <div className="text-[#F97316] font-bold text-lg mb-1">{stage.stage}</div>
                <div className="text-white/80 text-sm mb-4">{stage.checks}</div>
                <ul className="space-y-2">
                  {stage.items.map((item) => (
                    <li key={item} className="text-sm text-white/70 flex items-center gap-2">
                      <Check size={14} className="text-[#F97316]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#010822] mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-slate-600 mb-8">
            Use our calculator to get an instant estimate for your project
          </p>
          <Link to="/calculator">
            <Button 
              data-testid="packages-cta"
              className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm"
            >
              Calculate Your Cost
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PackagesPage;
