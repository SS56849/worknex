import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function JobSeekerProfilePage() {
  const { user, profile, refreshProfile } = useAuth();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setResumeUrl(profile.resume_url || '');
      if (Array.isArray(profile.skills)) {
        setSkillsText(profile.skills.join(', '));
      } else {
        setSkillsText(profile.skills || '');
      }
    }
  }, [profile]);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user || !supabase) return;

    setUploading(true);
    setFeedback({ type: '', text: '' });

    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/resume_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploading(false);
      setFeedback({
        type: 'error',
        text: `Upload failed: ${uploadError.message}. You can paste a Google Drive or portfolio link below instead.`,
      });
      return;
    }

    const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
    if (urlData?.publicUrl) {
      setResumeUrl(urlData.publicUrl);
      setFeedback({
        type: 'success',
        text: 'Resume uploaded! Click Save Profile to apply changes.',
      });
    }
    setUploading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setSaving(true);
    setFeedback({ type: '', text: '' });

    const parsedSkills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const basePayload = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      location: location.trim(),
      bio: bio.trim(),
      resume_url: resumeUrl.trim() || null,
    };

    let { error } = await supabase
      .from('profiles')
      .update({
        ...basePayload,
        skills: Array.isArray(profile?.skills) || profile?.skills == null ? parsedSkills : skillsText.trim(),
      })
      .eq('id', user.id);

    if (error && error.code === '22P02') {
      const retry = await supabase
        .from('profiles')
        .update({
          ...basePayload,
          skills: skillsText.trim(),
        })
        .eq('id', user.id);
      error = retry.error;
    }

    setSaving(false);
    if (error) {
      setFeedback({ type: 'error', text: error.message });
    } else {
      await refreshProfile();
      setFeedback({ type: 'success', text: 'Profile updated successfully!' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">My Candidate Profile</h1>
        <p className="text-sm text-slate-600 mt-1">
          Keep your contact details, skills, and resume up to date for faster job applications.
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Email
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-transparent text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <Phone className="w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+66 8X XXX XXXX"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              City & Country
            </label>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Bangkok, Thailand"
                className="w-full bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Key Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="React, Project Management, Digital Marketing, English"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Professional Summary / Bio
          </label>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Highlight your background, experience, and the roles you are looking for..."
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-700">
              Resume / CV (PDF Upload or External URL)
            </label>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              {uploading ? 'Uploading...' : 'Upload PDF / File'}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/... or uploaded resume link"
              className="w-full bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
