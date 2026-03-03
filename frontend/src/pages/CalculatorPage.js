import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator, ArrowRight, ArrowLeft, Check, Phone } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CalculatorPage = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    plotArea: searchParams.get('area') || '',
    projectType: searchParams.get('type')?.replace('_', ' ') || '',
    packageType: searchParams.get('package') || '',
    name: '',
    phone: '',
    email: '',
    location: '',
    message: ''
  });

  const projectTypes = [
    { value: 'independent_house', label: 'Independent House' },
    { value: 'villa', label: 'Luxury Villa' },
    { value: 'apartment', label: 'G+5 Apartment' },
    { value: 'school', label: 'School Building' },
    { value: 'interior', label: 'Residential Interior' },
  ];

  const packages = [
    { value: 'basic', label: 'Basic', desc: 'Standard quality materials' },
    { value: 'premium', label: 'Premium', desc: 'Enhanced specifications' },
    { value: 'luxury', label: 'Luxury', desc: 'Top-tier materials' },
  ];

  const hyderabadLocations = [
    'Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 'Madhapur',
    'Hitech City', 'Kokapet', 'Narsingi', 'Tellapur', 'Miyapur',
    'Kukatpally', 'Manikonda', 'Puppalaguda', 'Financial District', 'Other'
  ];

  const calculateCost = async () => {
    if (!formData.plotArea || !formData.projectType || !formData.packageType) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/calculate`, {
        plot_area: parseFloat(formData.plotArea),
        project_type: formData.projectType,
        package_type: formData.packageType
      });
      setResult(response.data);
      setStep(2);
    } catch (error) {
      toast.error('Calculation failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const submitQuote = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.location) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/quote-request`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        project_type: formData.projectType,
        plot_area: parseFloat(formData.plotArea),
        package_type: formData.packageType,
        location: formData.location,
        estimated_cost: result.estimated_cost,
        message: formData.message
      });
      setSubmitted(true);
      toast.success('Quote request submitted successfully!');
    } catch (error) {
      toast.error('Submission failed. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="calculator-page" className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-12 text-center border border-slate-200 rounded-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Thank You, {formData.name}!
            </h2>
            <p className="text-slate-600 mb-8">
              Your quote request has been submitted. Our team will contact you within 24 hours 
              with a detailed proposal.
            </p>
            <div className="bg-slate-50 p-6 rounded-sm mb-8">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-left">
                  <div className="text-slate-500">Project Type</div>
                  <div className="font-semibold text-[#010822]">{formData.projectType}</div>
                </div>
                <div className="text-left">
                  <div className="text-slate-500">Plot Area</div>
                  <div className="font-semibold text-[#010822]">{formData.plotArea} sq.ft</div>
                </div>
                <div className="text-left">
                  <div className="text-slate-500">Package</div>
                  <div className="font-semibold text-[#010822] capitalize">{formData.packageType}</div>
                </div>
                <div className="text-left">
                  <div className="text-slate-500">Estimated Cost</div>
                  <div className="font-semibold text-[#2a4599]">
                    ₹{result?.estimated_cost?.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
            <a href="tel:9492882197">
              <Button className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-8 py-4">
                <Phone className="mr-2" size={18} />
                Call Us Now: +91 94928 82197
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="calculator-page" className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-[#010822] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <Calculator size={18} className="text-[#F97316]" />
            <span className="text-white text-sm font-medium">Free Cost Calculator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Estimate Your Construction Cost
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Get an instant estimate in 30 seconds. No hidden costs, complete transparency.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-[#2a4599] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                1
              </div>
              <div className={`w-24 h-1 ${step >= 2 ? 'bg-[#2a4599]' : 'bg-slate-200'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-[#2a4599] text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                2
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 border border-slate-200 rounded-sm shadow-sm">
            {step === 1 && (
              <div data-testid="calculator-step-1" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#010822] mb-2">
                    Project Details
                  </h2>
                  <p className="text-slate-500">Tell us about your construction project</p>
                </div>

                {/* Plot Area */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Plot Area (sq.ft) *
                  </Label>
                  <Input
                    data-testid="input-plot-area"
                    type="number"
                    placeholder="e.g., 2400"
                    value={formData.plotArea}
                    onChange={(e) => setFormData({ ...formData, plotArea: e.target.value })}
                    className="h-14 text-lg border-slate-200 focus:border-[#2a4599]"
                  />
                </div>

                {/* Project Type */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Project Type *
                  </Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                  >
                    <SelectTrigger data-testid="select-project-type" className="h-14 text-lg border-slate-200">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Package Type */}
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                    Construction Package *
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.value}
                        data-testid={`package-${pkg.value}`}
                        onClick={() => setFormData({ ...formData, packageType: pkg.value })}
                        className={`p-4 border-2 rounded-sm text-center transition-all ${
                          formData.packageType === pkg.value
                            ? 'border-[#2a4599] bg-[#2a4599]/5'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-bold text-[#010822]">{pkg.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{pkg.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  data-testid="calculate-btn"
                  onClick={calculateCost}
                  disabled={loading}
                  className="w-full h-14 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-lg rounded-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      Calculate Cost
                      <ArrowRight className="ml-2" size={20} />
                    </>
                  )}
                </Button>
              </div>
            )}

            {step === 2 && result && (
              <div data-testid="calculator-step-2" className="space-y-8">
                {/* Result Card */}
                <div className="calculator-result p-8 rounded-sm">
                  <div className="text-center mb-6">
                    <div className="text-sm text-slate-500 mb-2">Estimated Construction Cost</div>
                    <div className="text-5xl font-bold text-[#2a4599]">
                      ₹{result.estimated_cost.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-500 mt-2">
                      Range: ₹{result.min_estimate.toLocaleString()} - ₹{result.max_estimate.toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center pt-6 border-t border-slate-200">
                    <div>
                      <div className="text-slate-500 text-xs">Plot Area</div>
                      <div className="font-semibold">{result.plot_area} sq.ft</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Rate</div>
                      <div className="font-semibold">₹{result.base_rate}/sq.ft</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Package</div>
                      <div className="font-semibold capitalize">{result.package_type}</div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold text-[#010822] mb-6">
                    Get Detailed Quote
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                      <Input
                        data-testid="input-name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Phone *</Label>
                      <Input
                        data-testid="input-phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Email *</Label>
                      <Input
                        data-testid="input-email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Location *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => setFormData({ ...formData, location: value })}
                      >
                        <SelectTrigger data-testid="select-location" className="h-12 mt-1">
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {hyderabadLocations.map((loc) => (
                            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-slate-700">Message (Optional)</Label>
                    <Input
                      data-testid="input-message"
                      placeholder="Any specific requirements?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="h-12 mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    data-testid="back-btn"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-12 px-6"
                  >
                    <ArrowLeft className="mr-2" size={18} />
                    Back
                  </Button>
                  <Button
                    data-testid="submit-quote-btn"
                    onClick={submitQuote}
                    disabled={loading}
                    className="flex-1 h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        Get Detailed Quote
                        <ArrowRight className="ml-2" size={18} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Trust Note */}
          <div className="text-center mt-8 text-sm text-slate-500">
            <p>✓ No spam, we respect your privacy</p>
            <p>✓ Free consultation with our experts</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CalculatorPage;
