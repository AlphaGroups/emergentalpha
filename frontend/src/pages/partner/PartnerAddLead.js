import { useState } from 'react';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
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
import { UserPlus, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/constants';

const PartnerAddLead = () => {
  const { token, partner } = usePartnerAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    project_type: '',
    plot_area: '',
    location: '',
    budget: '',
    message: ''
  });

  const projectTypes = [
    { value: 'independent_house', label: 'Independent House' },
    { value: 'villa', label: 'Luxury Villa' },
    { value: 'apartment', label: 'G+5 Apartment' },
    { value: 'school', label: 'School Building' },
    { value: 'interior', label: 'Residential Interior' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.project_type) {
      toast.error('Name, Phone and Project Type are required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/leads`, {
        ...formData,
        plot_area: formData.plot_area ? parseFloat(formData.plot_area) : null,
        referral_code: partner?.referral_code || '',
        source: 'partner_portal'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitted(true);
      toast.success('Lead submitted successfully! It will appear in your referrals.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit lead');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="partner-add-lead" className="max-w-2xl mx-auto">
        <div className="bg-white p-12 text-center border border-slate-200 rounded-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#010822] mb-3">Lead Submitted!</h2>
          <p className="text-slate-600 mb-2">
            The lead has been added with your referral code: <span className="font-bold text-[#2a4599]">{partner?.referral_code}</span>
          </p>
          <p className="text-slate-500 text-sm mb-6">
            You can track its status in "My Referrals" section.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setFormData({ name: '', phone: '', email: '', project_type: '', plot_area: '', location: '', budget: '', message: '' });
            }}
            className="bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold"
          >
            <UserPlus size={18} className="mr-2" />
            Add Another Lead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="partner-add-lead" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">Add New Lead</h1>
        <p className="text-slate-500 mt-1">Submit a referral lead — it will be tagged with your code <span className="font-semibold text-[#2a4599]">{partner?.referral_code}</span></p>
      </div>

      <div className="bg-white p-8 border border-slate-200 rounded-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Client Name *</Label>
              <Input
                data-testid="lead-input-name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Phone Number *</Label>
              <Input
                data-testid="lead-input-phone"
                placeholder="+91 XXXXX XXXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Email (Optional)</Label>
              <Input
                data-testid="lead-input-email"
                type="email"
                placeholder="client@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Project Type *</Label>
              <Select
                value={formData.project_type}
                onValueChange={(value) => setFormData({ ...formData, project_type: value })}
              >
                <SelectTrigger data-testid="lead-select-project" className="h-12 mt-1">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Plot Area (sq.ft)</Label>
              <Input
                data-testid="lead-input-area"
                type="number"
                placeholder="e.g., 2400"
                value={formData.plot_area}
                onChange={(e) => setFormData({ ...formData, plot_area: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-slate-700">Location</Label>
              <Input
                data-testid="lead-input-location"
                placeholder="e.g., Gachibowli, Hyderabad"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="h-12 mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">Budget Range</Label>
            <Input
              data-testid="lead-input-budget"
              placeholder="e.g., 50L - 1Cr"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="h-12 mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700">Additional Notes</Label>
            <Textarea
              data-testid="lead-input-notes"
              placeholder="Any specific requirements or notes..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Referral Code Tag */}
          <div className="bg-[#2a4599]/5 border border-[#2a4599]/20 rounded-sm p-3 flex items-center gap-3">
            <UserPlus size={18} className="text-[#2a4599]" />
            <span className="text-sm text-[#010822]">Referral Code: <span className="font-bold text-[#2a4599]">{partner?.referral_code}</span> (auto-applied)</span>
          </div>

          <Button
            data-testid="submit-lead-btn"
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Submit Lead
                <ArrowRight className="ml-2" size={18} />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PartnerAddLead;
