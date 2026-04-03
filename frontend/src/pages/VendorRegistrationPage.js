import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Wrench, Check, ArrowRight, Upload, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API, VENDOR_CATEGORY_GROUPS } from '@/config/constants';

const VendorRegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [otherText, setOtherText] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    website: '',
    categories: [],
    description: ''
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleCategoryChange = (category, checked) => {
    if (checked) {
      setFormData({ ...formData, categories: [...formData.categories, category] });
    } else {
      setFormData({ ...formData, categories: formData.categories.filter(c => c !== category) });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment(reader.result);
      setAttachmentName(file.name);
      toast.success('File attached');
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || formData.categories.length === 0) {
      toast.error('Please fill required fields and select at least one category');
      return;
    }

    // If "Other" is selected, append the custom text
    let categories = [...formData.categories];
    if (categories.includes('Other') && otherText.trim()) {
      categories = categories.map(c => c === 'Other' ? `Other: ${otherText.trim()}` : c);
    }

    setLoading(true);
    try {
      const payload = { ...formData, categories };
      if (attachment) {
        payload.document_data = attachment;
      }
      const response = await axios.post(`${API}/vendors`, payload);
      setVendorId(response.data.vendor_id);
      setSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="vendor-page" className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-12 text-center border border-slate-200 rounded-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#010822] mb-4">Registration Successful!</h2>
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
                setFormData({ name: '', company_name: '', phone: '', email: '', website: '', categories: [], description: '' });
                setAttachment(null);
                setAttachmentName('');
                setOtherText('');
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
      {/* Hero */}
      <section className="bg-[#010822] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Wrench size={18} className="text-[#F97316]" />
            <span className="text-white text-sm font-semibold">Vendor Network</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Join Our Vendor Network
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto">
            Partner with Alpha Groups and get access to premium construction projects across Hyderabad
          </p>
        </div>
      </section>

      {/* Form */}
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
                <Label className="text-sm font-medium text-slate-700">Company Name (Optional)</Label>
                <Input
                  data-testid="vendor-company"
                  placeholder="Company name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="h-12 mt-1"
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
                <Label className="text-sm font-medium text-slate-700">Email (Optional)</Label>
                <Input
                  data-testid="vendor-email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 mt-1"
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

            {/* Grouped Categories */}
            <div className="mt-8">
              <Label className="text-sm font-medium text-slate-700 mb-4 block">
                Service Categories * (Select all that apply)
              </Label>
              {formData.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.categories.map(cat => (
                    <span key={cat} className="bg-[#2a4599]/10 text-[#2a4599] px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                      {cat}
                      <button type="button" onClick={() => handleCategoryChange(cat, false)} className="hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-2 border border-slate-200 rounded-sm overflow-hidden">
                {VENDOR_CATEGORY_GROUPS.map((group) => (
                  <div key={group.group} className="border-b border-slate-100 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.group)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                    >
                      <span className="text-sm font-semibold text-[#010822]">{group.group}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">
                          {group.categories.filter(c => formData.categories.includes(c)).length}/{group.categories.length}
                        </span>
                        {expandedGroups[group.group] ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </button>
                    {expandedGroups[group.group] && (
                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.categories.map((category) => (
                          <label
                            key={category}
                            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all text-sm ${
                              formData.categories.includes(category)
                                ? 'bg-[#2a4599]/5 text-[#2a4599] font-medium'
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <Checkbox
                              checked={formData.categories.includes(category)}
                              onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                            />
                            <span>{category}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Other text input */}
              {formData.categories.includes('Other') && (
                <div className="mt-3">
                  <Input
                    data-testid="vendor-other-category"
                    placeholder="Please specify your service category"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}
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

            {/* Attachment Upload */}
            <div className="mt-6">
              <Label className="text-sm font-medium text-slate-700">Brochure / Visiting Card (Optional)</Label>
              <p className="text-xs text-slate-400 mb-2">PDF or Image only, max 5MB</p>
              {attachment ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-sm">
                  <FileText size={20} className="text-[#2a4599]" />
                  <span className="flex-1 text-sm font-medium truncate">{attachmentName}</span>
                  <button
                    type="button"
                    data-testid="remove-attachment"
                    onClick={removeAttachment}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-sm p-6 text-center hover:border-[#2a4599]/40 transition-colors">
                  <input
                    data-testid="vendor-file-input"
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="vendor-attachment"
                  />
                  <label htmlFor="vendor-attachment" className="cursor-pointer">
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <div className="text-sm text-slate-600">Click to upload brochure or visiting card</div>
                    <div className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (max 5MB)</div>
                  </label>
                </div>
              )}
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
