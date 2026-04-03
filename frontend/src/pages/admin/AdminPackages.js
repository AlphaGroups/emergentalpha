import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Edit, Trash2, Save, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/constants';

const AdminPackages = () => {
  const { token } = useAuth();
  const [packages, setPackages] = useState({ configs: [], features: [] });
  const [loading, setLoading] = useState(true);
  const [editingFeature, setEditingFeature] = useState(null);
  const [newFeature, setNewFeature] = useState({
    name: '',
    classic: '',
    select: '',
    signature: '',
    customize: 'As per choice',
    order: 0
  });
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/admin/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPackages(response.data);
    } catch (error) {
      console.error('Failed to fetch packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const updatePackageConfig = async (name, updates) => {
    try {
      await axios.patch(`${API}/admin/packages/${name}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Package updated');
      fetchPackages();
    } catch (error) {
      toast.error('Failed to update package');
    }
  };

  const addFeature = async () => {
    try {
      await axios.post(`${API}/admin/packages/features`, newFeature, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feature added');
      setAddDialogOpen(false);
      setNewFeature({ name: '', classic: '', select: '', signature: '', customize: 'As per choice', order: 0 });
      fetchPackages();
    } catch (error) {
      toast.error('Failed to add feature');
    }
  };

  const updateFeature = async (featureId, updates) => {
    try {
      await axios.patch(`${API}/admin/packages/features/${featureId}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feature updated');
      setEditingFeature(null);
      fetchPackages();
    } catch (error) {
      toast.error('Failed to update feature');
    }
  };

  const deleteFeature = async (featureId) => {
    if (!window.confirm('Delete this feature?')) return;
    try {
      await axios.delete(`${API}/admin/packages/features/${featureId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Feature deleted');
      fetchPackages();
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const reorderFeature = async (featureId, direction) => {
    const features = [...(packages.features || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const idx = features.findIndex(f => f.id === featureId);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === features.length - 1) return;

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    const tempOrder = features[idx].order ?? idx;
    features[idx].order = features[swapIdx].order ?? swapIdx;
    features[swapIdx].order = tempOrder;

    try {
      await axios.post(`${API}/admin/packages/features/reorder`, {
        feature_orders: features.map((f, i) => ({ id: f.id, order: f.order ?? i }))
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Feature reordered');
      fetchPackages();
    } catch (error) {
      toast.error('Failed to reorder');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="admin-packages" className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#010822]">Package Management</h1>
          <p className="text-slate-500 mt-1">Configure packages and features</p>
        </div>
      </div>

      {/* Package Configs */}
      <div className="grid md:grid-cols-4 gap-4">
        {packages.configs.map((config) => (
          <Card key={config.name} className="border border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg capitalize flex items-center justify-between">
                {config.name}
                <Switch
                  checked={config.is_visible}
                  onCheckedChange={(checked) => updatePackageConfig(config.name, { is_visible: checked })}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-slate-500">Price per Sq.Ft</Label>
                  <Input
                    type="number"
                    value={config.price_per_sft}
                    onChange={(e) => updatePackageConfig(config.name, { price_per_sft: parseFloat(e.target.value) })}
                    className="h-9 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">Description</Label>
                  <Input
                    value={config.description}
                    onChange={(e) => updatePackageConfig(config.name, { description: e.target.value })}
                    className="h-9 mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Table */}
      <Card className="border border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Package Features</CardTitle>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#2a4599] hover:bg-[#1e3a8a]">
                <Plus className="mr-2" size={16} />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Feature</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Feature Name</Label>
                  <Input
                    value={newFeature.name}
                    onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                    placeholder="e.g., Flooring"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Classic</Label>
                    <Input
                      value={newFeature.classic}
                      onChange={(e) => setNewFeature({ ...newFeature, classic: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Select</Label>
                    <Input
                      value={newFeature.select}
                      onChange={(e) => setNewFeature({ ...newFeature, select: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Signature</Label>
                    <Input
                      value={newFeature.signature}
                      onChange={(e) => setNewFeature({ ...newFeature, signature: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Customize</Label>
                    <Input
                      value={newFeature.customize}
                      onChange={(e) => setNewFeature({ ...newFeature, customize: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={newFeature.order}
                    onChange={(e) => setNewFeature({ ...newFeature, order: parseInt(e.target.value) })}
                    className="mt-1 w-24"
                  />
                </div>
                <Button onClick={addFeature} className="w-full bg-[#F97316] hover:bg-[#ea580c]">
                  Add Feature
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Classic</TableHead>
                  <TableHead>Select</TableHead>
                  <TableHead>Signature</TableHead>
                  <TableHead>Customize</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...packages.features].sort((a, b) => (a.order || 0) - (b.order || 0)).map((feature, idx) => (
                  <TableRow key={feature.id}>
                    {editingFeature === feature.id ? (
                      <>
                        <TableCell className="text-center text-sm text-slate-400">{idx + 1}</TableCell>
                        <TableCell>
                          <Input
                            defaultValue={feature.name}
                            id={`name-${feature.id}`}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={feature.classic}
                            id={`classic-${feature.id}`}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={feature.select}
                            id={`select-${feature.id}`}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={feature.signature}
                            id={`signature-${feature.id}`}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            defaultValue={feature.customize}
                            id={`customize-${feature.id}`}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => updateFeature(feature.id, {
                              name: document.getElementById(`name-${feature.id}`).value,
                              classic: document.getElementById(`classic-${feature.id}`).value,
                              select: document.getElementById(`select-${feature.id}`).value,
                              signature: document.getElementById(`signature-${feature.id}`).value,
                              customize: document.getElementById(`customize-${feature.id}`).value,
                              order: feature.order
                            })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Save size={14} />
                          </Button>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          <div className="flex flex-col items-center gap-0.5">
                            <button
                              data-testid={`reorder-up-${feature.id}`}
                              onClick={() => reorderFeature(feature.id, 'up')}
                              disabled={idx === 0}
                              className={`p-0.5 rounded ${idx === 0 ? 'text-slate-200' : 'text-slate-500 hover:text-[#2a4599] hover:bg-[#2a4599]/5'}`}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <span className="text-xs text-slate-400">{idx + 1}</span>
                            <button
                              data-testid={`reorder-down-${feature.id}`}
                              onClick={() => reorderFeature(feature.id, 'down')}
                              disabled={idx === packages.features.length - 1}
                              className={`p-0.5 rounded ${idx === packages.features.length - 1 ? 'text-slate-200' : 'text-slate-500 hover:text-[#2a4599] hover:bg-[#2a4599]/5'}`}
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell className="text-sm">{feature.classic}</TableCell>
                        <TableCell className="text-sm">{feature.select}</TableCell>
                        <TableCell className="text-sm">{feature.signature}</TableCell>
                        <TableCell className="text-sm">{feature.customize}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingFeature(feature.id)}
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => deleteFeature(feature.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPackages;
