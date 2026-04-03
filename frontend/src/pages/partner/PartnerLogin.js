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
  Users, TrendingUp, Shield, Award, Phone, KeyRound, Copy, Check
} from 'lucide-react';
import { LOGO_URL, API } from '@/config/constants';

const DEMO_PARTNER = {
  phone: '9876543210',
  password: 'partner123'
};

const PartnerLogin = () => {
  // Views: landing | login | login-otp | register | verify-reg | reset | reset-confirm
  const [view, setView] = useState('landing');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Login with password
  const [loginData, setLoginData] = useState({ phone: '', password: '' });
  // Login with OTP
  const [otpLoginPhone, setOtpLoginPhone] = useState('');
  const [otpLoginCode, setOtpLoginCode] = useState('');
  // Registration
  const [regData, setRegData] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [regOTP, setRegOTP] = useState('');
  const [regPhone, setRegPhone] = useState('');
  // Password reset
  const [resetPhone, setResetPhone] = useState('');
  const [resetOTP, setResetOTP] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  const { login, token } = usePartnerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/partner/dashboard', { replace: true });
  }, [token, navigate]);

  const fillDemoCredentials = () => {
    setLoginData({ phone: DEMO_PARTNER.phone, password: DEMO_PARTNER.password });
    setCopied(true);
    toast.success('Demo credentials filled!');
    setTimeout(() => setCopied(false), 2000);
  };

  // === LOGIN WITH PASSWORD ===
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!loginData.phone || !loginData.password) {
      toast.error('Please enter phone and password');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/partner/login`, loginData);
      login(res.data.token, res.data.partner);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // === LOGIN WITH OTP ===
  const handleRequestLoginOTP = async (e) => {
    e.preventDefault();
    if (!otpLoginPhone) {
      toast.error('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/partner/login-otp`, { phone: otpLoginPhone });
      toast.success('OTP sent to your phone!');
      setView('login-otp-verify');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOTP = async (e) => {
    e.preventDefault();
    if (!otpLoginCode) {
      toast.error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/partner/login-otp-verify`, { phone: otpLoginPhone, otp: otpLoginCode });
      login(res.data.token, res.data.partner);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // === REGISTRATION ===
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regData.name || !regData.phone || !regData.password) {
      toast.error('Name, Phone, and Password are required');
      return;
    }
    if (regData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/partner/register`, {
        name: regData.name,
        phone: regData.phone,
        email: regData.email || '',
        password: regData.password
      });
      toast.success('OTP sent to your phone!');
      setRegPhone(regData.phone);
      setView('verify-reg');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegOTP = async (e) => {
    e.preventDefault();
    if (!regOTP) {
      toast.error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/partner/verify-otp`, { phone: regPhone, otp: regOTP });
      if (res.data.token) {
        login(res.data.token, res.data.partner);
        toast.success('Registration complete! Welcome aboard!');
      } else {
        toast.success(res.data.message);
        setView('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // === PASSWORD RESET ===
  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!resetPhone) {
      toast.error('Please enter your phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/partner/reset-password`, { phone: resetPhone });
      toast.success('OTP sent to your phone!');
      setView('reset-confirm');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Phone number not found');
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    if (!resetOTP || !resetNewPassword) {
      toast.error('Please fill all fields');
      return;
    }
    if (resetNewPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/partner/reset-password-confirm`, {
        phone: resetPhone,
        otp: resetOTP,
        new_password: resetNewPassword
      });
      toast.success('Password reset! You can now login.');
      setView('login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed');
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

  const BackButton = ({ to }) => (
    <div className="p-4">
      <button
        onClick={() => setView(to || 'landing')}
        className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors"
      >
        <ArrowLeft size={18} />
        <span className="text-sm font-medium">Back</span>
      </button>
    </div>
  );

  const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
  );

  // =================== LANDING ===================
  if (view === 'landing') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#2a4599] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to Website</span>
          </Link>
        </div>

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

        <section className="py-16 bg-[#010822]">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-10">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Register', desc: 'Sign up with your name, phone & create a password' },
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

  // =================== LOGIN (password) ===================
  if (view === 'login') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="landing" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Partner Login</h1>
              <p className="text-slate-500 text-sm mt-2">Access your referral dashboard</p>
            </div>

            {/* Demo Credentials Banner */}
            <div 
              data-testid="partner-demo-credentials"
              className="bg-[#F97316]/5 border border-[#F97316]/20 rounded-sm p-4 mb-6"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#F97316] uppercase tracking-wider">Demo Credentials</span>
                <button
                  data-testid="partner-fill-demo-btn"
                  onClick={fillDemoCredentials}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2a4599] hover:text-[#1e3a8a] transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Filled!' : 'Use Demo'}
                </button>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                <div>Phone: <span className="font-mono font-semibold text-[#010822]">{DEMO_PARTNER.phone}</span></div>
                <div>Password: <span className="font-mono font-semibold text-[#010822]">{DEMO_PARTNER.password}</span></div>
              </div>
            </div>

            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handlePasswordLogin} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Mobile Number</Label>
                  <Input
                    data-testid="login-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={loginData.phone}
                    onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700">Password</Label>
                    <button
                      type="button"
                      data-testid="forgot-password-link"
                      onClick={() => setView('reset')}
                      className="text-xs text-[#2a4599] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      data-testid="login-password"
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
                  data-testid="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : 'Sign In'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">OR</span></div>
              </div>

              <Button
                data-testid="login-with-otp-btn"
                variant="outline"
                onClick={() => setView('login-otp')}
                className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
              >
                <Phone className="mr-2" size={18} />
                Login with OTP
              </Button>

              <div className="mt-6 text-center text-sm text-slate-500">
                <p>
                  Don't have an account?{' '}
                  <button data-testid="switch-to-register" onClick={() => setView('register')} className="text-[#2a4599] hover:underline font-semibold">
                    Register here
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== LOGIN WITH OTP ===================
  if (view === 'login-otp') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="login" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Login with OTP</h1>
              <p className="text-slate-500 text-sm mt-2">We'll send a verification code to your phone</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleRequestLoginOTP} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Mobile Number</Label>
                  <Input
                    data-testid="otp-login-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={otpLoginPhone}
                    onChange={(e) => setOtpLoginPhone(e.target.value)}
                    className="h-12 mt-1"
                  />
                </div>
                <Button
                  data-testid="send-login-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : 'Send OTP'}
                </Button>
              </form>
              <div className="mt-5 text-center">
                <button onClick={() => setView('login')} className="text-sm text-[#2a4599] hover:underline">
                  Login with Password instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== VERIFY LOGIN OTP ===================
  if (view === 'login-otp-verify') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="login-otp" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Verify OTP</h1>
              <p className="text-slate-500 text-sm mt-2">Enter the code sent to {otpLoginPhone}</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleVerifyLoginOTP} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-slate-700">OTP Code</Label>
                  <Input
                    data-testid="otp-login-code"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otpLoginCode}
                    onChange={(e) => setOtpLoginCode(e.target.value)}
                    className="h-14 mt-1 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-slate-400 mt-2">For testing, use OTP: 123456</p>
                </div>
                <Button
                  data-testid="verify-login-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : 'Verify & Login'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== REGISTER ===================
  if (view === 'register') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="landing" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Become a Partner</h1>
              <p className="text-slate-500 text-sm mt-2">Create your referral partner account</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleRegister} className="space-y-4">
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
                  <Label className="text-sm font-medium text-slate-700">Mobile Number *</Label>
                  <Input
                    data-testid="register-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={regData.phone}
                    onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Email (Optional)</Label>
                  <Input
                    data-testid="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Password *</Label>
                  <div className="relative">
                    <Input
                      data-testid="register-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
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
                <div>
                  <Label className="text-sm font-medium text-slate-700">Confirm Password *</Label>
                  <Input
                    data-testid="register-confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    className="h-12 mt-1"
                  />
                </div>
                <Button
                  data-testid="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : (
                    <>
                      Register & Get OTP
                      <ArrowRight className="ml-2" size={18} />
                    </>
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-slate-500">
                <p>
                  Already a partner?{' '}
                  <button data-testid="switch-to-login" onClick={() => setView('login')} className="text-[#2a4599] hover:underline font-semibold">
                    Login here
                  </button>
                </p>
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
  }

  // =================== VERIFY REGISTRATION OTP ===================
  if (view === 'verify-reg') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="register" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Verify Your Phone</h1>
              <p className="text-slate-500 text-sm mt-2">Enter the OTP sent to {regPhone}</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleVerifyRegOTP} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-slate-700">OTP Code</Label>
                  <Input
                    data-testid="reg-otp-input"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={regOTP}
                    onChange={(e) => setRegOTP(e.target.value)}
                    className="h-14 mt-1 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-slate-400 mt-2">For testing, use OTP: 123456</p>
                </div>
                <Button
                  data-testid="verify-reg-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : 'Verify & Complete Registration'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== RESET PASSWORD REQUEST ===================
  if (view === 'reset') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="login" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <div className="w-14 h-14 bg-[#2a4599]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="text-[#2a4599]" size={24} />
              </div>
              <h1 className="text-2xl font-bold text-[#010822]">Reset Password</h1>
              <p className="text-slate-500 text-sm mt-2">We'll send an OTP to verify your identity</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleResetRequest} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Registered Mobile Number</Label>
                  <Input
                    data-testid="reset-phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    className="h-12 mt-1"
                  />
                </div>
                <Button
                  data-testid="send-reset-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#2a4599] hover:bg-[#1e3a8a] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : 'Send Reset OTP'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =================== RESET CONFIRM ===================
  if (view === 'reset-confirm') {
    return (
      <div data-testid="partner-login-page" className="min-h-screen bg-slate-50 flex flex-col">
        <BackButton to="reset" />
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <img src={LOGO_URL} alt="Alpha Groups" className="h-16 w-auto mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#010822]">Set New Password</h1>
              <p className="text-slate-500 text-sm mt-2">Enter the OTP and your new password</p>
            </div>
            <div className="bg-white p-8 border border-slate-200 rounded-sm shadow-sm">
              <form onSubmit={handleResetConfirm} className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-slate-700">OTP Code</Label>
                  <Input
                    data-testid="reset-otp"
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={resetOTP}
                    onChange={(e) => setResetOTP(e.target.value)}
                    className="h-14 mt-1 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-slate-400 mt-2">For testing, use OTP: 123456</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">New Password</Label>
                  <Input
                    data-testid="reset-new-password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="h-12 mt-1"
                  />
                </div>
                <Button
                  data-testid="confirm-reset-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#F97316] hover:bg-[#ea580c] text-white font-bold rounded-sm"
                >
                  {loading ? <Spinner /> : 'Reset Password'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PartnerLogin;
