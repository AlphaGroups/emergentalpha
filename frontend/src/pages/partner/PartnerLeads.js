import { useState, useEffect } from 'react';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Phone, Mail, MapPin, Calendar } from 'lucide-react';
import axios from 'axios';
import { API, LEAD_STATUS } from '@/config/constants';

const PartnerLeads = () => {
  const { token } = usePartnerAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await axios.get(`${API}/partner/leads`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLeads(response.data);
      } catch (error) {
        console.error('Failed to fetch leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [token]);

  const getStatusBadge = (status) => {
    const statusConfig = LEAD_STATUS.find(s => s.value === status) || LEAD_STATUS[0];
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div data-testid="partner-leads" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">My Referrals</h1>
        <p className="text-slate-500 mt-1">Track all your referred leads</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p className="text-lg font-medium">No referrals yet</p>
            <p className="text-sm mt-2">Share your referral link to start earning</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Lead</TableHead>
                  <TableHead className="font-semibold">Project</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Deal Value</TableHead>
                  <TableHead className="font-semibold">Your Earning</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-[#010822]">{lead.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Phone size={12} />
                          {lead.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="capitalize">{lead.project_type?.replace(/_/g, ' ') || '-'}</p>
                        {lead.location && (
                          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                            <MapPin size={12} />
                            {lead.location}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(lead.status)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(lead.deal_value)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-bold ${lead.referral_earning ? 'text-green-600' : 'text-slate-400'}`}>
                        {formatCurrency(lead.referral_earning)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(lead.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-slate-50 p-4 rounded-sm">
        <p className="text-sm font-medium text-slate-700 mb-3">Status Legend:</p>
        <div className="flex flex-wrap gap-4">
          {LEAD_STATUS.map((status) => (
            <div key={status.value} className="flex items-center gap-2">
              <Badge className={status.color}>{status.label}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnerLeads;
