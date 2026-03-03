import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_7631421a-a6b0-45d2-a236-8129ee8a64ce/artifacts/ep212nvd_Alpha%20Logo.jpg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Packages', path: '/packages' },
    { name: 'Services', path: '/services' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#010822] text-white py-2 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:9492882197" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Phone size={14} />
              <span>+91 94928 82197</span>
            </a>
            <a href="mailto:alphagroups1997@gmail.com" className="hidden sm:flex items-center gap-2 hover:text-orange-400 transition-colors">
              <Mail size={14} />
              <span>alphagroups1997@gmail.com</span>
            </a>
          </div>
          <div className="text-slate-400 text-xs">
            Hyderabad's Trusted Turnkey Construction Partner
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center" data-testid="logo-link">
              <img 
                src={LOGO_URL} 
                alt="Alpha Groups" 
                className="h-14 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`nav-${link.name.toLowerCase()}`}
                  className={`px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'text-[#2a4599]'
                      : 'text-slate-700 hover:text-[#2a4599]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <Link to="/calculator">
                <Button 
                  data-testid="navbar-cta"
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-6 py-2 rounded-sm"
                >
                  Get Free Estimate
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              data-testid="mobile-menu-toggle"
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-slate-100">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`mobile-nav-${link.name.toLowerCase()}`}
                  className={`block px-4 py-3 text-sm font-semibold rounded ${
                    isActive(link.path)
                      ? 'bg-[#2a4599]/10 text-[#2a4599]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Link to="/calculator" onClick={() => setIsOpen(false)}>
                <Button 
                  data-testid="mobile-cta"
                  className="w-full mt-4 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold py-3 rounded-sm"
                >
                  Get Free Estimate
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
