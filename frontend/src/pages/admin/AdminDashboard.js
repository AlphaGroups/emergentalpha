import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, PhoneCall, CheckCircle, TrendingUp, Calculator } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

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

  const stats = [
    {
      title: 'Total Leads',
      value: analytics?.total_leads || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'New Leads',
      value: analytics?.new_leads || 0,
      icon: UserPlus,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Contacted',
      value: analytics?.contacted_leads || 0,
      icon: PhoneCall,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Converted',
      value: analytics?.converted_leads || 0,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div data-testid="admin-dashboard" className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your leads and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="stat-card border border-slate-200">
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

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Conversion Rate */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp size={20} className="text-[#2a4599]" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#2a4599]">
              {analytics?.conversion_rate?.toFixed(1)}%
            </div>
            <p className="text-slate-500 text-sm mt-2">
              {analytics?.converted_leads} converted out of {analytics?.total_leads} leads
            </p>
            <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#2a4599] rounded-full transition-all duration-500"
                style={{ width: `${analytics?.conversion_rate || 0}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Source Breakdown */}
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator size={20} className="text-[#F97316]" />
              Lead Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#2a4599] rounded-full"></div>
                  <span className="text-sm text-slate-600">Contact Form</span>
                </div>
                <span className="font-semibold">{analytics?.source_breakdown?.website || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[#F97316] rounded-full"></div>
                  <span className="text-sm text-slate-600">Cost Calculator</span>
                </div>
                <span className="font-semibold">{analytics?.source_breakdown?.calculator || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Breakdown */}
      {analytics?.project_breakdown && Object.keys(analytics.project_breakdown).length > 0 && (
        <Card className="border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Leads by Project Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(analytics.project_breakdown).map(([type, count]) => (
                <div key={type} className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-[#010822]">{count}</div>
                  <div className="text-xs text-slate-500 mt-1 capitalize">
                    {type.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
