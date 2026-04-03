import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Upload, Trash2, FileText, Image, Film, Link2, Send, X, Download, Plus } from 'lucide-react';
import { API } from '@/config/constants';

const AdminMaterials = () => {
  const { token } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [partners, setPartners] = useState([]);
  const [showWhatsApp, setShowWhatsApp] = useState(null);
  const [selectedPartners, setSelectedPartners] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_url: '',
    file_type: 'pdf'
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchMaterials();
    fetchPartners();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API}/admin/materials`, { headers });
      setMaterials(res.data);
    } catch (err) {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await axios.get(`${API}/admin/partners`, { headers });
      setPartners(res.data.filter(p => p.is_active));
    } catch (err) {
      console.error('Failed to load partners');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert to base64 data URL for storage
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const fileType = file.type.startsWith('image/') ? 'image' :
                         file.type.startsWith('video/') ? 'video' :
                         file.type.includes('pdf') ? 'pdf' : 'document';
        setFormData({
          ...formData,
          file_url: reader.result,
          file_type: fileType,
          title: formData.title || file.name.replace(/\.[^/.]+$/, '')
        });
        setUploading(false);
        toast.success('File ready for upload');
      };
      reader.onerror = () => {
        setUploading(false);
        toast.error('Failed to read file');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploading(false);
      toast.error('Failed to process file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file_url) {
      toast.error('Title and file are required');
      return;
    }
    setUploading(true);
    try {
      await axios.post(`${API}/admin/materials`, formData, { headers });
      toast.success('Material uploaded successfully');
      setShowAdd(false);
      setFormData({ title: '', description: '', file_url: '', file_type: 'pdf' });
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to upload material');
    } finally {
      setUploading(false);
    }
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await axios.delete(`${API}/admin/materials/${id}`, { headers });
      toast.success('Material deleted');
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to delete material');
    }
  };

  const sendToWhatsApp = (material) => {
    if (selectedPartners.length === 0) {
      toast.error('Select at least one partner');
      return;
    }

    const message = `*${material.title}*\n\n${material.description || 'New marketing material from Alpha Groups'}\n\nDownload: ${material.file_url.startsWith('data:') ? '[Material attached separately]' : material.file_url}`;

    selectedPartners.forEach((partnerId) => {
      const partner = partners.find(p => p.id === partnerId);
      if (partner) {
        const phone = partner.phone.replace(/\D/g, '');
        const fullPhone = phone.startsWith('91') ? phone : `91${phone}`;
        window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    });

    toast.success(`Opening WhatsApp for ${selectedPartners.length} partner(s)`);
    setShowWhatsApp(null);
    setSelectedPartners([]);
  };

  const togglePartnerSelection = (id) => {
    setSelectedPartners(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const selectAllPartners = () => {
    if (selectedPartners.length === partners.length) {
      setSelectedPartners([]);
    } else {
      setSelectedPartners(partners.map(p => p.id));
    }
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={20} className="text-blue-500" />;
      case 'video': return <Film size={20} className="text-purple-500" />;
      case 'pdf': return <FileText size={20} className="text-red-500" />;
      default: return <FileText size={20} className="text-slate-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-[#2a4599] border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div data-testid="admin-materials" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#010822]">Marketing Materials</h2>
          <p className="text-slate-500 text-sm">{materials.length} materials uploaded | Partners can download from their portal</p>
        </div>
        <Button
          data-testid="add-material-btn"
          onClick={() => setShowAdd(true)}
          className="bg-[#2a4599] hover:bg-[#1e3a8a]"
        >
          <Plus size={16} className="mr-2" />
          Upload Material
        </Button>
      </div>

      {/* Materials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((material) => (
          <div key={material.id} className="bg-white border border-slate-200 rounded-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Preview */}
            <div className="h-32 bg-slate-50 flex items-center justify-center border-b border-slate-100">
              {material.file_type === 'image' && material.file_url ? (
                <img src={material.file_url} alt={material.title} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  {getFileIcon(material.file_type)}
                  <div className="text-xs text-slate-400 mt-1 uppercase">{material.file_type}</div>
                </div>
              )}
            </div>

            <div className="p-4">
              <h4 className="font-semibold text-[#010822] mb-1 truncate">{material.title}</h4>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{material.description || 'No description'}</p>
              <div className="text-xs text-slate-400 mb-3">
                {material.created_at ? new Date(material.created_at).toLocaleDateString() : ''}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  data-testid={`share-whatsapp-${material.id}`}
                  onClick={() => { setShowWhatsApp(material); setSelectedPartners([]); }}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  <Send size={14} className="mr-1" />
                  Send to Partners
                </Button>
                {material.file_url && !material.file_url.startsWith('data:') && (
                  <a href={material.file_url} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Download size={14} />
                    </Button>
                  </a>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500 border-red-200 hover:bg-red-50"
                  onClick={() => deleteMaterial(material.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {materials.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400">
            <Upload size={40} className="mx-auto mb-3 text-slate-300" />
            <p>No materials uploaded yet</p>
            <p className="text-sm mt-1">Upload brochures, images, or videos for partners</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-sm w-full max-w-lg p-6 relative">
            <button onClick={() => setShowAdd(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-[#010822] mb-6">Upload Marketing Material</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title *</Label>
                <Input
                  data-testid="material-title"
                  placeholder="e.g., Construction Brochure 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-11 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Input
                  data-testid="material-description"
                  placeholder="Brief description of the material"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-11 mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Upload File *</Label>
                <div className="mt-1 border-2 border-dashed border-slate-200 rounded-sm p-6 text-center hover:border-[#2a4599]/50 transition-colors">
                  <input
                    data-testid="material-file-input"
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx,.pptx,.ppt,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="material-file"
                  />
                  <label htmlFor="material-file" className="cursor-pointer">
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <div className="text-sm text-slate-600">
                      {formData.file_url ? (
                        <span className="text-green-600 font-semibold">File ready ({formData.file_type})</span>
                      ) : (
                        <>Click to upload or drag & drop</>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Images, PDFs, Videos, Documents</div>
                  </label>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Or paste file URL</Label>
                <Input
                  data-testid="material-url"
                  placeholder="https://example.com/brochure.pdf"
                  value={formData.file_url.startsWith('data:') ? '' : formData.file_url}
                  onChange={(e) => setFormData({ ...formData, file_url: e.target.value, file_type: 'pdf' })}
                  className="h-11 mt-1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowAdd(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  data-testid="submit-material-btn"
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-[#F97316] hover:bg-[#ea580c] text-white"
                >
                  {uploading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <>
                      <Upload size={16} className="mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Send Modal */}
      {showWhatsApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" data-testid="whatsapp-send-modal">
          <div className="bg-white rounded-sm w-full max-w-md p-6 relative max-h-[80vh] overflow-y-auto">
            <button onClick={() => { setShowWhatsApp(null); setSelectedPartners([]); }} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <h3 className="text-lg font-bold text-[#010822] mb-1">Send via WhatsApp</h3>
            <p className="text-slate-500 text-sm mb-4">"{showWhatsApp.title}" - Select partners to send to:</p>

            <div className="mb-4">
              <button
                onClick={selectAllPartners}
                className="text-sm text-[#2a4599] hover:underline font-semibold"
              >
                {selectedPartners.length === partners.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {partners.map((partner) => (
                <label
                  key={partner.id}
                  className={`flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selectedPartners.includes(partner.id) ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPartners.includes(partner.id)}
                    onChange={() => togglePartnerSelection(partner.id)}
                    className="accent-green-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{partner.name}</div>
                    <div className="text-xs text-slate-500">{partner.phone}</div>
                  </div>
                </label>
              ))}
              {partners.length === 0 && (
                <div className="text-center text-slate-400 py-6">No active partners</div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={() => { setShowWhatsApp(null); setSelectedPartners([]); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                data-testid="confirm-whatsapp-send"
                onClick={() => sendToWhatsApp(showWhatsApp)}
                disabled={selectedPartners.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Send size={16} className="mr-2" />
                Send to {selectedPartners.length} Partner{selectedPartners.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMaterials;
