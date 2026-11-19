import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Filter, X, Briefcase } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JOB_CATEGORIES } from '../lib/i18n';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import AdSlot from '../components/AdSlot';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];

export default function JobSearchPage() {
  const { user, t } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [jobType, setJobType] = useState(searchParams.get('type') || '');

  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('*, companies(company_name, logo_url, is_verified)')
      .eq('status', 'active')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    const q = searchParams.get('q');
    const c = searchParams.get('country');
    const cat = searchParams.get('category');
    const tp = searchParams.get('type');

    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }
    if (c) {
      query = query.or(`country.ilike.%${c}%,location.ilike.%${c}%`);
    }
    if (cat) {
      query = query.eq('category', cat);
    }
    if (tp) {
      query = query.eq('job_type', tp);
    }

    const { data, error } = await query;
    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    setKeyword(searchParams.get('q') || '');
    setCountry(searchParams.get('country') || '');
    setCategory(searchParams.get('category') || '');
    setJobType(searchParams.get('type') || '');
    fetchJobs();
  }, [searchParams]);

  useEffect(() => {
    if (!user || !supabase) return;
    supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setSavedIds(new Set(data.map((row) => row.job_id)));
      });
  }, [user]);

  const applyFilters = (e) => {
    e.preventDefault();
    const next = new URLSearchParams();
    if (keyword.trim()) next.set('q', keyword.trim());
    if (country.trim()) next.set('country', country.trim());
    if (category) next.set('category', category);
    if (jobType) next.set('type', jobType);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setKeyword('');
    setCountry('');
    setCategory('');
    setJobType('');
    setSearchParams({});
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!supabase) return;

    const next = new Set(savedIds);
    if (next.has(jobId)) {
      next.delete(jobId);
      setSavedIds(next);
      await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId);
    } else {
      next.add(jobId);
      setSavedIds(next);
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: jobId });
    }
  };

  const hasFilters = Boolean(
    searchParams.get('q') ||
      searchParams.get('country') ||
      searchParams.get('category') ||
      searchParams.get('type')
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">{t('navJobs')}</h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore verified opportunities across Thailand and international companies.
        </p>
      </div>

      {/* Filter Bar */}
      <form
        onSubmit={applyFilters}
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8 space-y-3"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t('searchKeywordPlaceholder')}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder={t('searchCountryPlaceholder')}
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none"
          >
            <option value="">All Categories</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 focus:outline-none"
          >
            <option value="">All Job Types</option>
            {JOB_TYPES.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>{loading ? 'Searching...' : `${jobs.length} position(s) found`}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-navy-900 hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              {t('searchBtn')}
            </button>
          </div>
        </div>
      </form>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 rounded-xl bg-white border border-slate-200 animate-pulse"
              />
            ))
          ) : jobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-navy-900 mb-1">No matching jobs found</h3>
              <p className="text-sm text-slate-500 mb-4">
                Try adjusting your search keywords, country, or category filters.
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSaved={savedIds.has(job.id)}
                onToggleSave={handleToggleSave}
              />
            ))
          )}
        </div>

        <aside className="space-y-4">
          <AdSlot variant="sidebar" />
        </aside>
      </div>
    </div>
  );
}
