import { useState, useEffect } from 'react';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  IndianRupee, 
  Copy, 
  Check,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/constants';

const PartnerDashboard = () => {
  const { token, partner } = usePartnerAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${API}/partner/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboard(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const copyReferralLink = () => {
    const link = `${window.location.origin}/calculator?ref=${partner?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};

  return (
    <div data-testid="partner-dashboard" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">
          Welcome, {dashboard?.partner?.name}
        </h1>
        <p className="text-slate-500 mt-1">Track your referrals and earnings</p>
      </div>

      {/* Referral Code Card */}
      <Card className="bg-gradient-to-r from-[#2a4599] to-[#1e3a8a] text-white border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Your Referral Code</p>
              <p className="text-3xl font-bold">{partner?.referral_code}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={copyReferralLink}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {copied ? <Check className="mr-2" size={18} /> : <Copy className="mr-2" size={18} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
              <Button
                onClick={() => window.open(`/calculator?ref=${partner?.referral_code}`, '_blank')}
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                <ExternalLink className="mr-2" size={18} />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Referrals</p>
                <p className="text-3xl font-bold text-[#010822] mt-2">{stats.total_leads || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="text-blue-500" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">In Progress</p>
                <p className="text-3xl font-bold text-[#010822] mt-2">{stats.in_progress || 0}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <UserPlus className="text-yellow-500" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Converted</p>
                <p className="text-3xl font-bold text-[#010822] mt-2">{stats.converted || 0}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Earnings</p>
                <p className="text-3xl font-bold text-[#2a4599] mt-2">
                  {formatCurrency(stats.total_earnings)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <IndianRupee className="text-purple-500" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Total Earned</span>
                <span className="font-bold text-[#010822]">{formatCurrency(stats.total_earnings)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-600">Paid</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.paid_earnings)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-slate-600">Pending</span>
                <span className="font-bold text-[#F97316]">{formatCurrency(stats.pending_earnings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Account Manager</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.partner?.account_manager ? (
              <div className="space-y-3">
                <p className="font-medium text-[#010822]">{dashboard.partner.account_manager}</p>
                <p className="text-sm text-slate-500">
                  For any queries regarding your referrals or payments, please contact your account manager.
                </p>
              </div>
            ) : (
              <p className="text-slate-500">
                An account manager will be assigned to you shortly.
              </p>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">Commission Rate</p>
              <p className="text-2xl font-bold text-[#2a4599]">
                {dashboard?.partner?.commission_percent || 2}%
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerDashboard;
