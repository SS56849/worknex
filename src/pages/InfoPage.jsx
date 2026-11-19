import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ShieldCheck, Globe } from 'lucide-react';

export default function InfoPage({ page = 'about' }) {
  if (page === 'pricing') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-extrabold text-navy-900 mb-3">
            Transparent Hiring Plans
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Start posting open roles completely free, or boost visibility with Featured placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col">
            <h2 className="text-lg font-bold text-navy-900">Standard Job Listing</h2>
            <div className="my-4">
              <span className="text-3xl font-extrabold text-navy-900">Free</span>
              <span className="text-sm text-slate-500"> / 30 days</span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Ideal for startups, SMEs, and growing teams hiring across Thailand and global markets.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Unlimited standard job postings
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Company profile & verified badge eligibility
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                Built-in applicant tracking dashboard
              </li>
            </ul>
            <Link
              to="/post-job"
              className="w-full py-3 rounded-xl bg-navy-900 hover:bg-blue-600 text-white text-center text-sm font-semibold transition-colors"
            >
              Post a Free Job
            </Link>
          </div>

          <div className="bg-white rounded-2xl border-2 border-blue-600 p-8 flex flex-col shadow-md relative">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold w-fit mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Maximum Visibility
            </span>
            <h2 className="text-lg font-bold text-navy-900">Featured Spotlight</h2>
            <div className="my-4">
              <span className="text-3xl font-extrabold text-navy-900">990 THB</span>
              <span className="text-sm text-slate-500"> / 30 days</span>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Pinned to the homepage Featured Opportunities section and top of search results.
            </p>
            <ul className="space-y-3 text-sm text-slate-700 mb-8 flex-1">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Everything in Standard Job Listing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Homepage Featured section placement
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600" />
                Highlighted Featured badge on job cards
              </li>
            </ul>
            <Link
              to="/post-job"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-center text-sm font-semibold transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'privacy') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
          <ShieldCheck className="w-5 h-5" />
          <span>Data Protection & PDPA Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-navy-900">Privacy Policy</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            WORKNEX respects your privacy and protects personal data in accordance with Thailand&apos;s Personal Data Protection Act (PDPA) and international data protection standards.
          </p>
          <h2 className="text-base font-bold text-navy-900">1. Information We Collect</h2>
          <p>
            We collect account details (name, email, role), professional profile information (skills, resume links), and employer company details strictly to facilitate job matching and recruitment.
          </p>
          <h2 className="text-base font-bold text-navy-900">2. How Information Is Shared</h2>
          <p>
            Your job seeker application details and resume link are shared exclusively with the specific employer of the job listing you choose to apply for.
          </p>
        </div>
      </div>
    );
  }

  if (page === 'terms') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-navy-900">Terms of Service</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-sm text-slate-700 leading-relaxed">
          <p>
            By accessing or using WORKNEX, you agree to comply with these Terms of Service.
          </p>
          <h2 className="text-base font-bold text-navy-900">1. Authentic Job Listings</h2>
          <p>
            Employers must publish accurate, lawful job opportunities and are strictly prohibited from charging job seekers application or placement fees.
          </p>
          <h2 className="text-base font-bold text-navy-900">2. Account Responsibility</h2>
          <p>
            Users are responsible for maintaining the accuracy of their profile details and safeguarding their login credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold">
        <Globe className="w-5 h-5" />
        <span>Global Job Marketplace</span>
      </div>
      <h1 className="text-3xl font-extrabold text-navy-900">About WORKNEX</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          WORKNEX is a modern two-sided job marketplace built to connect skilled professionals in Thailand and worldwide with transparent, verified employers.
        </p>
        <p>
          Whether you are a growing business hiring your next key team member or a professional searching for remote and on-site roles, WORKNEX streamlines discovery, application tracking, and direct hiring.
        </p>
      </div>
    </div>
  );
}
