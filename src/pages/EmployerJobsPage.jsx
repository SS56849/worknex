import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  PlusCircle,
  Users,
  MapPin,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function EmployerJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [expandedJobId, setExpandedJobId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadEmployerJobs = async () => {
    if (!user || !supabase) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('jobs')
      .select('*, applications(*, profiles(full_name, email, phone, location, resume_url))')
      .eq('employer_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEmployerJobs();
  }, [user]);

  const toggleJobStatus = async (job) => {
    if (!supabase) return;
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    setJobs((prev) =>
      prev.map((item) => (item.id === job.id ? { ...item, status: nextStatus } : item))
    );
    await supabase.from('jobs').update({ status: nextStatus }).eq('id', job.id);
  };

  const deleteJob = async (jobId) => {
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    setJobs((prev) => prev.filter((item) => item.id !== jobId));
    await supabase.from('jobs').delete().eq('id', jobId);
  };

  const updateApplicationStatus = async (jobId, appId, newStatus) => {
    if (!supabase) return;
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          applications: (job.applications || []).map((app) =>
            app.id === appId ? { ...app, status: newStatus } : app
          ),
        };
      })
    );
    await supabase.from('applications').update({ status: newStatus }).eq('id', appId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Manage Job Listings</h1>
          <p className="text-sm text-slate-600 mt-1">
            Review incoming applicants, update hiring statuses, or close filled positions.
          </p>
        </div>

        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900 mb-1">No Jobs Posted Yet</h3>
          <p className="text-sm text-slate-500 mb-5">
            Publish your first job opening for free to start receiving applications.
          </p>
          <Link
            to="/post-job"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-blue-600"
          >
            <PlusCircle className="w-4 h-4" />
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const apps = job.applications || [];
            const isExpanded = expandedJobId === job.id;

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="text-lg font-bold text-navy-900 hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {job.status === 'active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {job.status === 'active' ? 'Active' : 'Closed'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {[job.location, job.country].filter(Boolean).join(', ') || 'Remote'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.job_type}
                      </span>
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold"
                    >
                      <Users className="w-4 h-4" />
                      Applicants ({apps.length})
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleJobStatus(job)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {job.status === 'active' ? 'Close Job' : 'Reopen'}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteJob(job.id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200"
                      title="Delete job"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Applicants Drawer */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-5 sm:p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                      Candidate Applications ({apps.length})
                    </h3>

                    {apps.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No candidates have applied to this position yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {apps.map((app) => {
                          const candidate = app.profiles || {};
                          const resume = app.resume_url || candidate.resume_url;

                          return (
                            <div
                              key={app.id}
                              className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-bold text-navy-900">
                                    {candidate.full_name || 'Applicant'}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    {candidate.email}
                                    {candidate.phone ? ` • ${candidate.phone}` : ''}
                                    {candidate.location ? ` • ${candidate.location}` : ''}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {resume && (
                                    <a
                                      href={resume}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                                      Resume
                                    </a>
                                  )}

                                  <select
                                    value={app.status || 'pending'}
                                    onChange={(e) =>
                                      updateApplicationStatus(job.id, app.id, e.target.value)
                                    }
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="shortlisted">Shortlisted</option>
                                    <option value="interview">Interview</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                  </select>
                                </div>
                              </div>

                              {app.cover_letter && (
                                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
                                  {app.cover_letter}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
