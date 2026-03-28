'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';

export default function ProjectModal({ project, profileId, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    technologies: [''],
    url: '',
    github: '',
    startDate: '',
    endDate: '',
    highlights: [''],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        technologies: project.technologies ? JSON.parse(project.technologies) : [''],
        url: project.url || '',
        github: project.github || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        highlights: project.highlights ? JSON.parse(project.highlights) : [''],
      });
    }
  }, [project]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    setFormData({ ...formData, [field]: [...formData[field], ''] });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        profileId,
        technologies: JSON.stringify(formData.technologies.filter(t => t.trim())),
        highlights: JSON.stringify(formData.highlights.filter(h => h.trim())),
        order: project?.order || 0,
      };

      const url = project ? `/api/profile/projects/${project.id}` : '/api/profile/projects';
      const res = await fetch(url, {
        method: project ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) onSave();
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{project ? 'Edit Project' : 'Add Project'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="form-group">
            <label className="label">Project Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input"
              required
              placeholder="E-commerce Platform"
            />
          </div>

          <div className="form-group">
            <label className="label">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="4"
              required
              placeholder="A full-stack e-commerce platform built with modern technologies..."
            />
          </div>

          <div className="form-group">
            <label className="label">Technologies Used</label>
            <div className="space-y-2">
              {formData.technologies.map((tech, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => handleArrayChange('technologies', index, e.target.value)}
                    className="input flex-1"
                    placeholder="React, Node.js, MongoDB..."
                  />
                  {formData.technologies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('technologies', index)}
                      className="btn btn-outline text-red-600 p-2"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('technologies')}
                className="btn btn-outline flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add Technology</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label">Live URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="input"
                placeholder="https://project-demo.com"
              />
            </div>

            <div className="form-group">
              <label className="label">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="input"
                placeholder="https://github.com/user/repo"
              />
            </div>

            <div className="form-group">
              <label className="label">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="input"
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
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Key Highlights</label>
            <div className="space-y-2">
              {formData.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => handleArrayChange('highlights', index, e.target.value)}
                    className="input flex-1"
                    placeholder="Achieved 99.9% uptime..."
                  />
                  {formData.highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('highlights', index)}
                      className="btn btn-outline text-red-600 p-2"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('highlights')}
                className="btn btn-outline flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add Highlight</span>
              </button>
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
                  <span>Save Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
