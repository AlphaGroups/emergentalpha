import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { LOGO_URL, API } from '@/config/constants';

const DEMO_CREDENTIALS = {
  email: 'test@alpha.com',
  password: 'password123'
};

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/admin/dashboard', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/admin/login`, {
        email: formData.email,
        password: formData.password
      });
      login(response.data.token, {
        email: response.data.email,
        name: response.data.name
      });
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({ email: DEMO_CREDENTIALS.email, password: DEMO_CREDENTIALS.password });
    setCopied(true);
    toast.success('Demo credentials filled!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-4">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back to Website</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#010822]">Admin Portal</h1>
            <p className="text-slate-500 text-sm mt-2">Sign in to manage leads and analytics</p>
          </div>

          {/* Demo Credentials Banner */}
          <div 
            data-testid="admin-demo-credentials"
            className="bg-[#2a4599]/5 border border-[#2a4599]/20 rounded-sm p-4 mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#2a4599] uppercase tracking-wider">Demo Credentials</span>
              <button
                data-testid="admin-fill-demo-btn"
                onClick={fillDemoCredentials}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F97316] hover:text-[#ea580c] transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Filled!' : 'Use Demo'}
              </button>
            </div>
            <div className="space-y-1 text-sm text-slate-600">
              <div>Email: <span className="font-mono font-semibold text-[#010822]">{DEMO_CREDENTIALS.email}</span></div>
              <div>Password: <span className="font-mono font-semibold text-[#010822]">{DEMO_CREDENTIALS.password}</span></div>
            </div>
          </div>

          <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Email</Label>
                <Input
                  data-testid="admin-input-email"
                  type="email"
                  placeholder="admin@alphagroups.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-700">Password</Label>
                <div className="relative">
                  <Input
                    data-testid="admin-input-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
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
                data-testid="admin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold rounded-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : 'Sign In'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
