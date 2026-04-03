import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Trash2, Phone, Mail, MapPin, Download } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { exportToExcel } from '@/utils/exportExcel';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLeads = () => {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await axios.get(`${API}/admin/leads?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(response.data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token, statusFilter]);

  const updateLeadStatus = async (leadId, newStatus) => {
    try {
      await axios.patch(`${API}/admin/leads/${leadId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      toast.success('Status updated');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const deleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      await axios.delete(`${API}/admin/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Lead deleted');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.phone.includes(searchTerm)
  );

  const getStatusBadge = (status) => {
    const variants = {
      new: 'bg-blue-100 text-blue-700',
      contacted: 'bg-yellow-100 text-yellow-700',
      converted: 'bg-green-100 text-green-700',
      lost: 'bg-red-100 text-red-700'
    };
    return variants[status] || variants.new;
  };

  const handleExport = () => {
    const columns = [
      { header: 'Name', key: 'name' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'Project Type', key: 'project_type' },
      { header: 'Plot Area', key: 'plot_area' },
      { header: 'Location', key: 'location' },
      { header: 'Budget', key: 'budget' },
      { header: 'Status', key: 'status' },
      { header: 'Source', key: 'source' },
      { header: 'Referral Code', key: 'referral_code' },
      { header: 'Message', key: 'message' },
      { header: 'Date', key: 'created_at', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ];
    if (exportToExcel(filteredLeads, 'Leads', columns)) {
      toast.success('Leads exported successfully');
    } else {
      toast.error('No data to export');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div data-testid="admin-leads" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#010822]">Leads</h1>
          <p className="text-slate-500 mt-1">Manage and track your construction leads</p>
        </div>
        <Button
          data-testid="export-leads-btn"
          onClick={handleExport}
          variant="outline"
          className="border-[#2a4599] text-[#2a4599] hover:bg-[#2a4599]/5"
        >
          <Download size={16} className="mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <Input
            data-testid="leads-search"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger data-testid="leads-status-filter" className="w-full md:w-48 h-11">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p>No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Project Type</TableHead>
                  <TableHead className="font-semibold">Source</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          {lead.phone}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <Mail size={12} className="text-slate-400" />
                          {lead.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">
                      {lead.project_type?.replace(/_/g, ' ') || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {lead.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => updateLeadStatus(lead.id, value)}
                      >
                        <SelectTrigger className={`w-28 h-8 ${getStatusBadge(lead.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="converted">Converted</SelectItem>
                          <SelectItem value="lost">Lost</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          data-testid={`view-lead-${lead.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedLead(lead);
                            setViewDialogOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </Button>
                        <Button
                          data-testid={`delete-lead-${lead.id}`}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteLead(lead.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* View Lead Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#2a4599] text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedLead.name}</h3>
                  <Badge className={getStatusBadge(selectedLead.status)}>
                    {selectedLead.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Phone</div>
                  <a href={`tel:${selectedLead.phone}`} className="flex items-center gap-2 text-[#2a4599] hover:underline">
                    <Phone size={14} />
                    {selectedLead.phone}
                  </a>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Email</div>
                  <a href={`mailto:${selectedLead.email}`} className="flex items-center gap-2 text-[#2a4599] hover:underline">
                    <Mail size={14} />
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Project Type</div>
                  <div className="capitalize">{selectedLead.project_type?.replace(/_/g, ' ')}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Source</div>
                  <div className="capitalize">{selectedLead.source}</div>
                </div>
                {selectedLead.plot_area && (
                  <div>
                    <div className="text-slate-500 mb-1">Plot Area</div>
                    <div>{selectedLead.plot_area} sq.ft</div>
                  </div>
                )}
                {selectedLead.budget && (
                  <div>
                    <div className="text-slate-500 mb-1">Budget/Estimate</div>
                    <div>{selectedLead.budget}</div>
                  </div>
                )}
                {selectedLead.location && (
                  <div className="col-span-2">
                    <div className="text-slate-500 mb-1">Location</div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedLead.location}
                    </div>
                  </div>
                )}
              </div>

              {selectedLead.message && (
                <div>
                  <div className="text-slate-500 mb-2 text-sm">Message</div>
                  <div className="bg-slate-50 p-4 rounded text-sm">
                    {selectedLead.message}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400">
                Created: {formatDate(selectedLead.created_at)}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-[#2a4599] hover:bg-[#1e3a8a]"
                  onClick={() => window.open(`tel:${selectedLead.phone}`)}
                >
                  <Phone className="mr-2" size={16} />
                  Call
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(`mailto:${selectedLead.email}`)}
                >
                  <Mail className="mr-2" size={16} />
                  Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeads;

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
