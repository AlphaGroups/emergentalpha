import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { API } from '@/config/constants';

const AdminTerms = () => {
  const { token } = useAuth();
  const [terms, setTerms] = useState({
    id: 'referral_terms',
    commission_percent: 2,
    validity_days: 90,
    payment_timeline_days: 30,
    terms_content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(`${API}/referral-terms`);
        setTerms(response.data);
      } catch (error) {
        console.error('Failed to fetch terms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTerms();
  }, []);

  const saveTerms = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/admin/referral-terms`, terms, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Terms updated successfully');
    } catch (error) {
      toast.error('Failed to update terms');
    } finally {
      setSaving(false);
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
    <div data-testid="admin-terms" className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#010822]">Referral Terms & Conditions</h1>
          <p className="text-slate-500 mt-1">Configure referral program settings</p>
        </div>
        <Button 
          onClick={saveTerms} 
          disabled={saving}
          className="bg-[#F97316] hover:bg-[#ea580c]"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
          ) : (
            <Save className="mr-2" size={16} />
          )}
          Save Changes
        </Button>
      </div>

      {/* Key Settings */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Commission Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.5"
                value={terms.commission_percent}
                onChange={(e) => setTerms({ ...terms, commission_percent: parseFloat(e.target.value) })}
                className="w-24 h-12 text-xl font-bold"
              />
              <span className="text-xl font-bold text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Percentage of project value paid to partners
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Referral Validity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={terms.validity_days}
                onChange={(e) => setTerms({ ...terms, validity_days: parseInt(e.target.value) })}
                className="w-24 h-12 text-xl font-bold"
              />
              <span className="text-xl font-bold text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Days before a referral expires
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Payment Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={terms.payment_timeline_days}
                onChange={(e) => setTerms({ ...terms, payment_timeline_days: parseInt(e.target.value) })}
                className="w-24 h-12 text-xl font-bold"
              />
              <span className="text-xl font-bold text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Days to process partner payments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Terms Content */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText size={20} />
            Terms & Conditions Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={terms.terms_content}
            onChange={(e) => setTerms({ ...terms, terms_content: e.target.value })}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Enter the full terms and conditions text..."
          />
          <p className="text-xs text-slate-500 mt-2">
            Use **text** for bold headings. This content is displayed on the public referral terms page.
          </p>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-6 rounded whitespace-pre-wrap text-sm">
            {terms.terms_content.split('\n').map((line, idx) => (
              <p key={idx} className={`${line.startsWith('**') ? 'font-bold text-[#010822] mt-4' : 'text-slate-600'} mb-2`}>
                {line.replace(/\*\*/g, '')}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTerms;
