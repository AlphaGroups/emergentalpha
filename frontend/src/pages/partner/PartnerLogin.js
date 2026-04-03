import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { LOGO_URL, API } from '@/config/constants';

const PartnerLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, token } = usePartnerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/partner/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/partner/login`, formData);
      login(response.data.token, response.data.partner);
      toast.success('Welcome back!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
      {/* Back to home */}
      <div className="p-4">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Website</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src={LOGO_URL} 
              alt="Alpha Groups" 
              className="h-16 w-auto mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-[#010822]">
              Partner Portal
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              Login to access your referral dashboard
            </p>
          </div>

          {/* Form */}
          <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  data-testid="partner-email"
                  type="email"
                  placeholder="partner@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    data-testid="partner-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 mt-1 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                data-testid="partner-submit"
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold rounded-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              <p>Partner accounts are created by Alpha Groups.</p>
              <p className="mt-2">
                <Link to="/referral-terms" className="text-[#2a4599] hover:underline">
                  View Referral Terms & Conditions
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;
