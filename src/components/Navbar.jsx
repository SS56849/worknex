import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Globe,
  Menu,
  X,
  User,
  LogOut,
  PlusCircle,
  FileText,
  Building2,
  LayoutDashboard,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, lang, changeLanguage, t, signOut, isConfigured } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isEmployer = profile?.role === 'employer';

  const handleLogout = async () => {
    await signOut();
    setMobileOpen(false);
    navigate('/');
  };

  const toggleLang = () => {
    changeLanguage(lang === 'en' ? 'th' : 'en');
  };

  const isActive = (path) =>
    location.pathname === path
      ? 'text-blue-600 font-semibold'
      : 'text-slate-600 hover:text-navy-900 font-medium';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {!isConfigured && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-800 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            Supabase environment variables missing. Add <strong>VITE_SUPABASE_URL</strong> and{' '}
            <strong>VITE_SUPABASE_ANON_KEY</strong> in Netlify settings.
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-9 h-9 rounded-lg bg-navy-900 text-white flex items-center justify-center shadow-sm group-hover:bg-blue-600 transition-colors">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-navy-900">
                WORK<span className="text-blue-600">NEX</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-slate-400 -mt-1">
                {t('brandTagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/jobs" className={isActive('/jobs')}>
              {t('navJobs')}
            </Link>
            <Link to="/pricing" className={isActive('/pricing')}>
              {t('navPricing')}
            </Link>

            {user && isEmployer && (
              <>
                <Link to="/employer/jobs" className={isActive('/employer/jobs')}>
                  {t('navManageJobs')}
                </Link>
                <Link to="/employer/profile" className={isActive('/employer/profile')}>
                  {t('navCompany')}
                </Link>
              </>
            )}

            {user && !isEmployer && (
              <>
                <Link to="/applications" className={isActive('/applications')}>
                  {t('navApplications')}
                </Link>
                <Link to="/profile" className={isActive('/profile')}>
                  {t('navProfile')}
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-navy-900"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                >
                  {t('navRegister')}
                </Link>
              </>
            ) : (
              <>
                {isEmployer && (
                  <Link
                    to="/post-job"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {t('navPostJob')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t('navLogout')}
                </button>
              </>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleLang}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            to="/jobs"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Briefcase className="w-4 h-4 text-blue-600" />
            {t('navJobs')}
          </Link>

          <Link
            to="/pricing"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            {t('navPricing')}
          </Link>

          {user && isEmployer && (
            <>
              <Link
                to="/post-job"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-blue-600 bg-blue-50"
              >
                <PlusCircle className="w-4 h-4" />
                {t('navPostJob')}
              </Link>
              <Link
                to="/employer/jobs"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                {t('navManageJobs')}
              </Link>
              <Link
                to="/employer/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Building2 className="w-4 h-4 text-slate-500" />
                {t('navCompany')}
              </Link>
            </>
          )}

          {user && !isEmployer && (
            <>
              <Link
                to="/applications"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                {t('navApplications')}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4 text-slate-500" />
                {t('navProfile')}
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-navy-900 text-white text-sm font-semibold"
                >
                  {t('navRegister')}
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-red-200 text-sm font-semibold text-red-600 bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                {t('navLogout')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
