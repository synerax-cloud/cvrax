'use client';

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaGraduationCap } from 'react-icons/fa';
import EducationModal from './EducationModal';

export default function EducationSection({ profile, onSave, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editingEducation, setEditingEducation] = useState(null);
  const education = profile?.education || [];

  const handleAdd = () => {
    setEditingEducation(null);
    setShowModal(true);
  };

  const handleEdit = (edu) => {
    setEditingEducation(edu);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this education?')) return;

    try {
      const res = await fetch(`/api/profile/education/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onSave();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting education:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Education</h2>
          <p className="text-gray-600">Add your educational background</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Add Education</span>
        </button>
      </div>

      {education.length === 0 ? (
        <div className="card text-center py-12">
          <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No education added yet</p>
          <button onClick={handleAdd} className="btn btn-primary">
            Add Your Education
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="card card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{edu.degree}</h3>
                  <p className="text-primary-600 font-medium">{edu.institution}</p>
                  {edu.field && <p className="text-gray-600">{edu.field}</p>}
                  <p className="text-sm text-gray-600 mt-1">
                    {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate)}
                    {edu.location && ` • ${edu.location}`}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </p>
                  {edu.description && <p className="text-gray-700 mt-3">{edu.description}</p>}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(edu)}
                    className="text-gray-600 hover:text-primary-600 p-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(edu.id)}
                    className="text-gray-600 hover:text-red-600 p-2"
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
        <EducationModal
          education={editingEducation}
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
