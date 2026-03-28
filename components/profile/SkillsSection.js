'use client';

import { useState } from 'react';
import { FaPlus, FaTimes, FaSave, FaCode } from 'react-icons/fa';

export default function SkillsSection({ profile, onSave, onUpdate }) {
  const [skills, setSkills] = useState(profile?.skills || []);
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Technical', level: 3 });
  const [isAdding, setIsAdding] = useState(false);

  const categories = ['Technical', 'Tools', 'Languages', 'Soft Skills', 'Other'];

  const handleAdd = async () => {
    if (!newSkill.name.trim()) return;

    try {
      const res = await fetch('/api/profile/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newSkill, profileId: profile.id, order: skills.length }),
      });

      if (res.ok) {
        setNewSkill({ name: '', category: 'Technical', level: 3 });
        setIsAdding(false);
        onSave();
        onUpdate();
      }
    } catch (error) {
      console.error('Error adding skill:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/profile/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onSave();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Skills</h2>
          <p className="text-gray-600">Add your technical and soft skills</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Skill</span>
        </button>
      </div>

      {isAdding && (
        <div className="card mb-6 animate-slide-down">
          <h3 className="font-bold mb-4">Add New Skill</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="label">Skill Name</label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="input"
                placeholder="React, Python, Leadership..."
              />
            </div>
            <div className="form-group">
              <label className="label">Category</label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Proficiency (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })}
                className="input"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button onClick={() => setIsAdding(false)} className="btn btn-outline">
              Cancel
            </button>
            <button onClick={handleAdd} className="btn btn-primary">
              Add Skill
            </button>
          </div>
        </div>
      )}

      {skills.length === 0 ? (
        <div className="card text-center py-12">
          <FaCode className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No skills added yet</p>
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="card">
              <h3 className="font-bold text-lg mb-4">{category}</h3>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="badge badge-primary text-base px-4 py-2 flex items-center space-x-2 group"
                  >
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span className="text-xs opacity-75">
                        {'★'.repeat(skill.level)}{'☆'.repeat(5 - skill.level)}
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-red-600 hover:text-red-800"
                    >
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
