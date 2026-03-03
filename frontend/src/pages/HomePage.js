import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  XCircle, 
  Home, 
  Building2, 
  School, 
  Paintbrush, 
  ArrowRight,
  Shield,
  Clock,
  IndianRupee,
  Phone,
  Calculator,
  MessageSquare,
  FileText,
  Handshake,
  HardHat,
  Key
} from 'lucide-react';

const HERO_BG = 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yJTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3MjUzOTI0OHww&ixlib=rb-4.1.0&q=85';
const PROCESS_IMG = 'https://images.unsplash.com/photo-1765378025255-5c2ff04563f4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODF8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwZW5naW5lZXIlMjBibHVlcHJpbnQlMjBzYWZldHl8ZW58MHx8fHwxNzcyNTM5MjUyfDA&ixlib=rb-4.1.0&q=85';

const HomePage = () => {
  const comparisonData = [
    { feature: 'Fixed Price Quote', alpha: true, local: false },
    { feature: 'Detailed Material Specifications', alpha: true, local: false },
    { feature: 'Project Timeline Guarantee', alpha: true, local: false },
    { feature: 'Branded Materials (Tata Steel, UltraTech)', alpha: true, local: false },
    { feature: '400+ Quality Checkpoints', alpha: true, local: false },
    { feature: 'Dedicated Project Manager', alpha: true, local: false },
    { feature: 'Real-time Project Updates', alpha: true, local: false },
    { feature: 'Post-Construction Warranty', alpha: true, local: false },
  ];

  const services = [
    { name: 'Independent Houses', icon: Home, desc: 'Custom-designed homes for your dream living' },
    { name: 'Luxury Villas', icon: Building2, desc: 'Premium villas with world-class amenities' },
    { name: 'G+5 Apartments', icon: Building2, desc: 'Multi-story residential complexes' },
    { name: 'School Buildings', icon: School, desc: 'Educational infrastructure built to standards' },
    { name: 'Residential Interiors', icon: Paintbrush, desc: 'Transform spaces with expert interior design' },
  ];

  const processSteps = [
    { 
      step: '01', 
      title: 'Free Consultation', 
      desc: 'Share your vision, plot details & requirements. Our expert visits your site for assessment.',
      icon: MessageSquare,
      duration: '1-2 Days',
      highlight: 'Free Site Visit'
    },
    { 
      step: '02', 
      title: 'Design & Planning', 
      desc: 'Receive detailed floor plans, 3D elevations, material specifications & BOQ.',
      icon: FileText,
      duration: '7-10 Days',
      highlight: 'Detailed BOQ'
    },
    { 
      step: '03', 
      title: 'Agreement & Approval', 
      desc: 'Transparent fixed-price contract. No hidden costs. Clear payment milestones.',
      icon: Handshake,
      duration: '2-3 Days',
      highlight: 'Fixed Price'
    },
    { 
      step: '04', 
      title: 'Construction', 
      desc: 'Quality execution with 400+ checkpoints. Weekly progress updates & site access.',
      icon: HardHat,
      duration: 'As Per Plan',
      highlight: 'Weekly Updates'
    },
    { 
      step: '05', 
      title: 'Handover & Warranty', 
      desc: 'On-time possession with complete documentation, warranty & after-sales support.',
      icon: Key,
      duration: 'On Schedule',
      highlight: '1 Year Warranty'
    },
  ];

  const trustBrands = ['Tata Steel', 'UltraTech', 'Asian Paints', 'Havells', 'Jaquar', 'Fenesta'];

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[90vh] flex items-center">
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_BG})` }}></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 stagger-children">
              {/* Trust Badge */}
              <div className="animate-fade-in-up opacity-0 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield size={16} className="text-[#F97316]" />
                <span className="text-sm font-medium">Trusted by 500+ Families in Hyderabad</span>
              </div>

              {/* Hero Headline */}
              <h1 className="animate-fade-in-up opacity-0 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Build Your Dream Home
                <span className="block text-[#F97316]">Without the Headaches</span>
              </h1>

              {/* Subheadline */}
              <p className="animate-fade-in-up opacity-0 text-lg md:text-xl text-slate-300 max-w-lg">
                No delays. No hidden costs. No quality compromises.
                <br />
                Hyderabad's most transparent turnkey construction service.
              </p>

              {/* Pain Points */}
              <div className="animate-fade-in-up opacity-0 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={18} className="text-[#F97316]" />
                  <span>On-Time Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee size={18} className="text-[#F97316]" />
                  <span>Fixed Price Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield size={18} className="text-[#F97316]" />
                  <span>400+ Quality Checks</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="animate-fade-in-up opacity-0 flex flex-wrap gap-4">
                <Link to="/calculator">
                  <Button 
                    data-testid="hero-calculator-btn"
                    className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-8 py-6 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                  >
                    <Calculator className="mr-2" size={20} />
                    Get Free Cost Estimate
                  </Button>
                </Link>
                <a href="tel:9492882197">
                  <Button 
                    data-testid="hero-call-btn"
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-[#010822] font-bold px-8 py-6 text-lg rounded-sm"
                  >
                    <Phone className="mr-2" size={20} />
                    Call Now
                  </Button>
                </a>
              </div>
            </div>

            {/* Hero Stats */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="animate-slide-in-right opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-sm border border-white/20">
                <div className="text-4xl font-bold text-[#F97316]">500+</div>
                <div className="text-slate-300 mt-2">Projects Delivered</div>
              </div>
              <div className="animate-slide-in-right opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-sm border border-white/20" style={{animationDelay: '0.2s'}}>
                <div className="text-4xl font-bold text-[#F97316]">25+</div>
                <div className="text-slate-300 mt-2">Years Experience</div>
              </div>
              <div className="animate-slide-in-right opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-sm border border-white/20" style={{animationDelay: '0.3s'}}>
                <div className="text-4xl font-bold text-[#F97316]">98%</div>
                <div className="text-slate-300 mt-2">On-Time Delivery</div>
              </div>
              <div className="animate-slide-in-right opacity-0 bg-white/10 backdrop-blur-sm p-6 rounded-sm border border-white/20" style={{animationDelay: '0.4s'}}>
                <div className="text-4xl font-bold text-[#F97316]">₹0</div>
                <div className="text-slate-300 mt-2">Hidden Costs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Brands Bar */}
      <section className="bg-slate-50 py-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <span className="text-sm text-slate-500 font-medium">We Use Only Premium Brands:</span>
            {trustBrands.map((brand) => (
              <span 
                key={brand} 
                className="text-lg font-bold text-slate-400 hover:text-[#2a4599] transition-colors"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#010822] mb-4">
              Complete Construction Solutions
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From independent homes to commercial projects - we handle everything 
              except approvals. Bring your plans, we'll build your dreams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <div 
                key={service.name}
                className="service-card bg-white p-8 border border-slate-100 hover:border-[#2a4599] transition-all group"
              >
                <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center mb-6 group-hover:bg-[#2a4599] transition-colors">
                  <service.icon className="text-[#2a4599] group-hover:text-white transition-colors" size={24} />
                </div>
                <h3 className="text-xl font-bold text-[#010822] mb-3">{service.name}</h3>
                <p className="text-slate-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button 
                data-testid="view-all-services"
                variant="outline"
                className="border-2 border-[#2a4599] text-[#2a4599] hover:bg-[#2a4599] hover:text-white font-semibold px-8 py-4 rounded-sm"
              >
                View All Services
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-[#010822]" data-testid="comparison-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Alpha Groups?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              See how we compare to traditional local contractors
            </p>
          </div>

          <div className="bg-white rounded-sm overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3 bg-slate-100 p-4 font-bold text-sm">
              <div className="text-slate-700">Feature</div>
              <div className="text-center text-[#2a4599]">Alpha Groups</div>
              <div className="text-center text-slate-500">Local Contractors</div>
            </div>
            {comparisonData.map((row, idx) => (
              <div 
                key={row.feature}
                className={`grid grid-cols-3 p-4 items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
              >
                <div className="text-sm text-slate-700 font-medium">{row.feature}</div>
                <div className="flex justify-center">
                  <CheckCircle className="text-green-500" size={22} />
                </div>
                <div className="flex justify-center">
                  <XCircle className="text-red-400" size={22} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white" data-testid="process-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-[#010822] mb-6">
                Our Proven 5-Step Process
              </h2>
              <p className="text-slate-600 mb-10">
                From initial consultation to final handover, we ensure complete 
                transparency at every step. No surprises, just quality delivery.
              </p>

              <div className="space-y-6">
                {processSteps.map((step, idx) => (
                  <div key={step.step} className="flex gap-4 items-start">
                    <div className="w-12 h-12 bg-[#2a4599] text-white rounded-sm flex items-center justify-center font-bold flex-shrink-0">
                      {step.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#010822]">{step.title}</h4>
                      <p className="text-slate-600 text-sm">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img 
                src={PROCESS_IMG}
                alt="Construction Process"
                className="w-full h-auto rounded-sm shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#F97316] text-white p-6 rounded-sm shadow-lg">
                <div className="text-3xl font-bold">400+</div>
                <div className="text-sm">Quality Checkpoints</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Guarantee Section */}
      <section className="py-20 bg-slate-50" data-testid="quality-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#010822] mb-4">
              Our Quality Guarantee
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We use only premium, branded materials for every project - 
              ensuring durability, safety, and long-term value for your investment.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { brand: 'Tata Steel', category: 'TMT Steel' },
              { brand: 'UltraTech', category: 'Cement' },
              { brand: 'Asian Paints', category: 'Paints' },
              { brand: 'Havells', category: 'Electricals' },
              { brand: 'Jaquar', category: 'Plumbing' },
              { brand: 'Fenesta', category: 'uPVC Windows' },
            ].map((item) => (
              <div key={item.brand} className="bg-white p-6 text-center border border-slate-100 hover:border-[#2a4599] transition-colors">
                <div className="text-lg font-bold text-[#2a4599]">{item.brand}</div>
                <div className="text-xs text-slate-500 mt-1">{item.category}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#2a4599]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Build Your Dream Home?
          </h2>
          <p className="text-slate-200 text-lg mb-10 max-w-2xl mx-auto">
            Get an instant cost estimate with our free calculator, or speak 
            directly with our construction experts.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/calculator">
              <Button 
                data-testid="cta-calculator"
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm shadow-lg"
              >
                Get Free Estimate
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                data-testid="cta-contact"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#2a4599] font-bold px-10 py-6 text-lg rounded-sm"
              >
                Request Callback
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
