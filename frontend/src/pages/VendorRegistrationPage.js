import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Wrench, 
  Check, 
  ArrowRight,
  Building2,
  Paintbrush,
  Zap,
  Droplets,
  HardHat,
  Package
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API, VENDOR_CATEGORIES } from '@/config/constants';

const VendorRegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    website: '',
    categories: [],
    description: ''
  });

  const handleCategoryChange = (category, checked) => {
    if (checked) {
      setFormData({ ...formData, categories: [...formData.categories, category] });
    } else {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.company_name || !formData.phone || !formData.email || formData.categories.length === 0) {
      toast.error('Please fill all required fields and select at least one category');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/vendors`, formData);
      setVendorId(response.data.vendor_id);
      setSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Architect': Building2,
      'Structural Engineer': HardHat,
      'Contractor': Wrench,
      'Plumber': Droplets,
      'Electrician': Zap,
      'Material Supplier': Package,
      'Interior Designer': Paintbrush
    };
    return icons[category] || Wrench;
  };

  if (submitted) {
    return (
      <div data-testid="vendor-page" className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-12 text-center border border-slate-200 rounded-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Registration Successful!
            </h2>
            <div className="bg-slate-50 p-4 rounded mb-6">
              <p className="text-sm text-slate-500 mb-2">Your Vendor ID</p>
              <p className="text-2xl font-bold text-[#2a4599]">{vendorId}</p>
            </div>
            <p className="text-slate-600 mb-8">
              Thank you for registering with Alpha Groups. Our team will review your 
              application and contact you for potential collaboration opportunities.
            </p>
            <Button
              onClick={() => {
                setSubmitted(false);
                setFormData({
                  name: '',
                  company_name: '',
                  phone: '',
                  email: '',
                  website: '',
                  categories: [],
                  description: ''
                });
              }}
              className="bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold px-8 py-4"
            >
              Register Another Vendor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="vendor-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#010822] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Wrench size={18} className="text-[#F97316]" />
            <span className="text-white text-sm font-semibold">Vendor Network</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Vendor Network
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Partner with Alpha Groups and get access to premium construction projects across Hyderabad
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-sm border border-slate-200">
            <h2 className="text-2xl font-bold text-[#010822] mb-8">Vendor Registration</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Contact Person Name *</Label>
                <Input
                  data-testid="vendor-name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Company Name *</Label>
                <Input
                  data-testid="vendor-company"
                  placeholder="Company name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Phone *</Label>
                <Input
                  data-testid="vendor-phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Email *</Label>
                <Input
                  data-testid="vendor-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium text-slate-700">Website (Optional)</Label>
              <Input
                data-testid="vendor-website"
                placeholder="https://yourcompany.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="h-12 mt-1"
              />
            </div>

            <div className="mt-8">
              <Label className="text-sm font-medium text-slate-700 mb-4 block">
                Service Categories * (Select all that apply)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {VENDOR_CATEGORIES.map((category) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <label
                      key={category}
                      className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-all ${
                        formData.categories.includes(category)
                          ? 'border-[#2a4599] bg-[#2a4599]/5'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Checkbox
                        checked={formData.categories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                      />
                      <Icon size={18} className={formData.categories.includes(category) ? 'text-[#2a4599]' : 'text-slate-400'} />
                      <span className="text-sm font-medium text-slate-700">{category}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium text-slate-700">Description / Services Offered</Label>
              <Textarea
                data-testid="vendor-desc"
                placeholder="Describe your services, experience, and any specializations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 min-h-[120px]"
              />
            </div>

            <Button
              data-testid="vendor-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-8 h-14 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-lg rounded-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Submit Registration
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            By registering, you agree to be contacted by Alpha Groups for potential projects.
          </p>
        </div>
      </section>
    </div>
  );
};

export default VendorRegistrationPage;
