import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  Building2,
  MapPin,
  Clock,
  Bookmark,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  shortlisted: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  interview: 'bg-purple-50 text-purple-700 border-purple-200',
  hired: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function MyApplicationsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('applied');
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !supabase) return;

    async function loadData() {
      setLoading(true);
      const [appsRes, savedRes] = await Promise.all([
        supabase
          .from('applications')
          .select('*, jobs(*, companies(company_name, logo_url))')
          .eq('applicant_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('saved_jobs')
          .select('*, jobs(*, companies(company_name, logo_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (!appsRes.error && appsRes.data) setApplications(appsRes.data);
      if (!savedRes.error && savedRes.data) setSavedJobs(savedRes.data);
      setLoading(false);
    }

    loadData();
  }, [user]);

  const removeSavedJob = async (savedId) => {
    if (!supabase) return;
    setSavedJobs((prev) => prev.filter((item) => item.id !== savedId));
    await supabase.from('saved_jobs').delete().eq('id', savedId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">My Job Activity</h1>
        <p className="text-sm text-slate-600 mt-1">
          Track submitted applications and review your bookmarked job listings.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setTab('applied')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'applied'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-navy-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          Applied Jobs ({applications.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('saved')}
          className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
            tab === 'saved'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-navy-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : tab === 'applied' ? (
        applications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-navy-900 mb-1">No Applications Yet</h3>
            <p className="text-sm text-slate-500 mb-5">
              Start exploring open opportunities and submit your first application.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-blue-600"
            >
              Browse Open Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const job = app.jobs || {};
              const companyName = job.companies?.company_name || job.company_name || 'Employer';
              const badgeClass =
                STATUS_STYLES[app.status?.toLowerCase()] ||
                'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${app.job_id}`}
                        className="text-base font-bold text-navy-900 hover:text-blue-600"
                      >
                        {job.title || 'Job Listing'}
                      </Link>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${badgeClass}`}
                      >
                        {app.status || 'pending'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {companyName}
                      </span>
                      {job.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/jobs/${app.job_id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shrink-0"
                  >
                    View Job
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )
      ) : savedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900 mb-1">No Saved Jobs</h3>
          <p className="text-sm text-slate-500">
            Bookmark positions while browsing to review and apply later.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedJobs.map((item) => {
            const job = item.jobs || {};
            const companyName = job.companies?.company_name || job.company_name || 'Employer';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <Link
                    to={`/jobs/${item.job_id}`}
                    className="text-base font-bold text-navy-900 hover:text-blue-600"
                  >
                    {job.title || 'Job Listing'}
                  </Link>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    {companyName} {job.location ? `• ${job.location}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/jobs/${item.job_id}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Apply Now
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeSavedJob(item.id)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200"
                    title="Remove saved job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
