'use client';

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaProjectDiagram, FaExternalLinkAlt, FaGithub } from 'react-icons/fa';
import ProjectModal from './ProjectModal';

export default function ProjectsSection({ profile, onSave, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const projects = profile?.projects || [];

  const handleAdd = () => {
    setEditingProject(null);
    setShowModal(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/profile/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onSave();
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-gray-600">Showcase your best work and side projects</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Add Project</span>
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-12">
          <FaProjectDiagram className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No projects added yet</p>
          <button onClick={handleAdd} className="btn btn-primary">
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="card card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold">{project.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="text-gray-600 hover:text-primary-600 p-1"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="text-gray-600 hover:text-red-600 p-1"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-3">{project.description}</p>

              {project.technologies && JSON.parse(project.technologies).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {JSON.parse(project.technologies).map((tech, idx) => (
                    <span key={idx} className="badge badge-primary text-xs">
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 text-sm">
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                  >
                    <FaExternalLinkAlt />
                    <span>Live Demo</span>
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-700 flex items-center space-x-1"
                  >
                    <FaGithub />
                    <span>Code</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProjectModal
          project={editingProject}
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
