import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  Bookmark,
  Flag,
  ArrowLeft,
  Globe,
  Send,
  FileText,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user, profile, t } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('Spam or misleading information');
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    if (profile?.resume_url) {
      setResumeUrl(profile.resume_url);
    }
  }, [profile]);

  useEffect(() => {
    async function loadJob() {
      if (!isSupabaseConfigured || !supabase || !id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('jobs')
        .select('*, companies(*)')
        .eq('id', id)
        .single();

      if (!error && data) {
        setJob(data);
      }

      if (user) {
        const [savedRes, appRes] = await Promise.all([
          supabase
            .from('saved_jobs')
            .select('id')
            .eq('user_id', user.id)
            .eq('job_id', id)
            .maybeSingle(),
          supabase
            .from('applications')
            .select('id')
            .eq('applicant_id', user.id)
            .eq('job_id', id)
            .maybeSingle(),
        ]);
        setIsSaved(Boolean(savedRes.data));
        setAlreadyApplied(Boolean(appRes.data));
      }

      setLoading(false);
    }

    loadJob();
  }, [id, user]);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!supabase) return;

    if (isSaved) {
      setIsSaved(false);
      await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', id);
    } else {
      setIsSaved(true);
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: id });
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!supabase) return;

    setSubmitting(true);
    setFeedback({ type: '', text: '' });

    const { error } = await supabase.from('applications').insert({
      job_id: id,
      applicant_id: user.id,
      cover_letter: coverLetter.trim(),
      resume_url: resumeUrl.trim() || null,
      status: 'pending',
    });

    setSubmitting(false);
    if (error) {
      setFeedback({ type: 'error', text: error.message });
    } else {
      setAlreadyApplied(true);
      setShowApplyForm(false);
      setFeedback({
        type: 'success',
        text: 'Application submitted successfully! Track your status in Applications.',
      });
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!supabase) return;

    await supabase.from('job_reports').insert({
      job_id: id,
      reporter_id: user.id,
      reason: reportReason,
    });
    setReportSent(true);
    setShowReport(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-navy-900 mb-2">Job Listing Not Found</h2>
        <p className="text-sm text-slate-600 mb-6">
          This position may have been closed or removed by the employer.
        </p>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
      </div>
    );
  }

  const company = job.companies || {};
  const companyName = company.company_name || job.company_name || 'Verified Employer';

  const formatSalary = () => {
    const currency = job.salary_currency || 'THB';
    if (job.salary_min && job.salary_max) {
      return `${Number(job.salary_min).toLocaleString()} - ${Number(
        job.salary_max
      ).toLocaleString()} ${currency}`;
    }
    if (job.salary_min) return `From ${Number(job.salary_min).toLocaleString()} ${currency}`;
    return 'Negotiable';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-navy-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('navJobs')}
      </Link>

      {feedback.text && (
        <div
          className={`mb-6 p-4 rounded-xl text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Job Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={companyName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-7 h-7 text-slate-400" />
                )}
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-navy-900">{job.title}</h1>
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-medium text-slate-700 mt-1">
                  <span>{companyName}</span>
                  {company.is_verified && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-slate-600 pb-6 border-b border-slate-100">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <MapPin className="w-4 h-4 text-blue-600" />
                {[job.location, job.country].filter(Boolean).join(', ') || 'Remote'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
                <Clock className="w-4 h-4 text-blue-600" />
                {job.job_type || 'Full-time'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {formatSalary()}
              </span>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-navy-900 mb-2">Job Description</h2>
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>

              {job.requirements && (
                <div>
                  <h2 className="text-base font-bold text-navy-900 mb-2">Requirements</h2>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {job.requirements}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Application Form */}
          {showApplyForm && !alreadyApplied && (
            <form
              onSubmit={handleApplySubmit}
              className="bg-white rounded-2xl border-2 border-blue-200 p-6 sm:p-8 shadow-sm space-y-4"
            >
              <h3 className="text-lg font-bold text-navy-900">Submit Your Application</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Resume / Portfolio Link (Google Drive, LinkedIn, or uploaded URL)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="url"
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Cover Letter / Note to Employer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Briefly introduce your relevant experience and availability..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Actions & Company Info */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            {profile?.role === 'employer' ? (
              <p className="text-xs text-slate-500 text-center py-2">
                Signed in as an Employer account. Switch to a Job Seeker account to apply.
              </p>
            ) : alreadyApplied ? (
              <div className="w-full py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold text-center">
                ✓ Applied to this Job
              </div>
            ) : (
              <button
                type="button"
                onClick={() => (user ? setShowApplyForm(true) : navigate('/login'))}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
              >
                {t('applyNow')}
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              className={`w-full py-2.5 rounded-xl border text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                isSaved
                  ? 'bg-blue-50 border-blue-200 text-blue-600'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              {isSaved ? t('savedJob') : t('saveJob')}
            </button>

            <button
              type="button"
              onClick={() => setShowReport(!showReport)}
              className="w-full py-2 text-xs text-slate-400 hover:text-red-600 inline-flex items-center justify-center gap-1.5"
            >
              <Flag className="w-3.5 h-3.5" />
              {reportSent ? 'Report Submitted' : t('reportJob')}
            </button>

            {showReport && !reportSent && (
              <form onSubmit={handleReportSubmit} className="pt-2 border-t border-slate-100 space-y-2">
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-200 text-xs"
                >
                  <option>Spam or misleading information</option>
                  <option>Suspected scam or fraudulent fee</option>
                  <option>Position already filled / expired</option>
                  <option>Inappropriate content</option>
                </select>
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-red-600 text-white text-xs font-semibold"
                >
                  Submit Report
                </button>
              </form>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-navy-900">About the Company</h3>
            <p className="text-sm font-semibold text-slate-800">{companyName}</p>
            {company.industry && (
              <p className="text-xs text-slate-500">Industry: {company.industry}</p>
            )}
            {company.description && (
              <p className="text-xs text-slate-600 leading-relaxed">{company.description}</p>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline pt-1"
              >
                <Globe className="w-3.5 h-3.5" />
                Visit Company Website
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
