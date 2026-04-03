import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { 
  ArrowLeft, Eye, EyeOff, ArrowRight, IndianRupee, 
  Users, TrendingUp, Shield, Award, Phone 
} from 'lucide-react';
import { LOGO_URL, API } from '@/config/constants';

const PartnerLogin = () => {
  const [view, setView] = useState('landing'); // landing | login | register | otp
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [regData, setRegData] = useState({ name: '', phone: '', email: '' });
  const [otpData, setOtpData] = useState({ phone: '', otp: '' });
  const [regSuccess, setRegSuccess] = useState(false);

  const { login, token } = usePartnerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/partner/dashboard', { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API}/partner/login`, loginData);
      login(response.data.token, response.data.partner);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.name || !regData.phone || !regData.email) {
      toast.error('Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/partner/register`, regData);
      toast.success('OTP sent to your phone!');
      setOtpData({ phone: regData.phone, otp: '' });
      setView('otp');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpData.otp) {
      toast.error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/partner/verify-otp`, otpData);
      setRegSuccess(true);
      toast.success('Registration successful!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: IndianRupee, title: 'Earn 2% Commission', desc: 'Earn on every successful project referral.' },
    { icon: Users, title: 'Dedicated Support', desc: 'Personal account manager for your referrals.' },
    { icon: TrendingUp, title: 'Track Earnings', desc: 'Real-time dashboard for leads & payouts.' },
    { icon: Shield, title: 'Trusted Brand', desc: '25+ years of construction excellence.' },
    { icon: Award, title: 'Marketing Materials', desc: 'Professional brochures & content to share.' },
    { icon: Phone, title: 'Quick Payouts', desc: 'Earnings processed within 30 days.' },
  ];

  // Landing View
  if (view === 'landing') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Website</span>
          </Link>
        </div>

        {/* Hero */}
        <section className="bg-[#010822] py-16 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <img src={LOGO_URL} alt="Alpha Groups" className="h-14 w-auto mx-auto mb-6" />
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Alpha Groups <span className="text-[#F97316]">Referral Partner Program</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto mb-8">
              Refer homebuilders to Alpha Groups and earn attractive commissions on every successful project.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                data-testid="partner-register-cta"
                onClick={() => setView('register')}
                className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-8 py-5 text-lg rounded-sm"
              >
                Become a Partner
                <ArrowRight className="ml-2" size={20} />
              </Button>
              <Button
                data-testid="partner-login-cta"
                onClick={() => setView('login')}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#010822] font-bold px-8 py-5 text-lg rounded-sm"
              >
                Partner Login
              </Button>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#010822] text-center mb-12">
              Why Become a Referral Partner?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, idx) => (
                <div key={idx} className="bg-white p-6 border border-slate-200 rounded-sm hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#2a4599]/10 rounded-sm flex items-center justify-center mb-4">
                    <b.icon className="text-[#2a4599]" size={24} />
                  </div>
                  <h4 className="font-bold text-[#010822] mb-2">{b.title}</h4>
                  <p className="text-slate-600 text-sm">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-[#010822]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Register', desc: 'Sign up with your name, phone & email' },
                { step: '02', title: 'Refer', desc: 'Share your unique referral code with homebuilders' },
                { step: '03', title: 'Earn', desc: 'Get 2% commission when the project converts' },
              ].map((s) => (
                <div key={s.step}>
                  <div className="w-14 h-14 bg-[#F97316] rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">
                    {s.step}
                  </div>
                  <h4 className="font-bold text-white mb-2">{s.title}</h4>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <Link to="/referral-terms" className="text-[#F97316] hover:underline text-sm font-semibold">
                View Referral Terms & Conditions
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#2a4599] text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Ready to Start Earning?</h2>
            <Button
              onClick={() => setView('register')}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white font-bold px-10 py-5 text-lg rounded-sm"
            >
              Register as Partner
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </div>
        </section>
      </div>
    );
  }

  // Registration Success
  if (regSuccess) {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599]">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Website</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center bg-white p-10 rounded-sm border border-slate-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-[#010822] mb-3">Registration Successful!</h2>
            <p className="text-slate-600 mb-6">
              Your account is pending admin approval. You'll receive a notification once activated.
            </p>
            <Button 
              onClick={() => { setView('login'); setRegSuccess(false); }}
              className="bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification View
  if (view === 'otp') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <div className="p-4">
          <button onClick={() => setView('register')} className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599]">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Verify OTP</h1>
              <p className="text-slate-500 text-sm mt-2">Enter the OTP sent to {otpData.phone}</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700">OTP Code</Label>
                  <Input
                    data-testid="otp-input"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otpData.otp}
                    onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                    className="h-14 mt-1 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-slate-400 mt-2">For testing, use OTP: 123456</p>
                </div>
                <Button
                  data-testid="verify-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : 'Verify & Register'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Login / Register Form Views
  return (
    <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
      <div className="p-4">
        <button 
          onClick={() => setView('landing')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-[#010822]">
              {view === 'login' ? 'Partner Login' : 'Become a Partner'}
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              {view === 'login' ? 'Access your referral dashboard' : 'Register with your details'}
            </p>
          </div>

          <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Email</Label>
                  <Input
                    data-testid="partner-email"
                    type="email"
                    placeholder="partner@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Password</Label>
                  <div className="relative">
                    <Input
                      data-testid="partner-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                  ) : 'Sign In'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Full Name *</Label>
                  <Input
                    data-testid="register-name"
                    placeholder="Your full name"
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Phone Number *</Label>
                  <Input
                    data-testid="register-phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Email *</Label>
                  <Input
                    data-testid="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <Button
                  data-testid="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      Register & Get OTP
                      <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-slate-500">
              {view === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button 
                    data-testid="switch-to-register"
                    onClick={() => setView('register')} 
                    className="text-[#2a4599] hover:underline font-semibold"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already a partner?{' '}
                  <button 
                    data-testid="switch-to-login"
                    onClick={() => setView('login')} 
                    className="text-[#2a4599] hover:underline font-semibold"
                  >
                    Login here
                  </button>
                </p>
              )}
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
