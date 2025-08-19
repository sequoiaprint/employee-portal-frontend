import React, { useState, useEffect } from "react";
import { Check, ChevronDown, ClipboardCheck } from "lucide-react";
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProjects,
  selectAllProjects,
} from '../../redux/project/project';

const ProjectSelection = ({ onProjectSelect, selectedProjectId }) => {
  const dispatch = useDispatch();
  const [uid] = useState(Cookies.get('userUid') || '');
  const [open, setOpen] = useState(false);
  const allProjects = useSelector(selectAllProjects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const isUserPartOfProject = (project) => {
    const userUid = uid;
    
    if (project.team_manager_uid === userUid) return true;
    if (project.team_lead_uid === userUid) return true;
    if (project.team_member && project.team_member.split(',').includes(userUid)) return true;
    
    return false;
  };

  const userProjects = allProjects ? allProjects.filter(isUserPartOfProject) : [];

  const projectOptions = [
    { value: "general", label: "General Tasks", type: "General" },
    ...userProjects.map(project => ({
      value: project.id,
      label: project.name,
      type: "Project"
    }))
  ];

  const selectedProject = projectOptions.find(project => 
    String(project.value) === String(selectedProjectId)
  ) || projectOptions[0];

  const handleSelect = (project) => {
    setOpen(false);
    if (onProjectSelect) {
      onProjectSelect(project.value);
      // Store the selected project ID in localStorage
      localStorage.setItem('lastSelectedProjectId', project.value);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg py-6 px-6 shadow-sm">
      <h2 className="flex items-center text-lg font-semibold text-gray-800 mb-4">
        <span className="text-orange-500 mr-2"><ClipboardCheck/></span> 
        Project Selection 
      </h2>
      
      {/* Dropdown */}
      <div className="relative">
        {/* Selected */}
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <span className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selectedProject.type === "Project"
                  ? "bg-orange-100 text-orange-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {selectedProject.type}
            </span>
            {selectedProject.label}
          </span>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>

        {/* Options */}
        {open && (
          <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-10">
            {projectOptions.map((project) => (
              <div
                key={project.value}
                onClick={() => handleSelect(project)}
                className={`cursor-pointer flex items-center justify-between px-4 py-2 text-sm hover:bg-blue-100 ${
                  String(selectedProject.value) === String(project.value)
                    ? "bg-blue-100"
                    : "text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.type === "Project"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {project.type}
                  </span>
                  {project.label}
                </div>
                {String(selectedProject.value) === String(project.value) && (
                  <Check className="w-4 h-4 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSelection;