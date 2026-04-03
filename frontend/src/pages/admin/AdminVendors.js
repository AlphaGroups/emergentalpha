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
import { Phone, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API, VENDOR_CATEGORIES } from '@/config/constants';

const AdminVendors = () => {
  const { token } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API}/admin/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data);
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [token]);

  const updateVendorStatus = async (vendorId, status) => {
    try {
      await axios.patch(`${API}/admin/vendors/${vendorId}?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Vendor status updated');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to update vendor');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    return <Badge className={colors[status] || colors.pending}>{status}</Badge>;
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
    <div data-testid="admin-vendors" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">Vendor Management</h1>
        <p className="text-slate-500 mt-1">Review and manage vendor registrations</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Building2 className="mb-4" size={48} />
            <p>No vendor registrations yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Vendor ID</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Categories</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id} className="hover:bg-slate-50">
                    <TableCell>
                      <code className="bg-slate-100 px-2 py-1 rounded text-xs">
                        {vendor.vendor_id}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{vendor.company_name}</p>
                        <p className="text-xs text-slate-500">{vendor.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" />
                          {vendor.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail size={12} className="text-slate-400" />
                          {vendor.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {vendor.categories?.map((cat, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={vendor.status}
                        onValueChange={(value) => updateVendorStatus(vendor.id, value)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {formatDate(vendor.created_at)}
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

export default AdminVendors;
