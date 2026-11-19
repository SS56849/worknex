import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Globe,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
  PlusCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function EmployerProfilePage() {
  const { user } = useAuth();

  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user || !supabase) return;

    async function loadCompany() {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setCompanyId(data.id);
        setCompanyName(data.company_name || '');
        setIndustry(data.industry || '');
        setWebsite(data.website || '');
        setLocation(data.location || '');
        setCountry(data.country || 'Thailand');
        setDescription(data.description || '');
        setLogoUrl(data.logo_url || '');
      }
      setLoading(false);
    }

    loadCompany();
  }, [user]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user || !supabase) return;

    setUploading(true);
    setFeedback({ type: '', text: '' });

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/logo_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setFeedback({
        type: 'error',
        text: `Logo upload failed: ${uploadError.message}. You can paste an image URL instead.`,
      });
      return;
    }

    const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(filePath);
    if (urlData?.publicUrl) {
      setLogoUrl(urlData.publicUrl);
      setFeedback({ type: 'success', text: 'Logo uploaded! Click Save Company Profile to save.' });
    }
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    setFeedback({ type: '', text: '' });

    const payload = {
      owner_id: user.id,
      company_name: companyName.trim(),
      industry: industry.trim(),
      website: website.trim() || null,
      location: location.trim(),
      country: country.trim(),
      description: description.trim(),
      logo_url: logoUrl.trim() || null,
    };

    let result;
    if (companyId) {
      result = await supabase.from('companies').update(payload).eq('id', companyId).select().single();
    } else {
      result = await supabase.from('companies').insert(payload).select().single();
    }

    setSaving(false);
    if (result.error) {
      setFeedback({ type: 'error', text: result.error.message });
    } else {
      if (result.data?.id) setCompanyId(result.data.id);
      setFeedback({
        type: 'success',
        text: 'Company profile saved! You can now post job openings.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Company Profile</h1>
          <p className="text-sm text-slate-600 mt-1">
            Set up your organization details displayed alongside every job opening.
          </p>
        </div>

        {companyId && (
          <Link
            to="/post-job"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Post a Job
          </Link>
        )}
      </div>

      {feedback.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Company Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
          </div>

          <div className="space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading Logo...' : 'Upload Company Logo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400">PNG, JPG, or WebP recommended.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Company Name *
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., WORKNEX Co., Ltd."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g., Software & Technology"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Headquarters City
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangkok"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Country *
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Thailand"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Company Website
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <Globe className="w-4 h-4 text-slate-400" />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.com"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            About the Company
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your company mission, culture, and products or services..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
