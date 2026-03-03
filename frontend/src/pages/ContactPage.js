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
import { Phone, Mail, MapPin, Clock, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    projectType: '',
    location: '',
    message: ''
  });

  const projectTypes = [
    'Independent House',
    'Luxury Villa',
    'G+5 Apartment',
    'School Building',
    'Residential Interior',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.email || !formData.projectType) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/leads`, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        project_type: formData.projectType,
        location: formData.location,
        message: formData.message,
        source: 'contact_form'
      });
      setSubmitted(true);
      toast.success('Message sent successfully!');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div data-testid="contact-page" className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white p-12 text-center border border-slate-200 rounded-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#010822] mb-4">
              Message Received!
            </h2>
            <p className="text-slate-600 mb-8">
              Thank you for reaching out, {formData.name}. Our team will contact you 
              within 24 hours.
            </p>
            <a href="tel:9492882197">
              <Button className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-8 py-4">
                <Phone className="mr-2" size={18} />
                Call Now: +91 94928 82197
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="contact-page" className="min-h-screen">
      {/* Hero */}
      <section className="bg-[#010822] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Let's Build Together
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Ready to start your construction project? Get in touch with our 
            experts for a free consultation.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-[#010822] mb-8">
                Get in Touch
              </h2>

              <div className="space-y-6 mb-12">
                <a 
                  href="tel:9492882197"
                  data-testid="contact-phone-link"
                  className="flex items-start gap-4 p-6 bg-white border border-slate-200 hover:border-[#2a4599] transition-colors"
                >
                  <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Phone className="text-[#2a4599]" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-[#010822] mb-1">Call Us</div>
                    <div className="text-[#2a4599] font-semibold">+91 94928 82197</div>
                    <div className="text-slate-500 text-sm">Mon-Sat: 9AM - 7PM</div>
                  </div>
                </a>

                <a 
                  href="mailto:alphagroups1997@gmail.com"
                  data-testid="contact-email-link"
                  className="flex items-start gap-4 p-6 bg-white border border-slate-200 hover:border-[#2a4599] transition-colors"
                >
                  <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Mail className="text-[#2a4599]" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-[#010822] mb-1">Email Us</div>
                    <div className="text-[#2a4599] font-semibold">alphagroups1997@gmail.com</div>
                    <div className="text-slate-500 text-sm">We reply within 24 hours</div>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-6 bg-white border border-slate-200">
                  <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-[#2a4599]" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-[#010822] mb-1">Location</div>
                    <div className="text-slate-600">Hyderabad, Telangana</div>
                    <div className="text-slate-500 text-sm">Serving all major areas</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white border border-slate-200">
                  <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Clock className="text-[#2a4599]" size={24} />
                  </div>
                  <div>
                    <div className="font-bold text-[#010822] mb-1">Business Hours</div>
                    <div className="text-slate-600">Monday - Saturday</div>
                    <div className="text-slate-500 text-sm">9:00 AM - 7:00 PM</div>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div>
                <h3 className="font-bold text-[#010822] mb-4">Service Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {['Gachibowli', 'Jubilee Hills', 'Banjara Hills', 'Kondapur', 
                    'Madhapur', 'Hitech City', 'Kokapet', 'Narsingi'].map((area) => (
                    <span 
                      key={area}
                      className="px-3 py-1 bg-slate-100 text-slate-600 text-sm rounded"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 border border-slate-200 rounded-sm">
              <h2 className="text-2xl font-bold text-[#010822] mb-2">
                Request a Callback
              </h2>
              <p className="text-slate-500 mb-8">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                    <Input
                      data-testid="contact-input-name"
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
                      data-testid="contact-input-phone"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 mt-1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Email *</Label>
                  <Input
                    data-testid="contact-input-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-12 mt-1"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Project Type *</Label>
                  <Select
                    value={formData.projectType}
                    onValueChange={(value) => setFormData({ ...formData, projectType: value })}
                  >
                    <SelectTrigger data-testid="contact-select-project" className="h-12 mt-1">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Location (Optional)</Label>
                  <Input
                    data-testid="contact-input-location"
                    placeholder="Your area in Hyderabad"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Message (Optional)</Label>
                  <Textarea
                    data-testid="contact-input-message"
                    placeholder="Tell us about your project requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 min-h-[120px]"
                  />
                </div>

                <Button
                  data-testid="contact-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold text-lg rounded-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Send className="mr-2" size={20} />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-6">
                By submitting, you agree to be contacted by Alpha Groups regarding your inquiry.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
