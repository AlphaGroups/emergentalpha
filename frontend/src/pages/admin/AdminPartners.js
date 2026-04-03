import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Download, Eye, CheckCircle, XCircle, X, BarChart3, Users, TrendingUp, Phone } from 'lucide-react';
import { API } from '@/config/constants';
import { exportToExcel } from '@/utils/exportExcel';

const AdminPartners = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [partnerAnalytics, setPartnerAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${API}/admin/partners-analytics`, { headers });
      setPartners(res.data);
    } catch (err) {
      // Fallback to basic partners list
      try {
        const res = await axios.get(`${API}/admin/partners`, { headers });
        setPartners(res.data);
      } catch (e) {
        toast.error('Failed to load partners');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePartnerStatus = async (partnerId, currentActive) => {
    try {
      await axios.patch(`${API}/admin/partners/${partnerId}`, { is_active: !currentActive }, { headers });
      toast.success(`Partner ${!currentActive ? 'activated' : 'deactivated'}`);
      fetchPartners();
    } catch (err) {
      toast.error('Failed to update partner');
    }
  };

  const viewPartnerAnalytics = async (partner) => {
    setSelectedPartner(partner);
    setAnalyticsLoading(true);
    try {
      const res = await axios.get(`${API}/admin/partners/${partner.id}/analytics`, { headers });
      setPartnerAnalytics(res.data);
    } catch (err) {
      setPartnerAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExport = () => {
    const columns = [
      { header: 'Name', key: 'name' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'Referral Code', key: 'referral_code' },
      { header: 'Active', key: 'is_active', transform: (v) => v ? 'Yes' : 'No' },
      { header: 'Total Leads', key: 'total_leads' },
      { header: 'New', key: 'new_leads' },
      { header: 'Contacted', key: 'contacted_leads' },
      { header: 'Converted', key: 'converted_leads' },
      { header: 'Lost', key: 'lost_leads' },
      { header: 'Conversion Rate', key: 'conversion_rate', transform: (v) => `${v || 0}%` },
    ];
    if (exportToExcel(partners, 'Partners', columns)) {
      toast.success('Partners exported successfully');
    } else {
      toast.error('No data to export');
    }
  };

  const sendWhatsApp = (phone, message) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[#2a4599] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div data-testid="admin-partners" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#010822]">Partners</h2>
          <p className="text-slate-500 text-sm">{partners.length} referral partners</p>
        </div>
        <Button
          data-testid="export-partners-btn"
          onClick={handleExport}
          variant="outline"
          className="border-[#2a4599] text-[#2a4599] hover:bg-[#2a4599]/5"
        >
          <Download size={16} className="mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="text-2xl font-bold text-[#2a4599]">{partners.length}</div>
          <div className="text-xs text-slate-500">Total Partners</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="text-2xl font-bold text-green-600">{partners.filter(p => p.is_active).length}</div>
          <div className="text-xs text-slate-500">Active</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="text-2xl font-bold text-[#F97316]">{partners.reduce((s, p) => s + (p.total_leads || 0), 0)}</div>
          <div className="text-xs text-slate-500">Total Leads</div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-sm">
          <div className="text-2xl font-bold text-green-600">{partners.reduce((s, p) => s + (p.converted_leads || 0), 0)}</div>
          <div className="text-xs text-slate-500">Converted</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Partner</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Referral Code</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Leads</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Converted</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600">Conv. Rate</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{partner.name}</div>
                    <div className="text-xs text-slate-500">{partner.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{partner.referral_code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${partner.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {partner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{partner.total_leads || 0}</td>
                  <td className="px-4 py-3 text-center font-semibold text-green-600">{partner.converted_leads || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold ${(partner.conversion_rate || 0) > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {partner.conversion_rate || 0}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`view-partner-${partner.id}`}
                        onClick={() => viewPartnerAnalytics(partner)}
                        className="text-[#2a4599] hover:text-[#1e3a8a]"
                        title="View Analytics"
                      >
                        <BarChart3 size={18} />
                      </button>
                      <button
                        onClick={() => sendWhatsApp(partner.phone, `Hi ${partner.name}, this is Alpha Groups.`)}
                        className="text-green-600 hover:text-green-700"
                        title="WhatsApp"
                      >
                        <Phone size={18} />
                      </button>
                      <button
                        onClick={() => togglePartnerStatus(partner.id, partner.is_active)}
                        className={partner.is_active ? 'text-red-500 hover:text-red-600' : 'text-green-600 hover:text-green-700'}
                        title={partner.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {partner.is_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {partners.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-400">No partners registered yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Analytics Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" data-testid="partner-analytics-modal">
          <div className="bg-white rounded-sm w-full max-w-2xl p-6 relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => { setSelectedPartner(null); setPartnerAnalytics(null); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-[#010822] mb-1">{selectedPartner.name}</h3>
            <p className="text-slate-500 text-sm mb-6">{selectedPartner.phone} | Code: {selectedPartner.referral_code}</p>

            {analyticsLoading ? (
              <div className="flex items-center justify-center h-40"><div className="animate-spin h-8 w-8 border-4 border-[#2a4599] border-t-transparent rounded-full"></div></div>
            ) : partnerAnalytics ? (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Total', val: partnerAnalytics.leads.total, color: 'text-[#2a4599]' },
                    { label: 'New', val: partnerAnalytics.leads.new, color: 'text-blue-600' },
                    { label: 'Contacted', val: partnerAnalytics.leads.contacted, color: 'text-yellow-600' },
                    { label: 'Converted', val: partnerAnalytics.leads.converted, color: 'text-green-600' },
                    { label: 'Lost', val: partnerAnalytics.leads.lost, color: 'text-red-600' },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 p-3 rounded-sm text-center">
                      <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                      <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#2a4599]/5 p-4 rounded-sm flex items-center justify-between">
                  <span className="text-sm font-medium text-[#010822]">Conversion Rate</span>
                  <span className="text-2xl font-bold text-[#2a4599]">{partnerAnalytics.leads.conversion_rate}%</span>
                </div>

                {/* Recent Leads */}
                {partnerAnalytics.recent_leads && partnerAnalytics.recent_leads.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#010822] mb-3">Recent Leads</h4>
                    <div className="space-y-2">
                      {partnerAnalytics.recent_leads.map((lead, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-50 p-3 rounded text-sm">
                          <div>
                            <div className="font-medium">{lead.name}</div>
                            <div className="text-xs text-slate-500">{lead.phone} | {lead.project_type}</div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            lead.status === 'converted' ? 'bg-green-100 text-green-700' :
                            lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                            lead.status === 'lost' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {lead.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {partnerAnalytics.recent_leads && partnerAnalytics.recent_leads.length === 0 && (
                  <div className="text-center text-slate-400 py-8">No leads referred yet</div>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-400 py-8">Failed to load analytics</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartners;
