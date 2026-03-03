import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowRight } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_7631421a-a6b0-45d2-a236-8129ee8a64ce/artifacts/ep212nvd_Alpha%20Logo.jpg';

const Footer = () => {
  const hyderabadAreas = [
    'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Kondapur',
    'Madhapur', 'Hitech City', 'Kokapet', 'Narsingi',
    'Tellapur', 'Miyapur'
  ];

  const services = [
    { name: 'Independent Houses', path: '/services' },
    { name: 'Luxury Villas', path: '/services' },
    { name: 'G+5 Apartments', path: '/services' },
    { name: 'School Construction', path: '/services' },
    { name: 'Residential Interiors', path: '/services' },
  ];

  const seoKeywords = [
    'house construction in Hyderabad',
    'villa builders in Gachibowli',
    'turnkey construction Hyderabad',
    'residential builders Jubilee Hills',
    'construction company Kondapur',
    'building contractors Madhapur',
    'home builders Hitech City',
    'apartment builders Hyderabad',
    'construction services Telangana',
    'best builders in Hyderabad'
  ];

  return (
    <footer className="bg-[#010822] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <img 
              src={LOGO_URL} 
              alt="Alpha Groups" 
              className="h-16 w-auto object-contain mb-6 bg-white p-2 rounded"
            />
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Hyderabad's trusted turnkey construction partner. We deliver quality homes 
              with complete transparency - on time, within budget.
            </p>
            <div className="space-y-3">
              <a 
                href="tel:9492882197" 
                className="flex items-center gap-3 text-slate-300 hover:text-[#F97316] transition-colors"
                data-testid="footer-phone"
              >
                <Phone size={18} />
                <span>+91 94928 82197</span>
              </a>
              <a 
                href="mailto:alphagroups1997@gmail.com" 
                className="flex items-center gap-3 text-slate-300 hover:text-[#F97316] transition-colors"
                data-testid="footer-email"
              >
                <Mail size={18} />
                <span>alphagroups1997@gmail.com</span>
              </a>
              <div className="flex items-start gap-3 text-slate-300">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>Hyderabad, Telangana, India</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <Link 
                    to={service.path}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                  >
                    <ArrowRight size={14} />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="text-lg font-bold mb-6">Service Areas</h3>
            <div className="flex flex-wrap gap-2">
              {hyderabadAreas.map((area) => (
                <span 
                  key={area}
                  className="text-xs px-3 py-1 bg-white/10 rounded text-slate-300"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/packages" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Construction Packages
                </Link>
              </li>
              <li>
                <Link to="/calculator" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Cost Calculator
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Request Quote
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-slate-400 hover:text-white transition-colors text-sm">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SEO Keywords Section */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h4 className="text-xs text-slate-500 mb-3 uppercase tracking-wider">We Serve</h4>
          <div className="flex flex-wrap gap-2">
            {seoKeywords.map((keyword) => (
              <span 
                key={keyword}
                className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-default"
              >
                {keyword} •
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Alpha Groups. All rights reserved.
            </p>
            <p className="text-slate-500 text-sm">
              Built with transparency. Delivered with trust.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
