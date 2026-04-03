import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Phone, Mail, MapPin, Handshake } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API, COLLABORATION_INTENTS } from '@/config/constants';

const AdminCollaboration = () => {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API}/admin/collaboration/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token]);

  const updateLeadStatus = async (leadId, status) => {
    try {
      await axios.patch(`${API}/admin/collaboration/leads/${leadId}?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      negotiating: 'bg-purple-100 text-purple-700',
      closed_won: 'bg-green-100 text-green-700',
      closed_lost: 'bg-red-100 text-red-700'
    };
    return <Badge className={colors[status] || colors.new}>{status.replace('_', ' ')}</Badge>;
  };

  const getIntentLabel = (intent) => {
    const config = COLLABORATION_INTENTS.find(i => i.value === intent);
    return config?.label || intent;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-collaboration" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">Collaboration Leads</h1>
        <p className="text-slate-500 mt-1">Land owners, investors & NRI inquiries</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Handshake className="mb-4" size={48} />
            <p>No collaboration inquiries yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Land Details</TableHead>
                  <TableHead className="font-semibold">Intent</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <div className="text-sm space-y-1 mt-1">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Phone size={12} />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-1 text-slate-500">
                            <Mail size={12} />
                            {lead.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-slate-700">
                          <MapPin size={12} />
                          {lead.land_location}
                        </div>
                        <div className="text-slate-500 mt-1">
                          Size: {lead.land_size}
                        </div>
                        {lead.message && (
                          <div className="text-slate-500 mt-1 text-xs max-w-[200px] truncate">
                            {lead.message}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getIntentLabel(lead.intent)}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="negotiating">Negotiating</SelectItem>
                          <SelectItem value="closed_won">Closed Won</SelectItem>
                          <SelectItem value="closed_lost">Closed Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(lead.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCollaboration;
