import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { JOB_CATEGORIES } from '../lib/i18n';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import AdSlot from '../components/AdSlot';

export default function HomePage() {
  const { user, t } = useAuth();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [country, setCountry] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadHomeData() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      const [featuredRes, recentRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('*, companies(company_name, logo_url, is_verified)')
          .eq('status', 'active')
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(4),
        supabase
          .from('jobs')
          .select('*, companies(company_name, logo_url, is_verified)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);

      if (!active) return;
      if (!featuredRes.error && featuredRes.data) setFeaturedJobs(featuredRes.data);
      if (!recentRes.error && recentRes.data) setRecentJobs(recentRes.data);

      if (user) {
        const { data: savedData } = await supabase
          .from('saved_jobs')
          .select('job_id')
          .eq('user_id', user.id);
        if (active && savedData) {
          setSavedIds(new Set(savedData.map((item) => item.job_id)));
        }
      }

      setLoading(false);
    }

    loadHomeData();
    return () => {
      active = false;
    };
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (country.trim()) params.set('country', country.trim());
    navigate(`/jobs?${params.toString()}`);
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

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-navy-900 text-white py-16 sm:py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800 border border-navy-700 text-xs sm:text-sm text-blue-300 font-medium mb-6">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{t('freePostingBanner')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            {t('heroTitle')}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            {t('heroSubtitle')}
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="bg-white p-2.5 rounded-2xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-2.5"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('searchKeywordPlaceholder')}
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <div className="md:w-64 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t('searchCountryPlaceholder')}
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm shrink-0"
            >
              {t('searchBtn')}
            </button>
          </form>

          {/* Popular Categories */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {JOB_CATEGORIES.slice(0, 6).map((cat) => (
              <Link
                key={cat}
                to={`/jobs?category=${encodeURIComponent(cat)}`}
                className="px-3 py-1 rounded-full bg-navy-800/80 hover:bg-navy-700 border border-navy-700 text-xs text-slate-300 hover:text-white transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <AdSlot variant="horizontal" />

        {/* Featured Jobs */}
        {featuredJobs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                {t('featuredJobs')}
              </h2>
              <Link
                to="/jobs"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                {t('viewAllJobs')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedIds.has(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          </section>
        )}

        {/* Recent Jobs */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              {t('recentJobs')}
            </h2>
            <Link
              to="/jobs"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              {t('viewAllJobs')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-44 rounded-xl bg-white border border-slate-200 animate-pulse"
                />
              ))}
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-5">
                {t('noJobsYet')}
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                {t('navRegister')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isSaved={savedIds.has(job.id)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Employer CTA Card */}
        <section className="rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              For Employers & Recruiters
            </span>
            <h3 className="text-2xl font-bold mb-2">Post Your Open Roles Free Today</h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Create your company profile, publish verified job openings, and manage candidate applications in one streamlined dashboard.
            </p>
          </div>
          <Link
            to={user ? '/post-job' : '/register'}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shrink-0 shadow-md"
          >
            {t('navPostJob')} →
          </Link>
        </section>
      </div>
    </div>
  );
}
