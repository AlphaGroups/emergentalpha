import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/constants';

const AdminPartners = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPartner, setNewPartner] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    commission_percent: 2
  });

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [token]);

  const createPartner = async () => {
    if (!newPartner.name || !newPartner.email || !newPartner.phone || !newPartner.password) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const response = await axios.post(`${API}/admin/partners`, newPartner, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Partner created! Referral code: ${response.data.referral_code}`);
      setAddDialogOpen(false);
      setNewPartner({ name: '', email: '', phone: '', password: '', commission_percent: 2 });
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create partner');
    }
  };

  const updatePartner = async (partnerId, updates) => {
    try {
      await axios.patch(`${API}/admin/partners/${partnerId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Partner updated');
      fetchPartners();
    } catch (error) {
      toast.error('Failed to update partner');
    }
  };

  const deletePartner = async (partnerId) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await axios.delete(`${API}/admin/partners/${partnerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Partner deleted');
      fetchPartners();
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const copyReferralLink = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/calculator?ref=${code}`);
    toast.success('Referral link copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-partners" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#010822]">Partner Management</h1>
          <p className="text-slate-500 mt-1">Manage referral partners</p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#2a4599] hover:bg-[#1e3a8a]">
              <Plus className="mr-2" size={16} />
              Add Partner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Partner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={newPartner.name}
                  onChange={(e) => setNewPartner({ ...newPartner, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newPartner.email}
                  onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newPartner.phone}
                  onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newPartner.password}
                  onChange={(e) => setNewPartner({ ...newPartner, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Commission %</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={newPartner.commission_percent}
                  onChange={(e) => setNewPartner({ ...newPartner, commission_percent: parseFloat(e.target.value) })}
                  className="mt-1 w-24"
                />
              </div>
              <Button onClick={createPartner} className="w-full bg-[#F97316] hover:bg-[#ea580c]">
                Create Partner
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white border border-slate-200 rounded-sm overflow-hidden">
        {partners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <p>No partners yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Partner</TableHead>
                  <TableHead className="font-semibold">Referral Code</TableHead>
                  <TableHead className="font-semibold">Commission</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Account Manager</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{partner.name}</p>
                        <p className="text-xs text-slate-500">{partner.email}</p>
                        <p className="text-xs text-slate-500">{partner.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="bg-slate-100 px-2 py-1 rounded text-sm">
                          {partner.referral_code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyReferralLink(partner.referral_code)}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.5"
                        defaultValue={partner.commission_percent}
                        onBlur={(e) => updatePartner(partner.id, { commission_percent: parseFloat(e.target.value) })}
                        className="w-20 h-8"
                      />
                      <span className="text-xs text-slate-500 ml-1">%</span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={partner.is_active}
                        onCheckedChange={(checked) => updatePartner(partner.id, { is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={partner.account_manager || ''}
                        placeholder="Assign manager"
                        onBlur={(e) => updatePartner(partner.id, { account_manager: e.target.value })}
                        className="w-40 h-8"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => deletePartner(partner.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
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

export default AdminPartners;
