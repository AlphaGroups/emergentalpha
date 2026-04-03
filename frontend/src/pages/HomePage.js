import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  Home, 
  Building2, 
  School, 
  Paintbrush, 
  ArrowRight,
  Shield,
  Clock,
  IndianRupee,
  Phone,
  FileText,
  Handshake,
  HardHat,
  Key,
  ClipboardList,
  X,
  Award,
  Eye,
  Headphones,
  Star,
  BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/constants';

const HERO_BG = 'https://images.unsplash.com/photo-1622015663319-e97e697503ee?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yJTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3MjUzOTI0OHww&ixlib=rb-4.1.0&q=85';

const HomePage = () => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', phone: '', location: '', requirement: '' });
  const [packages, setPackages] = useState([]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${API}/packages`);
        setPackages(res.data.configs || []);
      } catch (e) {
        console.error('Failed to fetch packages');
      }
    };
    fetchPackages();
  }, []);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    setLeadLoading(true);
    try {
      await axios.post(`${API}/quick-lead`, leadData);
      setLeadSubmitted(true);
      toast.success('We\'ll call you back shortly!');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLeadLoading(false);
    }
  };

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
      title: 'Requirement Collection', 
      desc: 'Share your vision, plot details, budget & design preferences. We understand your complete requirements.',
      icon: ClipboardList,
      duration: '1-2 Days',
      highlight: 'Personalized'
    },
    { 
      step: '02', 
      title: 'Estimation & Agreement', 
      desc: 'Transparent fixed-price quote with detailed BOQ. Clear payment milestones and no hidden costs.',
      icon: FileText,
      duration: '3-5 Days',
      highlight: 'Fixed Price'
    },
    { 
      step: '03', 
      title: 'Planning & Design', 
      desc: 'Detailed floor plans, 3D elevations, structural drawings & material specifications.',
      icon: Handshake,
      duration: '7-10 Days',
      highlight: '3D Designs'
    },
    { 
      step: '04', 
      title: 'Construction', 
      desc: 'Quality execution with 400+ checkpoints. Dedicated project manager with weekly progress updates.',
      icon: HardHat,
      duration: 'As Per Plan',
      highlight: 'Weekly Updates'
    },
    { 
      step: '05', 
      title: 'Handover & Warranty', 
      desc: 'On-time possession with complete documentation, quality warranty & after-sales support.',
      icon: Key,
      duration: 'On Schedule',
      highlight: 'Warranty'
    },
  ];

  const whyChooseUs = [
    {
      icon: IndianRupee,
      title: 'Fixed Price. Zero Surprises.',
      desc: 'We quote a price, we stick to it. Every material, every cost is documented upfront. No hidden charges, ever.'
    },
    {
      icon: Shield,
      title: '400+ Quality Checkpoints',
      desc: 'From foundation to finishing, every stage passes rigorous quality checks using only ISI-certified branded materials.'
    },
    {
      icon: Clock,
      title: 'On-Time Delivery Guarantee',
      desc: 'Clear project timelines with milestone tracking. 98% of our projects delivered on or before schedule.'
    },
    {
      icon: Eye,
      title: 'Complete Transparency',
      desc: 'Track every stage of your construction. Weekly updates, photo reports, and a dedicated project manager.'
    },
    {
      icon: Award,
      title: '25+ Years of Excellence',
      desc: '500+ homes delivered across Hyderabad. We bring decades of expertise to every project we undertake.'
    },
    {
      icon: Headphones,
      title: 'Post-Construction Support',
      desc: 'Our relationship doesn\'t end at handover. Warranty coverage and responsive after-sales support.'
    },
  ];

  const trustBrands = ['Tata Steel', 'UltraTech', 'Asian Paints', 'Havells', 'Jaquar', 'Fenesta'];

  const getPackageConfig = (name) => packages.find(p => p.name === name);

  return (
    <div data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-section relative min-h-[90vh] flex items-center">
        <div className="hero-bg" style={{ backgroundImage: `url(${HERO_BG})` }}></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8 stagger-children">
              <div className="animate-fade-in-up opacity-0 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield size={16} className="text-[#F97316]" />
                <span className="text-sm font-medium">Trusted by 500+ Families in Hyderabad</span>
              </div>

              <h1 className="animate-fade-in-up opacity-0 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                Build Your Dream Home
                <span className="block text-[#F97316]">Without the Headaches</span>
              </h1>

              <p className="animate-fade-in-up opacity-0 text-lg md:text-xl text-slate-300 max-w-lg">
                No delays. No hidden costs. No quality compromises.
                <br />
                Hyderabad's most transparent turnkey construction service.
              </p>

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

              <div className="animate-fade-in-up opacity-0 flex flex-wrap gap-4">
                <Button 
                  data-testid="hero-start-project-btn"
                  onClick={() => setShowLeadForm(true)}
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-8 py-6 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
                >
                  Start Your Project
                  <ArrowRight className="ml-2" size={20} />
                </Button>
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
                <div className="text-4xl font-bold text-[#F97316]">&#8377;0</div>
                <div className="text-slate-300 mt-2">Hidden Costs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Capture Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" data-testid="lead-capture-modal">
          <div className="bg-white rounded-sm w-full max-w-md p-8 relative shadow-2xl">
            <button 
              data-testid="close-lead-modal"
              onClick={() => { setShowLeadForm(false); setLeadSubmitted(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            {leadSubmitted ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-[#010822] mb-2">Thank You!</h3>
                <p className="text-slate-600">Our team will call you within 2 hours.</p>
                <Button
                  onClick={() => { setShowLeadForm(false); setLeadSubmitted(false); }}
                  className="mt-6 bg-[#2a4599] hover:bg-[#1e3a8a] text-white"
                >
                  Close
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-[#010822] mb-1">Start Your Project</h3>
                <p className="text-slate-500 text-sm mb-6">Share your details, we'll call you back within 2 hours.</p>
                
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Your Name *</Label>
                    <Input
                      data-testid="lead-name"
                      placeholder="Full name"
                      value={leadData.name}
                      onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                      className="h-11 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Phone Number *</Label>
                    <Input
                      data-testid="lead-phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={leadData.phone}
                      onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                      className="h-11 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Location</Label>
                    <Input
                      data-testid="lead-location"
                      placeholder="e.g., Gachibowli, Hyderabad"
                      value={leadData.location}
                      onChange={(e) => setLeadData({ ...leadData, location: e.target.value })}
                      className="h-11 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Requirement</Label>
                    <Input
                      data-testid="lead-requirement"
                      placeholder="e.g., 3BHK Independent House"
                      value={leadData.requirement}
                      onChange={(e) => setLeadData({ ...leadData, requirement: e.target.value })}
                      className="h-11 mt-1"
                    />
                  </div>
                  <Button
                    data-testid="lead-submit-btn"
                    type="submit"
                    disabled={leadLoading}
                    className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                  >
                    {leadLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Get Callback'
                    )}
                  </Button>
                </form>
                <p className="text-xs text-slate-400 mt-3 text-center">No spam. Your info is safe with us.</p>
              </>
            )}
          </div>
        </div>
      )}

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
            {services.map((service) => (
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

      {/* Packages Section (moved from separate page) */}
      <section id="packages-section" className="py-20 bg-slate-50" data-testid="packages-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#2a4599]/10 px-4 py-2 rounded-full mb-4">
              <BadgeCheck size={16} className="text-[#2a4599]" />
              <span className="text-sm font-semibold text-[#2a4599]">Transparent Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#010822] mb-4">
              Construction Packages
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Choose from 4 carefully curated packages. Transparent pricing with detailed material specifications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['classic', 'select', 'signature', 'customize'].map((pkgName) => {
              const config = getPackageConfig(pkgName);
              const isRecommended = pkgName === 'select';
              const descriptions = {
                classic: 'Essential quality construction with branded materials',
                select: 'Enhanced specs with premium finishes',
                signature: 'Luxury finishes with top-tier materials',
                customize: 'Tailored to your exact needs'
              };

              return (
                <div
                  key={pkgName}
                  data-testid={`home-package-${pkgName}`}
                  className={`relative bg-white border-2 rounded-sm overflow-hidden transition-all hover:shadow-xl ${
                    isRecommended ? 'border-[#F97316] ring-2 ring-[#F97316]/20 scale-[1.02]' : 'border-slate-200 hover:border-[#2a4599]'
                  }`}
                >
                  {isRecommended && (
                    <div className="bg-[#F97316] text-white text-center py-2 text-xs font-bold uppercase tracking-wider">
                      Recommended
                    </div>
                  )}
                  
                  <div className="p-6 text-center">
                    <h3 className="text-2xl font-bold text-[#010822] capitalize mb-2">{pkgName}</h3>
                    <p className="text-slate-500 text-sm mb-6">{descriptions[pkgName]}</p>
                    
                    <div className="mb-6">
                      {pkgName === 'customize' ? (
                        <div className="text-2xl font-bold text-[#2a4599]">Custom Quote</div>
                      ) : (
                        <>
                          <div className="text-4xl font-bold text-[#2a4599]">
                            &#8377;{config?.price_per_sft?.toLocaleString() || '---'}
                          </div>
                          <div className="text-slate-500 text-sm mt-1">per sq.ft</div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2 mb-6 text-left">
                      {pkgName === 'classic' && ['Tata/JSW Fe500 Steel', 'UltraTech OPC 53', 'Vitrified Flooring', '1 Year Warranty'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {pkgName === 'select' && ['Tata Tiscon Fe500D', 'UltraTech Premium Cement', 'Granite/Marble Flooring', '2 Years Warranty'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {pkgName === 'signature' && ['Tata Tiscon Super Steel', 'ACC Gold Cement', 'Italian Marble Flooring', '3 Years Warranty'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {pkgName === 'customize' && ['Choose your materials', 'Flexible specifications', 'Personalized design', 'Negotiable warranty'].map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Link to={`/calculator?package=${pkgName}`}>
                      <Button
                        data-testid={`home-select-${pkgName}`}
                        className={`w-full py-3 font-bold rounded-sm ${
                          isRecommended
                            ? 'bg-[#F97316] hover:bg-[#ea580c] text-white'
                            : 'bg-[#2a4599] hover:bg-[#1e3a8a] text-white'
                        }`}
                      >
                        Get Estimate
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link to="/packages" className="text-[#2a4599] hover:underline font-semibold text-sm">
              View Detailed Package Comparison
              <ArrowRight className="inline ml-1" size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us - Card-based storytelling */}
      <section className="py-20 bg-[#010822]" data-testid="why-choose-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose Alpha Groups?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Building your home is the biggest investment of your life. Here's why 500+ families trusted us.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChooseUs.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-sm hover:bg-white/10 transition-all group"
              >
                <div className="w-14 h-14 bg-[#F97316]/10 rounded-sm flex items-center justify-center mb-5 group-hover:bg-[#F97316]/20 transition-colors">
                  <item.icon className="text-[#F97316]" size={28} />
                </div>
                <h4 className="text-lg font-bold text-white mb-3">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50" data-testid="process-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#2a4599]/10 px-4 py-2 rounded-full mb-4">
              <Clock size={16} className="text-[#2a4599]" />
              <span className="text-sm font-semibold text-[#2a4599]">Your Journey to Dream Home</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-[#010822] mb-4">
              Our 5-Step <span className="text-[#2a4599]">Transparent</span> Process
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base md:text-lg">
              From requirement collection to key handover - complete visibility at every stage.
            </p>
          </div>

          {/* Desktop Process */}
          <div className="hidden lg:block relative">
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[#2a4599] via-[#F97316] to-[#2a4599] rounded-full"></div>
            
            <div className="grid grid-cols-5 gap-4">
              {processSteps.map((step, idx) => (
                <div key={step.step} className="relative">
                  <div className="flex justify-center mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-xl relative z-10 shadow-lg transition-transform hover:scale-110 ${
                      idx === 2 ? 'bg-[#F97316] text-white' : 'bg-[#2a4599] text-white'
                    }`}>
                      {step.step}
                    </div>
                  </div>
                  
                  <div className={`bg-white p-6 rounded-sm border-2 transition-all hover:shadow-xl hover:-translate-y-2 ${
                    idx === 2 ? 'border-[#F97316]' : 'border-slate-100 hover:border-[#2a4599]'
                  }`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      idx === 2 ? 'bg-[#F97316]/10' : 'bg-[#2a4599]/10'
                    }`}>
                      <step.icon className={idx === 2 ? 'text-[#F97316]' : 'text-[#2a4599]'} size={24} />
                    </div>
                    
                    <h4 className="font-bold text-[#010822] text-lg mb-2">{step.title}</h4>
                    <p className="text-slate-600 text-sm mb-4 min-h-[60px]">{step.desc}</p>
                    
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

          {/* Mobile Process */}
          <div className="lg:hidden space-y-6">
            {processSteps.map((step, idx) => (
              <div key={step.step} className="flex gap-4">
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

          <div className="text-center mt-16">
            <p className="text-slate-600 mb-6">Ready to start your construction journey?</p>
            <Button 
              data-testid="process-cta"
              onClick={() => setShowLeadForm(true)}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm shadow-lg hover:shadow-xl transition-all"
            >
              Start Your Project
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* Quality Guarantee */}
      <section className="py-20 bg-slate-50" data-testid="quality-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#010822] mb-4">
              Our Quality Guarantee
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We use only premium, branded materials for every project - 
              ensuring durability, safety, and long-term value.
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
          <p className="text-slate-200 text-base md:text-lg mb-10 max-w-2xl mx-auto">
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
            <Button 
              data-testid="cta-start-project"
              variant="outline"
              onClick={() => setShowLeadForm(true)}
              className="border-2 border-white text-white hover:bg-white hover:text-[#2a4599] font-bold px-10 py-6 text-lg rounded-sm"
            >
              Start Your Project
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
