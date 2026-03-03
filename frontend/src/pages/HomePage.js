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
      <section className="py-24 bg-gradient-to-b from-white to-slate-50" data-testid="process-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#2a4599]/10 px-4 py-2 rounded-full mb-4">
              <Clock size={16} className="text-[#2a4599]" />
              <span className="text-sm font-semibold text-[#2a4599]">Your Journey to Dream Home</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#010822] mb-4">
              Our 5-Step <span className="text-[#2a4599]">Transparent</span> Process
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              From first meeting to key handover - complete visibility at every stage. 
              No surprises, just quality delivery.
            </p>
          </div>

          {/* Process Timeline - Desktop */}
          <div className="hidden lg:block relative">
            {/* Connection Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#2a4599] via-[#F97316] to-[#2a4599] rounded-full"></div>
            
            <div className="grid grid-cols-5 gap-4">
              {processSteps.map((step, idx) => (
                <div key={step.step} className="relative">
                  {/* Step Number Circle */}
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl relative z-10 shadow-lg transition-transform hover:scale-110 ${
                      idx === 2 ? 'bg-[#F97316] text-white' : 'bg-[#2a4599] text-white'
                    }`}>
                      {step.step}
                    </div>
                  </div>
                  
                  {/* Card */}
                  <div className={`bg-white p-6 rounded-sm border-2 transition-all hover:shadow-xl hover:-translate-y-2 ${
                    idx === 2 ? 'border-[#F97316]' : 'border-slate-100 hover:border-[#2a4599]'
                  }`}>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      idx === 2 ? 'bg-[#F97316]/10' : 'bg-[#2a4599]/10'
                    }`}>
                      <step.icon className={idx === 2 ? 'text-[#F97316]' : 'text-[#2a4599]'} size={24} />
                    </div>
                    
                    {/* Title */}
                    <h4 className="font-bold text-[#010822] text-lg mb-2">{step.title}</h4>
                    
                    {/* Description */}
                    <p className="text-slate-600 text-sm mb-4 min-h-[60px]">{step.desc}</p>
                    
                    {/* Duration & Highlight */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock size={12} />
                        <span>{step.duration}</span>
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        idx === 2 ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#2a4599]/10 text-[#2a4599]'
                      }`}>
                        {step.highlight}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Process Timeline - Mobile/Tablet */}
          <div className="lg:hidden space-y-6">
            {processSteps.map((step, idx) => (
              <div key={step.step} className="flex gap-4">
                {/* Left - Timeline */}
                <div className="flex flex-col items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg flex-shrink-0 ${
                    idx === 2 ? 'bg-[#F97316] text-white' : 'bg-[#2a4599] text-white'
                  }`}>
                    {step.step}
                  </div>
                  {idx < processSteps.length - 1 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-[#2a4599] to-slate-200 my-2"></div>
                  )}
                </div>
                
                {/* Right - Content */}
                <div className={`flex-1 bg-white p-6 rounded-sm border-2 mb-2 ${
                  idx === 2 ? 'border-[#F97316]' : 'border-slate-100'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      idx === 2 ? 'bg-[#F97316]/10' : 'bg-[#2a4599]/10'
                    }`}>
                      <step.icon className={idx === 2 ? 'text-[#F97316]' : 'text-[#2a4599]'} size={20} />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      idx === 2 ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#2a4599]/10 text-[#2a4599]'
                    }`}>
                      {step.highlight}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#010822] text-lg mb-2">{step.title}</h4>
                  <p className="text-slate-600 text-sm mb-3">{step.desc}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock size={12} />
                    <span>{step.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="text-slate-600 mb-6">Ready to start your construction journey?</p>
            <Link to="/calculator">
              <Button 
                data-testid="process-cta"
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
              >
                Start With Free Consultation
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
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
