import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Building2, 
  School, 
  Paintbrush, 
  ArrowRight,
  Check,
  Ruler,
  Hammer,
  HardHat,
  ClipboardCheck
} from 'lucide-react';

const SERVICE_VILLA = 'https://images.unsplash.com/photo-1757439402101-55d1da381e70?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBsdXh1cnklMjB2aWxsYSUyMGV4dGVyaW9yJTIwYXJjaGl0ZWN0dXJlfGVufDB8fHx8MTc3MjUzOTI0OHww&ixlib=rb-4.1.0&q=85';
const SERVICE_INTERIOR = 'https://images.unsplash.com/photo-1672927936377-97d1be3976cd?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbnRlcmlvciUyMGRlc2lnbiUyMGxpdmluZyUyMHJvb20lMjBsdXh1cnl8ZW58MHx8fHwxNzcyNTM5MjU2fDA&ixlib=rb-4.1.0&q=85';

const ServicesPage = () => {
  const services = [
    {
      id: 'independent-houses',
      icon: Home,
      title: 'Independent Houses',
      description: 'Custom-designed independent homes built to your specifications with premium materials and modern amenities.',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      features: [
        'Custom floor plans accepted',
        'Vastu-compliant designs',
        'Modern architectural styles',
        'Energy-efficient construction',
        'Complete turnkey delivery'
      ],
      scope: [
        'Foundation to finishing',
        'Electrical & plumbing',
        'Flooring & tiling',
        'Interior & exterior painting',
        'Doors & windows'
      ],
      startingPrice: '₹1,850/sq.ft'
    },
    {
      id: 'luxury-villas',
      icon: Building2,
      title: 'Luxury Villas',
      description: 'Premium villa construction with world-class amenities, designer finishes, and smart home integration.',
      image: SERVICE_VILLA,
      features: [
        'Premium imported materials',
        'Smart home ready',
        'Private pool options',
        'Landscape integration',
        'Designer interiors'
      ],
      scope: [
        'Architectural design support',
        'Premium structural work',
        'High-end finishing',
        'Home automation wiring',
        'Landscaping coordination'
      ],
      startingPrice: '₹2,200/sq.ft'
    },
    {
      id: 'apartments',
      icon: Building2,
      title: 'G+5 Apartments',
      description: 'Multi-story residential complex construction with focus on structural integrity and modern amenities.',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      features: [
        'Up to G+5 floors',
        'Earthquake-resistant design',
        'Common area development',
        'Parking solutions',
        'Utility infrastructure'
      ],
      scope: [
        'Structural engineering',
        'Multi-unit electrical',
        'Central plumbing systems',
        'Fire safety compliance',
        'Common area finishing'
      ],
      startingPrice: '₹1,650/sq.ft'
    },
    {
      id: 'schools',
      icon: School,
      title: 'School Buildings',
      description: 'Educational infrastructure built to safety standards with focus on functionality and durability.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
      features: [
        'Child-safe construction',
        'Proper ventilation design',
        'Durable materials',
        'Accessibility compliance',
        'Future expansion ready'
      ],
      scope: [
        'Classroom construction',
        'Laboratory setup',
        'Administrative blocks',
        'Sports facilities',
        'Safety infrastructure'
      ],
      startingPrice: '₹1,750/sq.ft'
    },
    {
      id: 'interiors',
      icon: Paintbrush,
      title: 'Residential Interiors',
      description: 'Transform your living spaces with expert interior design and execution - from modern to traditional styles.',
      image: SERVICE_INTERIOR,
      features: [
        'Custom design consultation',
        'Modular kitchen fitting',
        'Wardrobe solutions',
        'False ceiling work',
        '3D visualization'
      ],
      scope: [
        'Complete interior design',
        'Furniture & fixtures',
        'Lighting design',
        'Wall treatments',
        'Soft furnishing coordination'
      ],
      startingPrice: '₹1,200/sq.ft'
    }
  ];

  const workProcess = [
    { icon: ClipboardCheck, title: 'Consultation', desc: 'Understand your vision and requirements' },
    { icon: Ruler, title: 'Planning', desc: 'Detailed drawings and specifications' },
    { icon: Hammer, title: 'Construction', desc: 'Quality execution with updates' },
    { icon: HardHat, title: 'Delivery', desc: 'On-time handover with warranty' },
  ];

  return (
    <div data-testid="services-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#010822] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Construction Services
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              End-to-end turnkey construction solutions for residential and commercial projects.
              Bring your plans - we handle everything except approvals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {workProcess.map((step, idx) => (
                <div key={step.title} className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full">
                  <step.icon size={18} className="text-[#F97316]" />
                  <span className="text-white text-sm font-medium">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {services.map((service, idx) => (
              <div 
                key={service.id}
                id={service.id}
                data-testid={`service-${service.id}`}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={idx % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="w-14 h-14 bg-[#2a4599]/10 rounded-sm flex items-center justify-center mb-6">
                    <service.icon className="text-[#2a4599]" size={28} />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-[#010822] mb-4">
                    {service.title}
                  </h2>
                  
                  <p className="text-slate-600 mb-6">
                    {service.description}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="font-bold text-[#010822] mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                            <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#010822] mb-3">Our Scope</h4>
                      <ul className="space-y-2">
                        {service.scope.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                            <ArrowRight size={16} className="text-[#2a4599] mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-sm text-slate-500">Starting from</div>
                      <div className="text-2xl font-bold text-[#2a4599]">{service.startingPrice}</div>
                    </div>
                    <Link to={`/calculator?type=${service.id.replace('-', '_')}`}>
                      <Button 
                        data-testid={`get-quote-${service.id}`}
                        className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-6 py-4 rounded-sm"
                      >
                        Get Quote
                        <ArrowRight className="ml-2" size={18} />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className={idx % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="relative">
                    <img 
                      src={service.image}
                      alt={service.title}
                      className="w-full h-[400px] object-cover rounded-sm shadow-lg"
                    />
                    <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-sm shadow-lg">
                      <span className="text-sm font-bold text-[#2a4599]">
                        {service.startingPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Don't Do */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 border border-slate-200 rounded-sm">
            <h3 className="text-xl font-bold text-[#010822] mb-4">
              What's Not Included?
            </h3>
            <p className="text-slate-600 mb-6">
              As a turnkey construction partner, we handle everything except:
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                'Building Plan Approvals',
                'Government Permissions',
                'Land Purchase/Registry',
                'Architectural Drawings'
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                  {item}
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500 mt-6">
              Note: We accept client-provided approved plans and work with your existing architectural drawings.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#2a4599]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Have a Project in Mind?
          </h2>
          <p className="text-slate-200 mb-10">
            Get an instant cost estimate or speak with our construction experts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/calculator">
              <Button 
                data-testid="services-calculator-cta"
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm"
              >
                Get Free Estimate
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                data-testid="services-contact-cta"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#2a4599] font-bold px-10 py-6 text-lg rounded-sm"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
