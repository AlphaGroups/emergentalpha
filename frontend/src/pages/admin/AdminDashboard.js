import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, TrendingUp, Building2, Wrench, Handshake } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config/constants';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API}/admin/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  const leadStats = [
    { title: 'Total Leads', value: analytics?.leads?.total || 0, icon: Users, color: 'bg-blue-500', bgColor: 'bg-blue-50' },
    { title: 'New Leads', value: analytics?.leads?.new || 0, icon: UserPlus, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { title: 'Contacted', value: analytics?.leads?.contacted || 0, icon: Users, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { title: 'Converted', value: analytics?.leads?.converted || 0, icon: TrendingUp, color: 'bg-emerald-500', bgColor: 'bg-emerald-50' },
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your business metrics</p>
      </div>

      {/* Lead Stats */}
      <div>
        <h2 className="text-lg font-semibold text-[#010822] mb-4">Leads</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {leadStats.map((stat) => (
            <Card key={stat.title} className="border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                    <p className="text-3xl font-bold text-[#010822] mt-2">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`text-${stat.color.replace('bg-', '')}`} size={24} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Handshake size={16} />
              Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#010822]">{analytics?.partners?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">{analytics?.partners?.active || 0} active</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Building2 size={16} />
              Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#010822]">{analytics?.listings?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">{analytics?.listings?.available || 0} available</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Wrench size={16} />
              Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#010822]">{analytics?.vendors?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">{analytics?.vendors?.pending || 0} pending</p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Users size={16} />
              Collaboration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#010822]">{analytics?.collaboration?.total || 0}</div>
            <p className="text-xs text-slate-500 mt-1">inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Lead Sources */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Lead Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded">
              <div className="text-2xl font-bold text-[#2a4599]">{analytics?.sources?.website || 0}</div>
              <div className="text-sm text-slate-500">Website</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded">
              <div className="text-2xl font-bold text-[#F97316]">{analytics?.sources?.calculator || 0}</div>
              <div className="text-sm text-slate-500">Calculator</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded">
              <div className="text-2xl font-bold text-green-600">{analytics?.sources?.referral || 0}</div>
              <div className="text-sm text-slate-500">Referrals</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
