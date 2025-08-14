// components/ProjectComponent.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus } from 'lucide-react';
import Cookies from 'js-cookie';
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  selectAllProjects,
  selectProjectsStatus,
  selectProjectsError,
  selectOperationStatus,
  selectOperationError,
  resetOperationStatus
} from '../../../redux/project/project';
import ProjectList from './ProjectList';
import ProjectForm from './ProjectForm';

const ProjectComponent = () => {
  const dispatch = useDispatch();
  const projects = useSelector(selectAllProjects);
  const status = useSelector(selectProjectsStatus);
  const error = useSelector(selectProjectsError);
  const operationStatus = useSelector(selectOperationStatus);
  const operationError = useSelector(selectOperationError);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [uid] = useState(Cookies.get('userUid') || '');

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  useEffect(() => {
    if (operationStatus === 'succeeded') {
      setShowForm(false);
      setEditingProject(null);
      dispatch(resetOperationStatus());
    }
  }, [operationStatus, dispatch]);

  const handleCreate = (projectData) => {
    dispatch(createProject({ ...projectData, created_by: uid }));
  };

  const handleUpdate = (projectData) => {
    dispatch(updateProject({ id: editingProject.id, projectData }));
  };

  const handleDelete = (id) => {
    dispatch(deleteProject(id));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-orange-100 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Project Management</h3>
        <button 
          className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm hover:bg-orange-600"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4 inline mr-1" />
          New Project
        </button>
      </div>

      {showForm && (
        <ProjectForm
          project={editingProject}
          onSubmit={editingProject ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
          operationStatus={operationStatus}
          operationError={operationError}
        />
      )}

      <ProjectList
        projects={projects}
        status={status}
        error={error}
        onEdit={(project) => {
          setEditingProject(project);
          setShowForm(true);
        }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ProjectComponent;