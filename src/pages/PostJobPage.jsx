import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  PlusCircle,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { JOB_CATEGORIES } from '../lib/i18n';
import { useAuth } from '../context/AuthContext';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
const CURRENCIES = ['THB', 'USD', 'EUR', 'SGD', 'JPY'];

export default function PostJobPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(true);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(JOB_CATEGORIES[0]);
  const [jobType, setJobType] = useState('Full-time');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('THB');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!user || !supabase) return;

    supabase
      .from('companies')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setCompany(data || null);
        setLoadingCompany(false);
      });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !supabase || !company) return;

    setSubmitting(true);
    setErrorMsg('');

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        employer_id: user.id,
        company_id: company.id,
        title: title.trim(),
        category,
        job_type: jobType,
        location: location.trim(),
        country: country.trim(),
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
        salary_currency: salaryCurrency,
        description: description.trim(),
        requirements: requirements.trim() || null,
        status: 'active',
        is_featured: false,
      })
      .select()
      .single();

    setSubmitting(false);
    if (error) {
      setErrorMsg(error.message);
    } else if (data?.id) {
      navigate(`/jobs/${data.id}`);
    } else {
      navigate('/employer/jobs');
    }
  };

  if (loadingCompany) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <Building2 className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h2 className="text-xl font-extrabold text-navy-900 mb-2">
            Complete Your Company Profile First
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Before publishing a job listing, please add your company name and basic details so candidates know who is hiring.
          </p>
          <Link
            to="/employer/profile"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            Set Up Company Profile →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">Post a New Job</h1>
        <p className="text-sm text-slate-600 mt-1">
          Publishing as <span className="font-semibold text-navy-900">{company.company_name}</span> • Standard listings are free.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Title *
          </label>
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Developer / Marketing Manager"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            >
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Employment Type *
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            >
              {JOB_TYPES.map((tp) => (
                <option key={tp} value={tp}>
                  {tp}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City / Work Location *
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangkok / Hybrid / Remote"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Monthly Salary Range (Optional)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="number"
                min="0"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                placeholder="Min"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>

            <input
              type="number"
              min="0"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              placeholder="Max"
              className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            />

            <select
              value={salaryCurrency}
              onChange={(e) => setSalaryCurrency(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none"
            >
              {CURRENCIES.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Job Description & Responsibilities *
          </label>
          <textarea
            required
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe daily responsibilities, team structure, and benefits..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Qualifications & Requirements
          </label>
          <textarea
            rows={4}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="List required experience, skills, education, or language proficiency..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            <PlusCircle className="w-4 h-4" />
            {submitting ? 'Publishing...' : 'Publish Job Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}
