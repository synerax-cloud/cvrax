'use client';

import { useState, useEffect } from 'react';
import { FaSave, FaSpinner } from 'react-icons/fa';

export default function PersonalInfoForm({ profile, onSave, onUpdate }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    portfolio: '',
    headline: '',
    summary: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      console.log('PersonalInfoForm: Profile updated', profile);
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        location: profile.location || '',
        website: profile.website || '',
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSave();
        onUpdate();
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="label">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input"
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="form-group md:col-span-2">
            <label className="label">Professional Headline</label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              className="input"
              placeholder="Senior Software Engineer | Full Stack Developer"
            />
            <p className="text-xs text-gray-500 mt-1">
              A brief title that describes your professional role
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Professional Summary</h2>
        
        <div className="form-group">
          <label className="label">About You</label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            className="input"
            rows="6"
            placeholder="Write a brief summary about your professional background, skills, and career goals..."
          />
          <p className="text-xs text-gray-500 mt-1">
            2-3 sentences highlighting your expertise and value proposition
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-6">Online Presence</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="label">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="input"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-group">
            <label className="label">LinkedIn</label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="input"
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>

          <div className="form-group">
            <label className="label">GitHub</label>
            <input
              type="url"
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="input"
              placeholder="https://github.com/yourusername"
            />
          </div>

          <div className="form-group">
            <label className="label">Portfolio</label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              className="input"
              placeholder="https://portfolio.yourname.com"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary flex items-center space-x-2" disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
