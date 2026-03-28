'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner } from 'react-icons/fa';

export default function EducationModal({ education, profileId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    institution: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (education) {
      setFormData({
        institution: education.institution || '',
        degree: education.degree || '',
        field: education.field || '',
        location: education.location || '',
        startDate: education.startDate ? new Date(education.startDate).toISOString().split('T')[0] : '',
        endDate: education.endDate ? new Date(education.endDate).toISOString().split('T')[0] : '',
        current: education.current || false,
        gpa: education.gpa || '',
        description: education.description || '',
      });
    }
  }, [education]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { ...formData, profileId, order: education?.order || 0 };
      const url = education ? `/api/profile/education/${education.id}` : '/api/profile/education';
      const res = await fetch(url, {
        method: education ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) onSave();
    } catch (error) {
      console.error('Error saving education:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{education ? 'Edit Education' : 'Add Education'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group md:col-span-2">
              <label className="label">Institution *</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="input"
                required
                placeholder="Stanford University"
              />
            </div>

            <div className="form-group">
              <label className="label">Degree *</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                className="input"
                required
                placeholder="Bachelor of Science"
              />
            </div>

            <div className="form-group">
              <label className="label">Field of Study</label>
              <input
                type="text"
                name="field"
                value={formData.field}
                onChange={handleChange}
                className="input"
                placeholder="Computer Science"
              />
            </div>

            <div className="form-group">
              <label className="label">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="Stanford, CA"
              />
            </div>

            <div className="form-group">
              <label className="label">GPA</label>
              <input
                type="text"
                name="gpa"
                value={formData.gpa}
                onChange={handleChange}
                className="input"
                placeholder="3.8/4.0"
              />
            </div>

            <div className="form-group">
              <label className="label">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="input"
                disabled={formData.current}
              />
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="current"
                  checked={formData.current}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Currently studying</span>
              </label>
            </div>

            <div className="form-group md:col-span-2">
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="3"
                placeholder="Relevant coursework, achievements, or activities..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn btn-outline">Cancel</button>
            <button type="submit" className="btn btn-primary flex items-center space-x-2" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Education</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
