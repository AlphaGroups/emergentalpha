import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Handshake, 
  Building2, 
  TrendingUp, 
  Shield, 
  Check, 
  ArrowRight,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API, COLLABORATION_INTENTS } from '@/config/constants';

const CollaborationPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    land_location: '',
    land_size: '',
    intent: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.land_location || !formData.land_size || !formData.intent) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/collaboration/leads`, formData);
      setSubmitted(true);
      toast.success('Inquiry submitted successfully!');
    } catch (error) {
      toast.error('Submission failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Building2,
      title: 'Zero Investment',
      desc: 'You provide the land, we invest in construction'
    },
    {
      icon: Handshake,
      title: 'Profit Sharing',
      desc: 'Flexible models based on project specifics'
    },
    {
      icon: Shield,
      title: 'End-to-End Management',
      desc: 'From approvals to handover - we handle it all'
    },
    {
      icon: TrendingUp,
      title: 'Market Expertise',
      desc: '25+ years of Hyderabad real estate knowledge'
    },
    {
      icon: Clock,
      title: 'Time-Bound Execution',
      desc: 'Clear timelines with milestone tracking'
    },
    {
      icon: Users,
      title: 'Transparent Partnership',
      desc: 'Regular updates and financial clarity'
    }
  ];

  const collaborationTypes = [
    {
      title: 'Land Owners',
      desc: 'Own land but lack resources to develop? Partner with us for joint development.',
      color: 'bg-blue-500'
    },
    {
      title: 'Investors',
      desc: 'Looking to invest in Hyderabad real estate? We have curated opportunities.',
      color: 'bg-green-500'
    },
    {
      title: 'NRIs',
      desc: 'Want to build or invest in India? We offer end-to-end NRI services.',
      color: 'bg-purple-500'
    }
  ];

  if (submitted) {
    return (
      <div data-testid="collaboration-page" className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-12 text-center border border-slate-200 rounded-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Thank You for Your Interest!
            </h2>
            <p className="text-slate-600 mb-8">
              Our partnership team will review your inquiry and contact you within 48 hours 
              to discuss collaboration opportunities.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              className="bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold px-8 py-4"
            >
              Submit Another Inquiry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="collaboration-page" className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#010822] py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-[#F97316] px-4 py-2 rounded-full mb-6">
              <Handshake size={18} className="text-white" />
              <span className="text-white text-sm font-semibold">Partnership Opportunities</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              You Own Land.
              <span className="block text-[#F97316]">We Build. We Both Profit.</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-10">
              Partner with Alpha Groups for joint development opportunities. 
              No investment from your side - we handle everything from construction to sales.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="#inquiry-form">
                <Button 
                  data-testid="hero-cta"
                  className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-6 text-lg rounded-sm"
                >
                  Start Partnership Discussion
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Who Can Partner With Us?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {collaborationTypes.map((type, idx) => (
              <div 
                key={idx}
                className="bg-white p-8 border border-slate-200 rounded-sm hover:shadow-lg transition-shadow"
              >
                <div className={`w-12 h-1 ${type.color} mb-6`}></div>
                <h3 className="text-xl font-bold text-[#010822] mb-3">{type.title}</h3>
                <p className="text-slate-600">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Why Partner With Alpha Groups?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="text-[#2a4599]" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-[#010822] mb-2">{benefit.title}</h4>
                  <p className="text-slate-600 text-sm">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#010822] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Collaboration Works</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Submit Inquiry', desc: 'Share your land details with us' },
              { step: '02', title: 'Site Evaluation', desc: 'We assess location & potential' },
              { step: '03', title: 'Agreement', desc: 'Custom terms based on project' },
              { step: '04', title: 'Execution & Profit', desc: 'We build, you earn' }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 bg-[#F97316] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  {item.step}
                </div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="inquiry-form" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Start the Conversation
            </h2>
            <p className="text-slate-600">
              Tell us about your land or investment interest
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-50 p-8 md:p-12 rounded-sm border border-slate-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                <Input
                  data-testid="collab-name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Phone *</Label>
                <Input
                  data-testid="collab-phone"
                  placeholder="+91 XXXXX XXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium text-slate-700">Email *</Label>
              <Input
                data-testid="collab-email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 mt-1"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Land Location *</Label>
                <Input
                  data-testid="collab-location"
                  placeholder="e.g., Gachibowli, Hyderabad"
                  value={formData.land_location}
                  onChange={(e) => setFormData({ ...formData, land_location: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Land Size *</Label>
                <Input
                  data-testid="collab-size"
                  placeholder="e.g., 500 sq.yards"
                  value={formData.land_size}
                  onChange={(e) => setFormData({ ...formData, land_size: e.target.value })}
                  className="h-12 mt-1"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium text-slate-700">I am a *</Label>
              <Select
                value={formData.intent}
                onValueChange={(value) => setFormData({ ...formData, intent: value })}
              >
                <SelectTrigger data-testid="collab-intent" className="h-12 mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {COLLABORATION_INTENTS.map((intent) => (
                    <SelectItem key={intent.value} value={intent.value}>
                      {intent.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-6">
              <Label className="text-sm font-medium text-slate-700">Additional Details</Label>
              <Textarea
                data-testid="collab-message"
                placeholder="Tell us more about your land or investment goals..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 min-h-[120px]"
              />
            </div>

            <Button
              data-testid="collab-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-8 h-14 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-lg rounded-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  Submit Inquiry
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Your information is secure. We'll contact you within 48 hours.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CollaborationPage;
