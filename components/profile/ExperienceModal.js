'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';

export default function ExperienceModal({ experience, profileId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [''],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experience) {
      setFormData({
        company: experience.company || '',
        position: experience.position || '',
        location: experience.location || '',
        startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
        endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
        current: experience.current || false,
        description: experience.description || '',
        achievements: experience.achievements ? JSON.parse(experience.achievements) : [''],
      });
    }
  }, [experience]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const addAchievement = () => {
    setFormData({ ...formData, achievements: [...formData.achievements, ''] });
  };

  const removeAchievement = (index) => {
    const newAchievements = formData.achievements.filter((_, i) => i !== index);
    setFormData({ ...formData, achievements: newAchievements });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        profileId,
        achievements: JSON.stringify(formData.achievements.filter(a => a.trim())),
        order: experience?.order || 0,
      };

      const url = experience
        ? `/api/profile/experience/${experience.id}`
        : '/api/profile/experience';
      
      const res = await fetch(url, {
        method: experience ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving experience:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {experience ? 'Edit Experience' : 'Add Experience'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label">Company *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input"
                required
                placeholder="Google"
              />
            </div>

            <div className="form-group">
              <label className="label">Position *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="input"
                required
                placeholder="Senior Software Engineer"
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
                <span className="text-sm text-gray-700">I currently work here</span>
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
                placeholder="Brief description of your role and responsibilities..."
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="label">Key Achievements</label>
              <div className="space-y-3">
                {formData.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <input
                      type="text"
                      value={achievement}
                      onChange={(e) => handleAchievementChange(index, e.target.value)}
                      className="input flex-1"
                      placeholder="Improved system performance by 50%..."
                    />
                    {formData.achievements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="btn btn-outline text-red-600 p-2"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAchievement}
                  className="btn btn-outline flex items-center space-x-2"
                >
                  <FaPlus />
                  <span>Add Achievement</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex items-center space-x-2" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Save Experience</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
