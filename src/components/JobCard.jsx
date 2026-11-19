import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Bookmark,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function JobCard({ job, isSaved = false, onToggleSave }) {
  const { t } = useAuth();

  const companyName = job.companies?.company_name || job.company_name || 'Verified Employer';
  const isVerified = Boolean(job.companies?.is_verified);

  const formatSalary = () => {
    const currency = job.salary_currency || 'THB';
    if (job.salary_min && job.salary_max) {
      return `${Number(job.salary_min).toLocaleString()} - ${Number(
        job.salary_max
      ).toLocaleString()} ${currency}`;
    }
    if (job.salary_min) {
      return `From ${Number(job.salary_min).toLocaleString()} ${currency}`;
    }
    return 'Negotiable';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
        job.is_featured
          ? 'border-blue-300 ring-1 ring-blue-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
            {job.companies?.logo_url ? (
              <img
                src={job.companies.logo_url}
                alt={companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {job.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
              {job.category && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
                  {job.category}
                </span>
              )}
            </div>

            <Link
              to={`/jobs/${job.id}`}
              className="block text-base sm:text-lg font-bold text-navy-900 hover:text-blue-600 transition-colors truncate"
            >
              {job.title}
            </Link>

            <div className="flex items-center gap-1.5 text-sm text-slate-600 mt-0.5">
              <span className="font-medium truncate">{companyName}</span>
              {isVerified && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
            </div>
          </div>
        </div>

        {onToggleSave && (
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            className={`p-2 rounded-lg border transition-colors shrink-0 ${
              isSaved
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
            title={isSaved ? t('savedJob') : t('saveJob')}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-4 h-4 text-slate-400" />
          {[job.location, job.country].filter(Boolean).join(', ') || 'Remote'}
        </span>

        <span className="inline-flex items-center gap-1">
          <Clock className="w-4 h-4 text-slate-400" />
          {job.job_type || 'Full-time'}
        </span>

        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
          <DollarSign className="w-4 h-4 text-emerald-600" />
          {formatSalary()}
        </span>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">{formatDate(job.created_at)}</span>
        <Link
          to={`/jobs/${job.id}`}
          className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          {t('applyNow')} →
        </Link>
      </div>
    </div>
  );
}
