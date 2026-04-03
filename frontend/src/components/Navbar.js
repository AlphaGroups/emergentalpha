import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LOGO_URL } from '@/config/constants';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Our Services', path: '/services' },
    { name: 'Collaboration', path: '/collaboration' },
    { name: 'Sales', path: '/sales' },
    { name: 'Partner', path: '/partner/login' },
  ];

  const isActive = (path) => location.pathname === path;

  const scrollToPackages = () => {
    if (location.pathname === '/') {
      document.getElementById('packages-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          <Link 
            to="/vendor-registration" 
            className="flex items-center gap-2 text-slate-300 hover:text-orange-400 transition-colors"
          >
            <User size={14} />
            <span className="hidden sm:inline">Vendor Registration</span>
          </Link>
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
                  data-testid={`nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
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
                  data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
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
