import { useState, useEffect } from 'react';
import { usePartnerAuth } from '@/context/PartnerAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Image, Video, File } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config/constants';

const PartnerMaterials = () => {
  const { token } = usePartnerAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await axios.get(`${API}/partner/materials`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMaterials(response.data);
      } catch (error) {
        console.error('Failed to fetch materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [token]);

  const getFileIcon = (type) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'pdf': return FileText;
      default: return File;
    }
  };

  // Placeholder materials if none exist
  const placeholderMaterials = [
    {
      id: '1',
      title: 'Alpha Groups Brochure',
      description: 'Company overview and services brochure',
      file_type: 'pdf',
      file_url: '#'
    },
    {
      id: '2',
      title: 'Package Comparison Chart',
      description: 'Detailed comparison of all construction packages',
      file_type: 'pdf',
      file_url: '#'
    },
    {
      id: '3',
      title: 'Project Portfolio',
      description: 'Showcase of completed projects',
      file_type: 'image',
      file_url: '#'
    }
  ];

  const displayMaterials = materials.length > 0 ? materials : placeholderMaterials;

  return (
    <div data-testid="partner-materials" className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#010822]">Marketing Materials</h1>
        <p className="text-slate-500 mt-1">Download resources to share with potential clients</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#2a4599] border-t-transparent"></div>
        </div>
      ) : displayMaterials.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-sm border border-slate-200">
          <FileText className="mx-auto text-slate-300 mb-4" size={48} />
          <h3 className="text-xl font-bold text-slate-600 mb-2">No Materials Available</h3>
          <p className="text-slate-500">Check back soon for marketing resources</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayMaterials.map((material) => {
            const FileIcon = getFileIcon(material.file_type);
            
            return (
              <Card key={material.id} className="border border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#2a4599]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileIcon className="text-[#2a4599]" size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#010822] truncate">{material.title}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{material.description}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => material.file_url !== '#' && window.open(material.file_url, '_blank')}
                    className="w-full mt-4 bg-[#2a4599] hover:bg-[#1e3a8a] text-white"
                    disabled={material.file_url === '#'}
                  >
                    <Download className="mr-2" size={16} />
                    {material.file_url === '#' ? 'Coming Soon' : 'Download'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-slate-50 p-6 rounded-sm">
        <h3 className="font-bold text-[#010822] mb-3">How to Use These Materials</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Share brochures with potential clients interested in construction</li>
          <li>• Use package comparison charts to explain our offerings</li>
          <li>• Show project portfolio to build trust and credibility</li>
          <li>• Always include your referral link when sharing</li>
        </ul>
      </div>
    </div>
  );
};

export default PartnerMaterials;
