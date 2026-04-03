import { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import axios from 'axios';
import { API } from '@/config/constants';
import ReactMarkdown from 'react-markdown';

const ReferralTermsPage = () => {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2a4599] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div data-testid="referral-terms-page" className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-[#010822] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-6">
            <FileText size={18} className="text-[#F97316]" />
            <span className="text-white text-sm font-semibold">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Referral Program Terms & Conditions
          </h1>
          <p className="text-slate-300">
            Last updated: {terms?.updated_at ? new Date(terms.updated_at).toLocaleDateString('en-IN') : 'N/A'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Key Highlights */}
          <div className="bg-white p-8 rounded-sm border border-slate-200 mb-8">
            <h2 className="text-xl font-bold text-[#010822] mb-6">Program Highlights</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-50 rounded">
                <div className="text-3xl font-bold text-[#2a4599] mb-2">
                  {terms?.commission_percent || 2}%
                </div>
                <div className="text-sm text-slate-600">Commission Rate</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded">
                <div className="text-3xl font-bold text-[#2a4599] mb-2">
                  {terms?.validity_days || 90} Days
                </div>
                <div className="text-sm text-slate-600">Referral Validity</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded">
                <div className="text-3xl font-bold text-[#2a4599] mb-2">
                  {terms?.payment_timeline_days || 30} Days
                </div>
                <div className="text-sm text-slate-600">Payment Timeline</div>
              </div>
            </div>
          </div>

          {/* Full Terms */}
          <div className="bg-white p-8 md:p-12 rounded-sm border border-slate-200">
            <div className="prose prose-slate max-w-none">
              {terms?.terms_content ? (
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {terms.terms_content.split('\n').map((line, idx) => (
                    <p key={idx} className={`${line.startsWith('**') ? 'font-bold text-[#010822] text-lg mt-6 mb-4' : 'mb-3'}`}>
                      {line.replace(/\*\*/g, '')}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">Terms not available</p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="text-center mt-8 text-slate-600">
            <p>
              For questions about the referral program, contact us at{' '}
              <a href="mailto:alphagroups1997@gmail.com" className="text-[#2a4599] hover:underline">
                alphagroups1997@gmail.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReferralTermsPage;
