import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';
import { Download, CheckCircle, XCircle, Clock, Eye, X } from 'lucide-react';
import { API } from '@/config/constants';
import { exportToExcel } from '@/utils/exportExcel';

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const { token } = useAuth();

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${API}/admin/vendors`, { headers });
      setVendors(res.data);
    } catch (err) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const updateVendorStatus = async (vendorId, status) => {
    try {
      await axios.patch(`${API}/admin/vendors/${vendorId}`, { status }, { headers });
      toast.success(`Vendor ${status}`);
      fetchVendors();
      if (selectedVendor?.id === vendorId) {
        setSelectedVendor({ ...selectedVendor, status });
      }
    } catch (err) {
      toast.error('Failed to update vendor');
    }
  };

  const handleExport = () => {
    const columns = [
      { header: 'Vendor ID', key: 'vendor_id' },
      { header: 'Name', key: 'name' },
      { header: 'Company', key: 'company_name' },
      { header: 'Phone', key: 'phone' },
      { header: 'Email', key: 'email' },
      { header: 'Categories', key: 'categories', transform: (v) => (v || []).join(', ') },
      { header: 'Description', key: 'description' },
      { header: 'Status', key: 'status' },
      { header: 'Registered', key: 'created_at', transform: (v) => v ? new Date(v).toLocaleDateString() : '' },
    ];
    if (exportToExcel(vendors, 'Vendors', columns)) {
      toast.success('Vendors exported successfully');
    } else {
      toast.error('No data to export');
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[#2a4599] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div data-testid="admin-vendors" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#010822]">Vendors</h2>
          <p className="text-slate-500 text-sm">{vendors.length} registered vendors</p>
        </div>
        <Button
          data-testid="export-vendors-btn"
          onClick={handleExport}
          variant="outline"
          className="border-[#2a4599] text-[#2a4599] hover:bg-[#2a4599]/5"
        >
          <Download size={16} className="mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Vendor ID</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Company</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Phone</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Categories</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map((vendor) => (
                <tr key={vendor.id || vendor.vendor_id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{vendor.vendor_id}</td>
                  <td className="px-4 py-3 font-medium">{vendor.name}</td>
                  <td className="px-4 py-3 text-slate-600">{vendor.company_name || '-'}</td>
                  <td className="px-4 py-3">{vendor.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(vendor.categories || []).map((c, i) => (
                        <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={vendor.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`view-vendor-${vendor.vendor_id}`}
                        onClick={() => setSelectedVendor(vendor)}
                        className="text-[#2a4599] hover:text-[#1e3a8a]"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {vendor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateVendorStatus(vendor.id, 'approved')}
                            className="text-green-600 hover:text-green-700"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => updateVendorStatus(vendor.id, 'rejected')}
                            className="text-red-500 hover:text-red-600"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-slate-400">No vendors registered yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" data-testid="vendor-detail-modal">
          <div className="bg-white rounded-sm w-full max-w-lg p-6 relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => setSelectedVendor(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-[#010822] mb-4">Vendor Details</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-500">Vendor ID</div>
                  <div className="font-mono font-semibold">{selectedVendor.vendor_id}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <StatusBadge status={selectedVendor.status} />
                </div>
                <div>
                  <div className="text-slate-500">Name</div>
                  <div className="font-semibold">{selectedVendor.name}</div>
                </div>
                <div>
                  <div className="text-slate-500">Company</div>
                  <div className="font-semibold">{selectedVendor.company_name || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Phone</div>
                  <div className="font-semibold">{selectedVendor.phone}</div>
                </div>
                <div>
                  <div className="text-slate-500">Email</div>
                  <div className="font-semibold">{selectedVendor.email || '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-slate-500">Categories</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(selectedVendor.categories || []).map((c, i) => (
                    <span key={i} className="bg-[#2a4599]/10 text-[#2a4599] px-2 py-1 rounded text-xs font-semibold">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Description</div>
                <div className="font-medium text-[#010822] mt-1 p-3 bg-slate-50 rounded">
                  {selectedVendor.description || 'No description provided'}
                </div>
              </div>
              {selectedVendor.website && (
                <div>
                  <div className="text-slate-500">Website</div>
                  <a href={selectedVendor.website} target="_blank" rel="noreferrer" className="text-[#2a4599] hover:underline">{selectedVendor.website}</a>
                </div>
              )}
              <div>
                <div className="text-slate-500">Registered</div>
                <div className="font-medium">{selectedVendor.created_at ? new Date(selectedVendor.created_at).toLocaleString() : '-'}</div>
              </div>
            </div>
            {selectedVendor.status === 'pending' && (
              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                <Button onClick={() => { updateVendorStatus(selectedVendor.id, 'approved'); setSelectedVendor(null); }} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  <CheckCircle size={16} className="mr-2" /> Approve
                </Button>
                <Button onClick={() => { updateVendorStatus(selectedVendor.id, 'rejected'); setSelectedVendor(null); }} variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50">
                  <XCircle size={16} className="mr-2" /> Reject
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVendors;
