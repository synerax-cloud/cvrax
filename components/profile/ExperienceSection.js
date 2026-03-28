'use client';

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBriefcase } from 'react-icons/fa';
import ExperienceModal from './ExperienceModal';

export default function ExperienceSection({ profile, onSave, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const experiences = profile?.experiences || [];

  const handleAdd = () => {
    setEditingExperience(null);
    setShowModal(true);
  };

  const handleEdit = (exp) => {
    setEditingExperience(exp);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      const res = await fetch(`/api/profile/experience/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        onSave();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <p className="text-gray-600">Add your professional work history</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Add Experience</span>
        </button>
      </div>

      {experiences.length === 0 ? (
        <div className="card text-center py-12">
          <FaBriefcase className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No work experience added yet</p>
          <button onClick={handleAdd} className="btn btn-primary">
            Add Your First Experience
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div key={exp.id} className="card card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{exp.position}</h3>
                  <p className="text-primary-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                    {exp.location && ` • ${exp.location}`}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-3">{exp.description}</p>
                  )}
                  {exp.achievements && JSON.parse(exp.achievements).length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {JSON.parse(exp.achievements).map((achievement, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-start">
                          <span className="text-primary-600 mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(exp)}
                    className="text-gray-600 hover:text-primary-600 p-2"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(exp.id)}
                    className="text-gray-600 hover:text-red-600 p-2"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ExperienceModal
          experience={editingExperience}
          profileId={profile?.id}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            onSave();
            onUpdate();
          }}
        />
      )}
    </div>
  );
}
