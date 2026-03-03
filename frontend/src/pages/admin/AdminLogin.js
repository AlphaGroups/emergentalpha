import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_7631421a-a6b0-45d2-a236-8129ee8a64ce/artifacts/ep212nvd_Alpha%20Logo.jpg';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLogin = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || (isRegister && !formData.name)) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegister ? '/admin/register' : '/admin/login';
      const payload = isRegister 
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      login(response.data.token, {
        email: response.data.email,
        name: response.data.name
      });
      
      toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
      navigate('/admin/dashboard');
    } catch (error) {
      const message = error.response?.data?.detail || 'Authentication failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen bg-slate-50 flex flex-col">
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
              {isRegister ? 'Create Admin Account' : 'Admin Portal'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {isRegister ? 'Set up your admin credentials' : 'Sign in to manage leads and analytics'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {isRegister && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                  <Input
                    data-testid="admin-input-name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
              )}

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
                data-testid="admin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold rounded-sm"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  isRegister ? 'Create Account' : 'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                data-testid="admin-toggle-mode"
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-[#2a4599] hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
